import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Add,
  AutoFixHigh,
  Delete,
  MapOutlined,
  Publish,
  Redo,
  Save,
  Undo,
} from "@mui/icons-material";
import {
  addEdge,
  Background,
  ControlButton,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  SubjectSelector,
  parseSubjectRefs,
  serializeSubjectRefs,
  type SubjectRef,
} from "@/components/identity/SubjectSelector";
import { useSnackbar } from "@/components/SnackbarProvider";
import { useAuthStore } from "@/stores/authStore";
import {
  createReviewTemplateVersion,
  getReviewTemplate,
  getReviewTemplateVersion,
  getReviewTemplateVersions,
  publishReviewTemplateVersion,
  saveReviewTemplateGraph,
  type ReviewTemplateId,
} from "@/api/workflow-templates";
import {
  FlowVersionPicker,
  FlowInteractionModeControls,
  FlowMiniMap,
  FullScreenFlowDesigner,
  StandardFlowNode,
  STANDARD_FLOW_FIT_VIEW_OPTIONS,
  findNearbyFlowNode,
  oppositeFlowDirection,
  type FlowDirection,
  type FlowInteractionMode,
} from "@/components/flow-designer/FlowDesigner";
import {
  WorkflowActionConfig,
  defaultWorkflowButtons,
  type WorkflowButtonConfig,
  type WorkflowButtonEvent,
} from "@/components/flow-designer/WorkflowActionConfig";

type Kind = "START" | "APPROVAL" | "PARALLEL_SPLIT" | "PARALLEL_JOIN" | "END";
type Config = {
  parallelGroupId?: string;
  parallelBranchId?: string;
  approvers?: string;
  approverSubjects?: SubjectRef[];
  returnToEntry?: boolean;
  buttons?: WorkflowButtonConfig[];
  buttonEvents?: WorkflowButtonEvent[];
};
type NodeData = {
  label: string;
  kind: Kind;
  config?: Config;
  editable?: boolean;
  selected?: boolean;
  quickMenuDirection?: FlowDirection | null;
  quickDirections?: FlowDirection[];
  canUseQuickAction?: boolean;
  validationMessage?: string;
  onOpenQuickMenu?: (direction: FlowDirection) => void;
  onQuickAdd?: (direction: FlowDirection, actionId?: string) => void;
};
type FlowNode = Node<NodeData>;
type Version = {
  id: ReviewTemplateId;
  versionNumber: number;
  status: string;
  isCurrent?: boolean;
  nodesJson?: string | null;
  edgesJson?: string | null;
};
type Graph = { nodes: FlowNode[]; edges: Edge[] };

const initialNodes: FlowNode[] = [
  {
    id: "start",
    type: "formProcessNode",
    position: { x: 360, y: 80 },
    data: {
      label: "发起",
      kind: "START",
      config: {},
    },
  },
  {
    id: "end",
    type: "formProcessNode",
    position: { x: 360, y: 470 },
    data: { label: "结束", kind: "END", config: {} },
  },
];
const appearance = {
  START: { color: "#1677c8", background: "#e8f4ff" },
  APPROVAL: { color: "#1677c8", background: "#edf6ff" },
  PARALLEL_SPLIT: { color: "#7b61c9", background: "#f3efff" },
  PARALLEL_JOIN: { color: "#7b61c9", background: "#f3efff" },
  END: { color: "#677386", background: "#eef1f5" },
};
const formProcessNodeSize = (node: FlowNode) =>
  node.data.kind === "START" || node.data.kind === "END"
    ? { width: 96, height: 52 }
    : { width: 148, height: 60 };
const parse = <T,>(value: string | null | undefined, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function approvalNodeConfig(base?: Config): Config {
  const configuredButtons = base?.buttons?.length ? base.buttons : defaultWorkflowButtons("APPROVAL", { includeTransfer: true });
  const normalizedButtons = configuredButtons.map((button) => {
    if (button.action === "TRANSFER") {
      const { requireOpinion: _requireOpinion, ...withoutOpinion } = button;
      return { ...withoutOpinion, visible: true };
    }
    return { ...button, visible: true };
  });
  const buttons = normalizedButtons.some((button) => button.action === "TRANSFER")
    ? normalizedButtons
    : [...normalizedButtons, { id: "transfer", label: "转办", action: "TRANSFER" as const, visible: true, style: "DEFAULT" as const }];
  return {
    ...(base?.parallelGroupId ? { parallelGroupId: base.parallelGroupId } : {}),
    ...(base?.parallelBranchId ? { parallelBranchId: base.parallelBranchId } : {}),
    returnToEntry: true,
    approvers: base?.approvers ?? "",
    ...(base?.approverSubjects ? { approverSubjects: base.approverSubjects } : {}),
    buttons,
    buttonEvents: (base?.buttonEvents ?? []).map((event) => ({ ...event, builtin: "NONE" })),
  };
}

function hasApproverSubjects(config?: Config) {
  return Boolean(
    config?.approverSubjects?.some(
      (subject) => Boolean(subject?.type?.trim() && subject?.id?.trim()),
    ) || parseSubjectRefs(config?.approvers).length,
  );
}

type GraphValidationResult = {
  message: string | null;
  nodeErrors: Record<string, string>;
};

function validatePublishableReviewGraph(nodes: FlowNode[], edges: Edge[]): GraphValidationResult {
  const nodeErrors: Record<string, string> = {};
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Map(nodes.map((node) => [node.id, [] as string[]]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));
  edges.forEach((edge) => {
    if (!byId.has(edge.source) || !byId.has(edge.target) || edge.source === edge.target) return;
    outgoing.get(edge.source)?.push(edge.target);
    incoming.get(edge.target)?.push(edge.source);
  });

  const starts = nodes.filter((node) => node.data.kind === "START");
  const ends = nodes.filter((node) => node.data.kind === "END");
  const approvals = nodes.filter((node) => node.data.kind === "APPROVAL");
  const addError = (node: FlowNode, message: string) => {
    if (!nodeErrors[node.id]) nodeErrors[node.id] = message;
  };

  if (starts.length !== 1) starts.forEach((node) => addError(node, "流程只能有一个发起节点"));
  if (ends.length !== 1) ends.forEach((node) => addError(node, "流程只能有一个结束节点"));
  if (!approvals.length && starts[0]) addError(starts[0], "发布前至少需要一个审批节点");

  nodes.forEach((node) => {
    const inCount = incoming.get(node.id)?.length ?? 0;
    const outCount = outgoing.get(node.id)?.length ?? 0;
    if (node.data.kind === "START" && (inCount !== 0 || outCount !== 1)) {
      addError(node, "发起节点必须且只能有一个出口");
    } else if (node.data.kind === "END" && (inCount !== 1 || outCount !== 0)) {
      addError(node, "结束节点必须且只能有一个入口");
    } else if (node.data.kind === "APPROVAL") {
      if (inCount !== 1 || outCount !== 1) addError(node, "审批节点必须且只能有一个入口和出口");
      else if (!hasApproverSubjects(node.data.config)) addError(node, "审批节点必须配置审批主体");

      const buttons = node.data.config?.buttons ?? [];
      const actions = buttons.map((button) => button.action);
      const requiredActions = ["APPROVE", "RETURN", "TRANSFER"];
      if (requiredActions.some((action) => !actions.includes(action as WorkflowButtonConfig["action"]))
        || actions.length !== requiredActions.length) {
        addError(node, "审批、退回和转办动作必须完整配置");
      } else if (buttons.some((button) => button.visible === false)) {
        addError(node, "系统固定动作不能隐藏");
      }
    } else if (node.data.kind === "PARALLEL_SPLIT" && (inCount !== 1 || outCount < 2)) {
      addError(node, "并行拆分必须有一个入口和至少两个出口");
    } else if (node.data.kind === "PARALLEL_JOIN" && (inCount < 2 || outCount !== 1)) {
      addError(node, "并行聚合必须有至少两个入口和一个出口");
    }
  });

  if (starts.length === 1) {
    const visited = new Set<string>();
    const queue = [starts[0].id];
    while (queue.length) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      queue.push(...(outgoing.get(current) ?? []));
    }
    nodes.filter((node) => !visited.has(node.id)).forEach((node) => addError(node, "该节点未接入发起到结束的完整流程"));
  }

  const firstError = nodes.find((node) => nodeErrors[node.id]);
  return {
    message: firstError ? `${firstError.data.label}：${nodeErrors[firstError.id]}` : null,
    nodeErrors,
  };
}

/** Keep review-template fields; drop leftover form-process fill-permission config. */
function serializeNodesForSave(currentNodes: FlowNode[]) {
  return currentNodes.map((node) => {
    const {
      selected: _selected,
      dragging: _dragging,
      ...persistentNode
    } = node;
    const config = node.data.config ?? {};
    const nextConfig: Config = {
      ...(config.parallelGroupId ? { parallelGroupId: config.parallelGroupId } : {}),
      ...(config.parallelBranchId ? { parallelBranchId: config.parallelBranchId } : {}),
    };
    if (node.data.kind === "APPROVAL") {
      const configuredButtons = (config.buttons?.length
        ? config.buttons
        : defaultWorkflowButtons("APPROVAL", { includeTransfer: true })).map((button) => ({ ...button, visible: true }));
      nextConfig.buttons = !configuredButtons.some((button) => button.action === "TRANSFER")
        ? [...configuredButtons, { id: "transfer", label: "转办", action: "TRANSFER" as const, visible: true, style: "DEFAULT" as const }]
        : configuredButtons;
      nextConfig.buttonEvents = (config.buttonEvents ?? []).map((event) => ({ ...event, builtin: "NONE" }));
    }
    if (node.data.kind === "APPROVAL") {
      nextConfig.returnToEntry = true;
      if (config.approverSubjects?.length) {
        nextConfig.approverSubjects = config.approverSubjects;
        nextConfig.approvers = serializeSubjectRefs(config.approverSubjects);
      } else if (parseSubjectRefs(config.approvers).length) {
        nextConfig.approvers = config.approvers;
      }
    }
    return {
      ...persistentNode,
      data: {
        ...node.data,
        config: nextConfig,
      },
    };
  });
}

function FormProcessNode({ id, data }: NodeProps<FlowNode>) {
  const handleDirections: FlowDirection[] =
    data.kind === "START"
      ? ["bottom"]
      : data.kind === "APPROVAL"
        ? ["top", "right", "bottom", "left"]
        : ["top", "bottom"];
  const restrictedHandles = data.kind === "PARALLEL_SPLIT" || data.kind === "PARALLEL_JOIN";
  const arrowDirections: FlowDirection[] =
    data.quickDirections ??
    handleDirections;
  return (
    <StandardFlowNode
      id={id}
      label={data.label}
      caption={
        data.kind === "START"
          ? "申请入口"
          : data.kind === "APPROVAL"
            ? "任一审批人完成"
            : data.kind === "PARALLEL_SPLIT"
              ? "并行分支"
              : data.kind === "PARALLEL_JOIN"
                ? "等待分支汇聚"
                : "流程完成"
      }
      appearance={appearance[data.kind]}
      width={data.kind === "START" || data.kind === "END" ? 96 : 148}
      height={data.kind === "START" || data.kind === "END" ? 52 : 60}
      boundary={data.kind !== "APPROVAL" && data.kind !== "PARALLEL_SPLIT" && data.kind !== "PARALLEL_JOIN"}
      start={data.kind === "START"}
      end={data.kind === "END"}
      editable={Boolean(data.editable)}
      selected={Boolean(data.selected)}
      quickDirections={handleDirections}
      quickArrowDirections={arrowDirections}
      quickMenuDirection={data.quickMenuDirection}
      quickActions={[
        {
          id: "APPROVAL",
          label: "审批节点",
          icon: <Publish fontSize="small" />,
        },
        ...(data.kind === "START" ||
          (data.kind === "APPROVAL" && !data.config?.parallelGroupId) ||
          data.kind === "PARALLEL_JOIN"
          ? [{ id: "PARALLEL_APPROVAL", label: "并行审批", icon: <Publish fontSize="small" />, directions: ["bottom"] as FlowDirection[] }]
          : []),
      ]}
      canUseQuickAction={Boolean(data.canUseQuickAction)}
      onOpenQuickMenu={(direction) => data.onOpenQuickMenu?.(direction)}
      onQuickAdd={(direction, actionId) => data.onQuickAdd?.(direction, actionId)}
      targetDirections={
        data.kind === "START"
          ? []
          : data.kind === "PARALLEL_SPLIT" || data.kind === "PARALLEL_JOIN"
            ? ["top"]
            : ["top", "right", "bottom", "left"]
      }
      sourceDirections={
        data.kind === "END"
          ? []
          : data.kind === "PARALLEL_SPLIT" || data.kind === "PARALLEL_JOIN"
            ? ["bottom"]
            : ["top", "right", "bottom", "left"]
      }
      handlesConnectable={!restrictedHandles}
      validationMessage={data.validationMessage}
    />
  );
}
const nodeTypes = { formProcessNode: FormProcessNode };

export default function ReviewTemplateEditor() {
  const { id = "" } = useParams();
  const processId = id as ReviewTemplateId;
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const queryClient = useQueryClient();
  const canAccess = useAuthStore((state) => state.hasPermission("workflow.review-templates"));
  const canEdit = useAuthStore((state) => state.hasPermission("workflow.template.edit"));
  const canPublish = useAuthStore((state) => state.hasPermission("workflow.template.publish"));
  const [selectedVersionId, setSelectedVersionId] =
    useState<ReviewTemplateId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPanelTab, setSelectedPanelTab] = useState<"property" | "buttons">("property");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [interactionMode, setInteractionMode] =
    useState<FlowInteractionMode>("pan");
  const [dirty, setDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<
    "close" | "switch" | "publish" | "deleteParallel" | null
  >(null);
  const [pendingParallelGroupId, setPendingParallelGroupId] = useState<string | null>(null);
  const [pendingVersionId, setPendingVersionId] =
    useState<ReviewTemplateId | null>(null);
  const [menu, setMenu] = useState<{
    nodeId: string;
    direction: FlowDirection;
  } | null>(null);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  const undoRef = useRef<Graph[]>([]);
  const redoRef = useRef<Graph[]>([]);
  const skipGraphResetRef = useRef<{
    id: string;
    nodesJson?: string | null;
    edgesJson?: string | null;
  } | null>(null);
  const dragRef = useRef<Graph | null>(null);
  const initialVersionAttempted = useRef(false);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const flowInstanceRef = useRef<{ fitView: (options?: { padding?: number; duration?: number }) => void } | null>(null);
  const definition = useQuery({
    queryKey: ["review-template", processId],
    queryFn: async () =>
      (await getReviewTemplate(processId)).data.data as {
        name: string;
        code?: string | null;
      },
    enabled: canAccess,
  });
  const versions = useQuery({
    queryKey: ["review-template-versions", processId],
    queryFn: async () =>
      (await getReviewTemplateVersions(processId)).data.data as Version[],
    enabled: canAccess,
  });
  const summary = useMemo(() => {
    const list = versions.data ?? [];
    return (
      list.find((item) => item.status === "DRAFT") ??
      list.find((item) => item.isCurrent) ??
      list[0] ??
      null
    );
  }, [versions.data]);
  const selectedSummary =
    (versions.data ?? []).find(
      (item) => String(item.id) === String(selectedVersionId),
    ) ?? summary;
  const versionQuery = useQuery({
    queryKey: ["review-template-version", processId, selectedSummary?.id],
    enabled: Boolean(selectedSummary?.id),
    queryFn: async () =>
      (await getReviewTemplateVersion(processId, selectedSummary!.id)).data
        .data as Version,
  });
  const selectedVersion = versionQuery.data ?? selectedSummary;
  const editable = selectedVersion?.status === "DRAFT" && canEdit;
  useEffect(() => {
    if (
      versions.isSuccess &&
      !(versions.data ?? []).length &&
      canEdit &&
      !initialVersionAttempted.current
    ) {
      initialVersionAttempted.current = true;
      createReviewTemplateVersion(processId)
        .then(() => Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["review-template-versions", processId],
          }),
          queryClient.invalidateQueries({ queryKey: ["review-templates"] }),
        ]))
        .catch(() => showMessage("初始化草稿失败", "error"));
    }
  }, [versions.isSuccess, versions.data, processId, queryClient, showMessage, canEdit]);
  useEffect(() => {
    if (!selectedVersion) return;
    const skipReset = skipGraphResetRef.current;
    if (skipReset) {
      skipGraphResetRef.current = null;
      if (
        String(skipReset.id) === String(selectedVersion.id) &&
        skipReset.nodesJson === selectedVersion.nodesJson &&
        skipReset.edgesJson === selectedVersion.edgesJson
      )
        return;
    }
    const parsedNodes = parse<FlowNode[]>(
      selectedVersion.nodesJson,
      initialNodes,
    );
    // 旧草稿可能尚未保存转办按钮，或仍带有已取消的开始节点按钮；
    // 打开审批流程时统一归一化，避免配置面板与发布校验看到不同语义。
    const loadedNodes = parsedNodes.map((node) => {
      if (node.data.kind === "APPROVAL") {
        return { ...node, type: "formProcessNode", data: { ...node.data, config: approvalNodeConfig(node.data.config) } };
      }
      if (node.data.kind === "START") {
        return { ...node, type: "formProcessNode", data: { ...node.data, config: {} } };
      }
      return { ...node, type: "formProcessNode" };
    });
    setNodes(loadedNodes);
    setEdges(
      parse<Edge[]>(selectedVersion.edgesJson, []).map((edge, index) => ({
        ...edge,
        id: edge.id || `${edge.source}-${edge.target}-${index}`,
      })),
    );
    // 版本数据刷新时保持仍存在的选中节点，保存草稿不打断当前配置。
    setSelectedNodeId((current) =>
      current && loadedNodes.some((node) => node.id === current)
        ? current
        : "start",
    );
    setDirty(false);
    setValidationErrors({});
    undoRef.current = [];
    redoRef.current = [];
    setHistory({ undo: 0, redo: 0 });
  }, [
    selectedVersion?.id,
    selectedVersion?.nodesJson,
    selectedVersion?.edgesJson,
    setNodes,
    setEdges,
  ]);
  const graph = (): Graph => ({
    nodes: clone(nodesRef.current),
    edges: clone(edgesRef.current),
  });
  const record = (before: Graph) => {
    undoRef.current = [...undoRef.current.slice(-49), clone(before)];
    redoRef.current = [];
    setHistory({ undo: undoRef.current.length, redo: 0 });
  };
  const apply = (next: Graph, before?: Graph) => {
    if (before) record(before);
    setNodes(clone(next.nodes));
    setEdges(clone(next.edges));
    setDirty(true);
    setValidationErrors({});
  };
  const undo = () => {
    if (!editable || !undoRef.current.length) return;
    const previous = undoRef.current.pop()!;
    redoRef.current.push(graph());
    apply(previous);
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
  };
  const redo = () => {
    if (!editable || !redoRef.current.length) return;
    const next = redoRef.current.pop()!;
    undoRef.current.push(graph());
    apply(next);
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
  };
  const updateNodeData = (
    nodeId: string,
    patch: Partial<NodeData>,
    configPatch?: Partial<Config>,
  ) => {
    if (!editable) return;
    const before = graph();
    const next = graph();
    next.nodes = next.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              ...patch,
              config: { ...node.data.config, ...configPatch },
            },
          }
        : node,
    );
    apply(next, before);
  };
  const addApproval = (
    sourceId?: string,
    direction: FlowDirection = "bottom",
    insertAfterSource = false,
  ) => {
    if (!editable) return;
    const before = graph();
    const source = before.nodes.find((node) => node.id === sourceId);
    const id = `approval-${Date.now()}`;
    const position = source
      ? {
          x:
            source.position.x +
            (direction === "right" ? 190 : direction === "left" ? -190 : 0),
          y:
            source.position.y +
            (direction === "bottom" ? 130 : direction === "top" ? -130 : 0),
        }
      : { x: 360, y: 250 };
    const node: FlowNode = {
      id,
      type: "formProcessNode",
      position,
      data: {
        label: "审批",
        kind: "APPROVAL",
        config: approvalNodeConfig(
          source?.data.config?.parallelBranchId
            ? { parallelGroupId: source.data.config.parallelGroupId, parallelBranchId: source.data.config.parallelBranchId }
            : undefined,
        ),
      },
    };
    const next: Graph = {
      nodes: [...before.nodes, node],
      edges: [...before.edges],
    };
    const outgoing =
      source && direction === "bottom" && insertAfterSource
        ? next.edges.find((edge) => edge.source === source.id)
        : undefined;
    const outgoingTarget = outgoing
      ? before.nodes.find((candidate) => candidate.id === outgoing.target)
      : undefined;
    if (outgoingTarget) {
      next.nodes = next.nodes.map((candidate) =>
        candidate.id !== id && candidate.position.y >= outgoingTarget.position.y
          ? {
              ...candidate,
              position: { ...candidate.position, y: candidate.position.y + 130 },
            }
          : candidate,
      );
    }
    if (outgoing)
      next.edges = next.edges.filter((edge) => edge.id !== outgoing.id);
    if (source) {
      next.edges = addEdge(
        {
          id:
            direction === "top" ? `${id}-${source.id}` : `${source.id}-${id}`,
          source: direction === "top" ? id : source.id,
          sourceHandle:
            direction === "top" ? "source-bottom" : `source-${direction}`,
          target: direction === "top" ? source.id : id,
          targetHandle:
            direction === "top"
              ? "target-top"
              : `target-${oppositeFlowDirection[direction]}`,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
          data: source.data.config?.parallelGroupId
            ? { parallelGroupId: source.data.config.parallelGroupId }
            : undefined,
        },
        next.edges,
      );
      if (outgoing)
        next.edges = addEdge(
          {
            id: `${id}-${outgoing.target}`,
            source: id,
            sourceHandle: "source-bottom",
            target: outgoing.target,
            targetHandle: outgoing.targetHandle ?? "target-top",
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
            data: outgoing.data,
          },
          next.edges,
        );
    }
    apply(next, before);
    setSelectedNodeId(id);
    setMenu(null);
  };
  const addParallelGroup = (
    sourceId?: string,
    direction: FlowDirection = "bottom",
    insertAfterSource = false,
  ) => {
    if (!editable) return;
    const before = graph();
    const stamp = Date.now();
    const groupId = `parallel-${stamp}`;
    const splitId = `${groupId}-split`;
    const leftId = `${groupId}-approval-a`;
    const rightId = `${groupId}-approval-b`;
    const joinId = `${groupId}-join`;
    const approvalConfig: Config = approvalNodeConfig({ parallelGroupId: groupId });
    const anchor = sourceId ? before.nodes.find((node) => node.id === sourceId) : null;
    const baseX = anchor ? anchor.position.x : 360;
    const baseY = anchor ? anchor.position.y + (direction === "top" ? -300 : 130) : 210;
    const groupNodes: FlowNode[] = [
      { id: splitId, type: "formProcessNode", position: { x: baseX, y: baseY }, data: { label: "并行拆分", kind: "PARALLEL_SPLIT", config: { parallelGroupId: groupId } } },
      { id: leftId, type: "formProcessNode", position: { x: baseX - 170, y: baseY + 130 }, data: { label: "审批分支 A", kind: "APPROVAL", config: { ...approvalConfig, parallelBranchId: `${groupId}-branch-a` } } },
      { id: rightId, type: "formProcessNode", position: { x: baseX + 170, y: baseY + 130 }, data: { label: "审批分支 B", kind: "APPROVAL", config: { ...approvalConfig, parallelBranchId: `${groupId}-branch-b` } } },
      { id: joinId, type: "formProcessNode", position: { x: baseX, y: baseY + 270 }, draggable: false, data: { label: "并行聚合", kind: "PARALLEL_JOIN", config: { parallelGroupId: groupId } } },
    ];
    const groupEdge = (source: string, target: string, suffix: string): Edge => ({
      id: `${groupId}-${suffix}`,
      source,
      target,
      sourceHandle: "source-bottom",
      targetHandle: "target-top",
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
      data: { parallelGroupId: groupId },
    });
    const groupEdges = [
      groupEdge(splitId, leftId, "split-a"),
      groupEdge(splitId, rightId, "split-b"),
      groupEdge(leftId, joinId, "a-join"),
      groupEdge(rightId, joinId, "b-join"),
    ];
    const outgoing =
      anchor && direction === "bottom" && insertAfterSource
        ? before.edges.find((edge) => edge.source === anchor.id)
        : undefined;
    const nextEdges = [
      ...before.edges.filter((edge) => edge.id !== outgoing?.id),
      ...groupEdges,
    ];
    if (anchor) {
      const targetEdge = { source: anchor.id, target: splitId, sourceHandle: "source-bottom", targetHandle: "target-top" };
      nextEdges.push({ id: `${groupId}-anchor`, ...targetEdge, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" }, data: { parallelGroupId: groupId } });
      if (outgoing)
        nextEdges.push({
          id: `${joinId}-${outgoing.target}`,
          source: joinId,
          sourceHandle: "source-bottom",
          target: outgoing.target,
          targetHandle: outgoing.targetHandle ?? "target-top",
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
        });
    }
    const shiftedNodes = before.nodes.map((node) => {
      if (!anchor || node.position.y < baseY) return node;
      return { ...node, position: { ...node.position, y: node.position.y + 330 } };
    });
    apply({ nodes: [...shiftedNodes, ...groupNodes], edges: nextEdges }, before);
    setSelectedNodeId(leftId);
    setMenu(null);
    requestAnimationFrame(() => flowInstanceRef.current?.fitView({ ...STANDARD_FLOW_FIT_VIEW_OPTIONS, duration: 180 }));
  };
  const addParallelBranch = (groupId: string) => {
    if (!editable) return;
    const before = graph();
    const groupNodes = before.nodes.filter((node) => node.data.config?.parallelGroupId === groupId);
    const split = groupNodes.find((node) => node.data.kind === "PARALLEL_SPLIT");
    const join = groupNodes.find((node) => node.data.kind === "PARALLEL_JOIN");
    if (!split || !join) return;
    const branches = groupNodes.filter((node) => node.data.kind === "APPROVAL");
    const id = `${groupId}-approval-${String.fromCharCode(65 + branches.length)}`;
    const config = approvalNodeConfig({ parallelGroupId: groupId });
    const nextBranch: FlowNode = {
      id,
      type: "formProcessNode",
      position: { x: split.position.x, y: split.position.y + 130 },
      data: { label: `审批分支 ${String.fromCharCode(65 + branches.length)}`, kind: "APPROVAL", config: { ...config, parallelGroupId: groupId, parallelBranchId: `${groupId}-branch-${branches.length}` } },
    };
    const nextNodes = [...before.nodes, nextBranch].map((node) => {
      if (node.data.config?.parallelGroupId !== groupId || node.data.kind !== "APPROVAL") return node;
      const all = [...branches, nextBranch];
      const index = all.findIndex((branch) => branch.id === node.id);
      const spacing = 190;
      return { ...node, position: { x: split.position.x + (index - (all.length - 1) / 2) * spacing, y: split.position.y + 130 } };
    });
    const edge = (source: string, target: string, suffix: string): Edge => ({ id: `${groupId}-${suffix}`, source, target, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" }, data: { parallelGroupId: groupId } });
    apply({ nodes: nextNodes, edges: [...before.edges, edge(split.id, id, `split-${id}`), edge(id, join.id, `${id}-join`)] }, before);
    setSelectedNodeId(id);
    requestAnimationFrame(() => flowInstanceRef.current?.fitView({ ...STANDARD_FLOW_FIT_VIEW_OPTIONS, duration: 180 }));
  };
  const connectNearby = (sourceId: string, direction: FlowDirection) => {
    const before = graph();
    const source = before.nodes.find((node) => node.id === sourceId);
    if (!editable || !source) return false;
    const stamp = Date.now();
    if (direction === "top") {
      // 上箭头表示“接入上方节点”：上方节点 → 当前节点。
      // 若上方节点已有后继，则把当前节点插入两者之间，保持线性流程不断链。
      if (before.edges.some((edge) => edge.target === sourceId)) return false;
      const predecessor = findNearbyFlowNode({
        sourceNode: source,
        nodes: before.nodes,
        direction,
        getSize: formProcessNodeSize,
        isCandidate: (node) =>
          node.data.kind !== "END" &&
          !before.edges.some(
            (edge) => edge.source === node.id && edge.target === sourceId,
          ),
      });
      if (!predecessor) return false;
      const outgoing = before.edges.find(
        (edge) => edge.source === predecessor.id,
      );
      if (outgoing && before.edges.some((edge) => edge.source === sourceId))
        return false;
      const next: Graph = {
        nodes: before.nodes,
        edges: outgoing
          ? before.edges.filter((edge) => edge.id !== outgoing.id)
          : [...before.edges],
      };
      next.edges = addEdge(
        {
          id: `${predecessor.id}-${source.id}-${stamp}`,
          source: predecessor.id,
          sourceHandle: outgoing?.sourceHandle ?? "source-bottom",
          target: source.id,
          targetHandle: "target-top",
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
        },
        next.edges,
      );
      if (outgoing)
        next.edges = addEdge(
          {
            id: `${source.id}-${outgoing.target}-${stamp}`,
            source: source.id,
            sourceHandle: "source-bottom",
            target: outgoing.target,
            targetHandle: outgoing.targetHandle ?? "target-top",
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
          },
          next.edges,
        );
      apply(next, before);
      setMenu(null);
      return true;
    }
    if (before.edges.some((edge) => edge.source === sourceId)) return false;
    const target = findNearbyFlowNode({
      sourceNode: source,
      nodes: before.nodes,
      direction,
      getSize: formProcessNodeSize,
      isCandidate: (node) =>
        node.data.kind !== "START" &&
        !before.edges.some(
          (edge) =>
            (direction !== "bottom" && edge.target === node.id) ||
            (edge.source === node.id && edge.target === sourceId),
        ),
    });
    if (!target) return false;
    // 下箭头且下方节点已有前驱时，把当前节点插入两者之间。
    const incoming =
      direction === "bottom"
        ? before.edges.find((edge) => edge.target === target.id)
        : undefined;
    if (incoming && before.edges.some((edge) => edge.target === sourceId))
      return false;
    const next: Graph = {
      nodes: before.nodes,
      edges: incoming
        ? before.edges.filter((edge) => edge.id !== incoming.id)
        : [...before.edges],
    };
    if (incoming)
      next.edges = addEdge(
        {
          id: `${incoming.source}-${source.id}-${stamp}`,
          source: incoming.source,
          sourceHandle: incoming.sourceHandle ?? "source-bottom",
          target: source.id,
          targetHandle: "target-top",
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
        },
        next.edges,
      );
    next.edges = addEdge(
      {
        id: `${source.id}-${target.id}-${stamp}`,
        source: source.id,
        sourceHandle: incoming ? "source-bottom" : `source-${direction}`,
        target: target.id,
        targetHandle: incoming
          ? (incoming.targetHandle ?? "target-top")
          : `target-${oppositeFlowDirection[direction]}`,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
      },
      next.edges,
    );
    apply(next, before);
    setMenu(null);
    return true;
  };
  const addApprovalToParallelBranch = (sourceId: string) => {
    if (!editable) return false;
    const before = graph();
    const source = before.nodes.find((node) => node.id === sourceId);
    const groupId = source?.data.config?.parallelGroupId;
    const branchId = source?.data.config?.parallelBranchId;
    const join = before.nodes.find((node) => node.data.kind === "PARALLEL_JOIN" && node.data.config?.parallelGroupId === groupId);
    const outgoing = before.edges.find((edge) => edge.source === sourceId && edge.target === join?.id);
    if (!source || !groupId || !branchId || !join || !outgoing) return false;
    const id = `approval-${Date.now()}`;
    const node: FlowNode = { id, type: "formProcessNode", position: { x: source.position.x, y: source.position.y + 120 }, data: { label: "审批", kind: "APPROVAL", config: { ...(source.data.config ?? {}), parallelGroupId: groupId, parallelBranchId: branchId } } };
    const nextNodes = before.nodes.map((item) => item.id === join.id ? { ...item, position: { ...item.position, y: item.position.y + 120 } } : item);
    const nextEdges = before.edges.filter((edge) => edge.id !== outgoing.id);
    const edge = (from: string, to: string) => ({ id: `${from}-${to}`, source: from, target: to, sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep" as const, markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" }, data: { parallelGroupId: groupId } });
    nextEdges.push(edge(sourceId, id), edge(id, join.id));
    apply({ nodes: [...nextNodes, node], edges: nextEdges }, before);
    setSelectedNodeId(id);
    setMenu(null);
    requestAnimationFrame(() => flowInstanceRef.current?.fitView({ ...STANDARD_FLOW_FIT_VIEW_OPTIONS, duration: 180 }));
    return true;
  };
  const selectedToolbarSource = nodes.find(
    (node) => node.id === (selectedNodeId ?? "start"),
  );
  const canAddApprovalFromToolbar =
    editable &&
    Boolean(selectedToolbarSource) &&
    selectedToolbarSource?.data.kind !== "END" &&
    selectedToolbarSource?.data.kind !== "PARALLEL_SPLIT";
  const canAddParallelFromToolbar =
    canAddApprovalFromToolbar &&
    !selectedToolbarSource?.data.config?.parallelGroupId;
  const addApprovalFromToolbar = () => {
    const source = selectedToolbarSource ?? nodes.find((node) => node.id === "start");
    if (!source || source.data.kind === "END" || source.data.kind === "PARALLEL_SPLIT") {
      showMessage("请先选择可继续向下配置的节点", "warning");
      return;
    }
    if (source.data.config?.parallelBranchId && addApprovalToParallelBranch(source.id))
      return;
    addApproval(source.id, "bottom", true);
  };
  const addParallelFromToolbar = () => {
    const source = selectedToolbarSource ?? nodes.find((node) => node.id === "start");
    if (
      !source ||
      source.data.kind === "END" ||
      source.data.kind === "PARALLEL_SPLIT" ||
      Boolean(source.data.config?.parallelGroupId)
    ) {
      showMessage("请选择并行组外可继续向下配置的节点", "warning");
      return;
    }
    addParallelGroup(source.id, "bottom", true);
  };
  const addEdgeSafe = (connection: Connection) => {
    if (
      !editable ||
      !connection.source ||
      !connection.target ||
      connection.source === connection.target
    )
      return;
    const before = graph();
    const sourceNode = before.nodes.find((node) => node.id === connection.source);
    const targetNode = before.nodes.find((node) => node.id === connection.target);
    if (before.edges.some((edge) => edge.source === connection.source && sourceNode?.data.kind !== "PARALLEL_SPLIT") ||
        before.edges.some((edge) => edge.target === connection.target && targetNode?.data.kind !== "PARALLEL_JOIN"))
      return;
    apply(
      {
        nodes: before.nodes,
        edges: addEdge(
          {
            ...connection,
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
          },
          before.edges,
        ),
      },
      before,
    );
  };
  const removeSelected = () => {
    if (!editable) return;
    const selectedNode = selectedNodeId
      ? graph().nodes.find((node) => node.id === selectedNodeId)
      : null;
    const selectedEdge = selectedEdgeId
      ? graph().edges.find((edge) => edge.id === selectedEdgeId)
      : null;
    const parallelGroupId = selectedNode?.data.config?.parallelGroupId
      ?? (selectedEdge?.data?.parallelGroupId as string | undefined);
    if (parallelGroupId) {
      setPendingParallelGroupId(parallelGroupId);
      setConfirmation("deleteParallel");
      return;
    }
    if (
      selectedNodeId &&
      selectedNodeId !== "start" &&
      selectedNodeId !== "end"
    ) {
      const before = graph();
      apply(
        {
          nodes: before.nodes.filter((node) => node.id !== selectedNodeId),
          edges: before.edges.filter(
            (edge) =>
              edge.source !== selectedNodeId && edge.target !== selectedNodeId,
          ),
        },
        before,
      );
      setSelectedNodeId(null);
      setMenu(null);
      return;
    }
    if (selectedEdgeId) {
      const before = graph();
      apply(
        {
          nodes: before.nodes,
          edges: before.edges.filter((edge) => edge.id !== selectedEdgeId),
        },
        before,
      );
      setSelectedEdgeId(null);
    }
  };
  const removeParallelGroup = (groupId: string) => {
    const before = graph();
    const removedIds = new Set(before.nodes
      .filter((node) => node.data.config?.parallelGroupId === groupId)
      .map((node) => node.id));
    apply({
      nodes: before.nodes.filter((node) => !removedIds.has(node.id)),
      edges: before.edges.filter((edge) =>
        edge.data?.parallelGroupId !== groupId
        && !removedIds.has(edge.source)
        && !removedIds.has(edge.target)),
    }, before);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPendingParallelGroupId(null);
    setConfirmation(null);
  };
  const handleCanvasKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!editable) return;
    const target = event.target as HTMLElement;
    if (
      target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    )
      return;
    const modifier = event.metaKey || event.ctrlKey;
    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
      return;
    }
    if (modifier && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeSelected();
    }
  };
  const autoLayout = () => {
    if (!editable) return;
    const before = graph();
    const next = graph();
    const start = next.nodes.find((node) => node.data.kind === "START");
    const layoutCenterX = start
      ? start.position.x + formProcessNodeSize(start).width / 2
      : 408;
    next.nodes = [...next.nodes]
      .sort((a, b) =>
        a.id === "start"
          ? -1
          : b.id === "start"
            ? 1
            : a.id === "end"
              ? 1
              : b.id === "end"
                ? -1
                : a.position.y - b.position.y,
      )
      .map((node, index) => ({
        ...node,
        position: {
          x: layoutCenterX - formProcessNodeSize(node).width / 2,
          y: 70 + index * 125,
        },
      }));
    apply(next, before);
  };
  const save = useMutation({
    mutationFn: () =>
      saveReviewTemplateGraph(processId, selectedVersion!.id, {
        nodes: serializeNodesForSave(nodes),
        edges,
      }),
    onSuccess: (response) => {
      // 保存后只同步缓存、提示成功，不重置画布：保留当前选中节点、
      // 面板状态和撤销历史，便于用户继续配置。
      const saved = response.data.data as Version;
      skipGraphResetRef.current = {
        id: String(saved.id),
        nodesJson: saved.nodesJson,
        edgesJson: saved.edgesJson,
      };
      queryClient.setQueryData<Version>(
        ["review-template-version", processId, saved.id],
        saved,
      );
      setDirty(false);
      queryClient.invalidateQueries({
        queryKey: ["review-template-versions", processId],
      });
      queryClient.invalidateQueries({ queryKey: ["review-templates"] });
      showMessage("草稿已保存");
    },
    onError: (error) =>
      showMessage(error instanceof Error ? error.message : "保存失败", "error"),
  });
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) {
        await saveReviewTemplateGraph(processId, selectedVersion!.id, {
          nodes: serializeNodesForSave(nodes),
          edges,
        });
      }
      return publishReviewTemplateVersion(processId, selectedVersion!.id);
    },
    onSuccess: () => {
      setDirty(false);
      setSelectedVersionId(null);
      setConfirmation(null);
      queryClient.invalidateQueries({
        queryKey: ["review-template-versions", processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["review-template-version", processId],
      });
      queryClient.invalidateQueries({ queryKey: ["review-templates"] });
      showMessage("审批流程已发布");
    },
    onError: (error) =>
      showMessage(error instanceof Error ? error.message : "发布失败", "error"),
  });
  const close = () => {
    if (dirty) setConfirmation("close");
    else navigate("/workflow/review-templates");
  };
  const selectVersion = (versionId: ReviewTemplateId) => {
    skipGraphResetRef.current = null;
    if (String(versionId) === String(selectedVersion?.id)) return;
    if (dirty) {
      setPendingVersionId(versionId);
      setConfirmation("switch");
    } else setSelectedVersionId(versionId);
  };
  const selected = nodes.find((node) => node.id === selectedNodeId) ?? null;
  useEffect(() => {
    if (
      selected &&
      selected.data.kind !== "APPROVAL" &&
      selectedPanelTab !== "property"
    ) {
      setSelectedPanelTab("property");
    }
  }, [selected, selectedPanelTab]);
  const decoratedNodes = nodes.map((node) => {
    const hasOutgoing = edges.some((edge) => edge.source === node.id);
    const hasIncoming = edges.some((edge) => edge.target === node.id);
    const isParallelApproval =
      node.data.kind === "APPROVAL" &&
      Boolean(node.data.config?.parallelGroupId);
    const quickDirections: FlowDirection[] =
      node.data.kind === "START"
        ? hasOutgoing
          ? []
          : ["bottom"]
        : node.data.kind === "APPROVAL"
          ? isParallelApproval
            ? [
                ...(hasIncoming ? [] : (["top"] as FlowDirection[])),
                ...(["bottom"] as FlowDirection[]),
              ]
            : (["top", "right", "bottom", "left"] as FlowDirection[])
          : node.data.kind === "PARALLEL_JOIN"
            ? hasOutgoing
              ? []
              : ["bottom"]
          : [];
    return {
      ...node,
      draggable: editable,
      data: {
        ...node.data,
        editable,
        selected: Boolean(node.selected || node.id === selectedNodeId),
        quickMenuDirection: menu?.nodeId === node.id ? menu.direction : null,
        quickDirections,
        canUseQuickAction: editable && quickDirections.length > 0,
        validationMessage: validationErrors[node.id],
        onOpenQuickMenu: (direction: FlowDirection) => {
          if (node.data.kind === "START" && direction === "bottom") {
            setMenu({ nodeId: node.id, direction });
          } else if (!connectNearby(node.id, direction)) {
            setMenu({ nodeId: node.id, direction });
          }
        },
        onQuickAdd: (direction: FlowDirection, actionId?: string) => {
          if (actionId === "PARALLEL_APPROVAL" && isParallelApproval) {
            showMessage("并行分支内暂不支持嵌套并行审批", "warning");
            setMenu(null);
          } else if (actionId === "PARALLEL_APPROVAL") addParallelGroup(node.id, direction);
          else if (direction === "bottom" && addApprovalToParallelBranch(node.id)) return;
          else {
            const occupied = direction === "top" ? hasIncoming : hasOutgoing;
            if (occupied) {
              showMessage(
                direction === "top"
                  ? "该节点已有进入连线，不能重复连接"
                  : "普通节点只能有一条出去连线，当前节点已有出去连线",
                "warning",
              );
              setMenu(null);
              return;
            }
            addApproval(node.id, direction);
          }
        },
      },
    };
  }) as FlowNode[];
  const confirmationMessage =
    confirmation === "publish"
      ? "发布后当前版本只读，系统会自动创建下一草稿版本。确认发布吗？"
      : confirmation === "switch"
        ? "当前草稿尚有未保存的修改，确认放弃修改并切换流程版本吗？"
        : confirmation === "deleteParallel"
          ? "将同时删除并行拆分、两个审批分支、并行聚合及组内连线，确认继续吗？"
        : "当前草稿尚有未保存的修改，确认不保存并关闭吗？";
  if (!canAccess) {
    return <Box sx={{ p: 3, color: "#606266" }}>无权访问审批流程。</Box>;
  }
  if (definition.isLoading || versions.isLoading) {
    return <Box sx={{ p: 3, color: "#606266" }}>正在加载流程配置...</Box>;
  }
  if (definition.isError || versions.isError) {
    return <Box sx={{ p: 3, color: "#c62828" }}>流程配置加载失败，请返回列表后重试。</Box>;
  }
  return (
    <FullScreenFlowDesigner
      title="配置审批流程"
      subject={`${definition.data?.name || "审批流程"}${definition.data?.code ? ` / ${definition.data.code}` : ""}`}
      headerContent={
        <FlowVersionPicker
          currentVersion={
            (versions.data ?? []).find((item) => item.isCurrent) ?? null
          }
          draftVersion={
            (versions.data ?? []).find((item) => item.status === "DRAFT") ??
            null
          }
          historicalVersions={(versions.data ?? []).filter(
            (item) => item.status !== "DRAFT" && !item.isCurrent,
          )}
          selectedVersion={selectedVersion}
          onSelect={selectVersion}
        />
      }
      onClose={close}
      actions={
        selectedVersion?.status === "DRAFT" && (canEdit || canPublish) ? (
          <>
            {canEdit ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Save />}
                onClick={() => save.mutate()}
                disabled={!dirty || save.isPending}
              >
                保存草稿
              </Button>
            ) : null}
            {canPublish ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<Publish />}
                onClick={() => {
                  const result = validatePublishableReviewGraph(nodes, edges);
                  setValidationErrors(result.nodeErrors);
                  if (result.message) {
                    const firstInvalidNode = nodes.find((node) => result.nodeErrors[node.id]);
                    if (firstInvalidNode) {
                      setSelectedNodeId(firstInvalidNode.id);
                      setSelectedEdgeId(null);
                    }
                    showMessage(result.message, "error");
                    return;
                  }
                  setConfirmation("publish");
                }}
                disabled={publish.isPending}
              >
                发布
              </Button>
            ) : null}
          </>
        ) : (
          <Chip size="small" label={selectedVersion?.status === "DRAFT" ? "草稿版本只读" : "已发布版本只读"} color={selectedVersion?.status === "DRAFT" ? "default" : "success"} />
        )
      }
      overlays={
        <ConfirmDialog
          open={Boolean(confirmation)}
          title={
            confirmation === "publish"
              ? "发布审批流程"
              : confirmation === "switch"
                ? "切换流程版本"
                : confirmation === "deleteParallel"
                  ? "删除并行审批组"
                : "关闭流程配置"
          }
          message={confirmationMessage}
          confirmText={
            confirmation === "publish"
              ? "发布"
              : confirmation === "switch"
                ? "放弃修改并切换"
                : confirmation === "deleteParallel"
                  ? "删除整组"
                : "不保存并关闭"
          }
          destructive={confirmation !== "publish"}
          loading={publish.isPending}
          onCancel={() => {
            setConfirmation(null);
            setPendingVersionId(null);
            setPendingParallelGroupId(null);
          }}
          onConfirm={() => {
            if (confirmation === "publish") publish.mutate();
            else if (confirmation === "switch" && pendingVersionId !== null) {
              setSelectedVersionId(pendingVersionId);
              setPendingVersionId(null);
              setDirty(false);
              setConfirmation(null);
            } else if (confirmation === "deleteParallel" && pendingParallelGroupId) {
              removeParallelGroup(pendingParallelGroupId);
            } else navigate("/workflow/review-templates");
          }}
        />
      }
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) clamp(400px, 30vw, 480px)",
            },
            overflow: "hidden",
            borderColor: "#e4e7ed",
          }}
        >
          <ReactFlowProvider>
            <Box
              tabIndex={0}
              onKeyDown={handleCanvasKeyDown}
              sx={{ position: "relative", minWidth: 0, outline: "none" }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  position: "absolute",
                  zIndex: 5,
                  top: 12,
                  left: { xs: 12, md: 16 },
                  maxWidth: "calc(100% - 28px)",
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addApprovalFromToolbar}
                  disabled={!canAddApprovalFromToolbar}
                >
                  审批节点
                </Button>
                <Button size="small" variant="outlined" startIcon={<Add />} onClick={addParallelFromToolbar} disabled={!canAddParallelFromToolbar}>并行审批</Button>
              </Stack>
              <ReactFlow
                onInit={(instance) => { flowInstanceRef.current = instance; }}
                nodes={decoratedNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={(changes) => {
                  if (!editable) return;
                  onNodesChange(changes);
                  if (
                    changes.some(
                      (change) =>
                        change.type !== "select" && change.type !== "dimensions",
                    )
                  ) {
                    setDirty(true);
                    setValidationErrors({});
                  }
                }}
                onEdgesChange={(changes) => {
                  if (!editable) return;
                  onEdgesChange(changes);
                  if (changes.some((change) => change.type !== "select")) {
                    setDirty(true);
                    setValidationErrors({});
                  }
                }}
                onConnect={addEdgeSafe}
              onNodeClick={(event, node) => {
                (event.currentTarget as HTMLElement).closest<HTMLElement>('[tabindex="0"]')?.focus();
                setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                  setMenu(null);
                }}
              onEdgeClick={(event, edge) => {
                (event.currentTarget as HTMLElement).closest<HTMLElement>('[tabindex="0"]')?.focus();
                setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                  setMenu(null);
                }}
                onPaneClick={(event) => {
                  (event.currentTarget as HTMLElement).closest<HTMLElement>('[tabindex="0"]')?.focus();
                  setSelectedEdgeId(null);
                  setMenu(null);
                }}
                onNodeDragStart={() => {
                  dragRef.current = graph();
                }}
                onNodeDragStop={() => {
                  if (dragRef.current) {
                    record(dragRef.current);
                    dragRef.current = null;
                    setDirty(true);
                  }
                }}
                nodesConnectable={editable}
                nodesDraggable={editable}
                elementsSelectable={editable}
                panOnDrag={interactionMode === "pan"}
                selectionOnDrag={editable && interactionMode === "select"}
                selectNodesOnDrag={interactionMode === "pan"}
                deleteKeyCode={null}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  markerEnd: { type: MarkerType.ArrowClosed, color: "#8a97a6" },
                }}
                fitView
                fitViewOptions={STANDARD_FLOW_FIT_VIEW_OPTIONS}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#dfe4ea" gap={20} size={1} />
                <Controls position="bottom-left">
                  {editable ? (
                    <FlowInteractionModeControls
                      mode={interactionMode}
                      onChange={setInteractionMode}
                    />
                  ) : null}
                  <ControlButton
                    aria-label="撤销"
                    onClick={undo}
                    disabled={!history.undo}
                  >
                    <Undo fontSize="small" />
                  </ControlButton>
                  <ControlButton
                    aria-label="重做"
                    onClick={redo}
                    disabled={!history.redo}
                  >
                    <Redo fontSize="small" />
                  </ControlButton>
                  {editable ? (
                    <ControlButton
                      aria-label="一键整理布局"
                      onClick={autoLayout}
                    >
                      <AutoFixHigh fontSize="small" />
                    </ControlButton>
                  ) : null}
                  <Tooltip
                    title={showMiniMap ? "隐藏缩略地图" : "显示缩略地图"}
                    placement="right"
                    arrow
                  >
                    <span>
                      <ControlButton
                        aria-label={showMiniMap ? "隐藏缩略地图" : "显示缩略地图"}
                        onClick={() => setShowMiniMap((value) => !value)}
                      >
                        <MapOutlined fontSize="small" />
                      </ControlButton>
                    </span>
                  </Tooltip>
                </Controls>
                {showMiniMap ? <FlowMiniMap /> : null}
              </ReactFlow>
            </Box>
          </ReactFlowProvider>
          <Box
            sx={{
              borderLeft: { lg: "1px solid #e4e7ed" },
              borderTop: { xs: "1px solid #e4e7ed", lg: 0 },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "#fff",
              minHeight: 0,
            }}
          >
            {selected ? (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 2,
                    py: 1.5,
                    minHeight: 58,
                    borderBottom: "1px solid #e4e7ed",
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      节点设置
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {selected.data.label}
                    </Typography>
                  </Box>
                  {editable && selected.data.kind !== "START" && selected.data.kind !== "END" ? (
                    <Tooltip title="删除节点">
                      <IconButton
                        size="small"
                        aria-label="删除节点"
                        color="error"
                        onClick={removeSelected}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
                <Tabs
                  value={selectedPanelTab}
                  onChange={(_, value) => setSelectedPanelTab(value)}
                  variant="fullWidth"
                  sx={{
                    minHeight: 46,
                    borderBottom: "1px solid #e4e7ed",
                    flexShrink: 0,
                    "& .MuiTab-root": {
                      minHeight: 46,
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#606266",
                    },
                    "& .Mui-selected": { color: "#1677c8" },
                    "& .MuiTabs-indicator": { height: 2 },
                  }}
                >
                  <Tab value="property" label="属性" />
                  {selected.data.kind === "APPROVAL" ? (
                    <Tab value="buttons" label="节点按钮" />
                  ) : null}
                </Tabs>
                {selectedPanelTab === "buttons" &&
                selected.data.kind === "APPROVAL" ? (
                  <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: { xs: 1.5, md: 2 } }}>
                    <WorkflowActionConfig
                      kind="APPROVAL"
                      buttons={selected.data.config?.buttons}
                      events={selected.data.config?.buttonEvents}
                      editable={editable}
                      profile="RECORD_CONTROL"
                      onChange={(patch) => updateNodeData(selected.id, {}, patch)}
                    />
                  </Box>
                ) : null}
                {selectedPanelTab === "property" ? (
                <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: "auto", p: { xs: 1.5, md: 2 } }}>
                  <TextField
                    size="small"
                    label="节点名称"
                    value={selected.data.label}
                    disabled={!editable || selected.data.kind !== "APPROVAL"}
                    onChange={(event) =>
                      updateNodeData(selected.id, { label: event.target.value })
                    }
                  />
                  {selected.data.kind === "START" ? (
                    <Typography variant="caption" color="text.secondary">
                      发起节点只表示审批流程入口。申请人在表单变更或作废页面完成申请内容、电子签名并选择流程后，确认即发起审批并直接流转至首个审批节点；此处无需配置按钮或填报权限。
                    </Typography>
                  ) : null}
                  {selected.data.kind === "APPROVAL" ? (
                    <>
                      <SubjectSelector
                        value={selected.data.config?.approverSubjects ?? parseSubjectRefs(selected.data.config?.approvers)}
                        disabled={!editable}
                        label="审批主体"
                        placeholder="请选择用户、部门或角色"
                        onChange={(subjects) =>
                          updateNodeData(selected.id, {}, {
                            approverSubjects: subjects,
                            approvers: subjects.length ? serializeSubjectRefs(subjects) : "",
                          })
                        }
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                        发布前必须配置审批主体；审批、退回和转办的动作语义及显隐由系统固定。
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        多人候选时任一人完成即可；退回固定回到申请发起阶段。按钮样式和电子签名在节点按钮页配置。
                      </Typography>
                    </>
                  ) : null}
                  {selected.data.kind === "PARALLEL_SPLIT" && selected.data.config?.parallelGroupId ? (
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      disabled={!editable}
                      onClick={() => addParallelBranch(selected.data.config!.parallelGroupId!)}
                    >
                      添加并行审批分支
                    </Button>
                  ) : null}
                  {selected.data.kind === "PARALLEL_JOIN" && selected.data.config?.parallelGroupId ? (
                    <Typography variant="caption" color="text.secondary">
                      等待全部 {nodes.filter((node) => node.data.config?.parallelGroupId === selected.data.config?.parallelGroupId && node.data.kind === "APPROVAL").length} 条分支完成后汇聚。
                    </Typography>
                  ) : null}
                </Stack>
                ) : null}
              </>
            ) : (
              <Box sx={{ p: 3, color: "#909399", flex: 1, display: "grid", placeItems: "center", textAlign: "center" }}>
                <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#606266", mb: 0.5 }}
                >
                  节点设置
                </Typography>
                <Typography variant="body2">
                  选择画布中的节点查看配置
                </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </FullScreenFlowDesigner>
  );
}
