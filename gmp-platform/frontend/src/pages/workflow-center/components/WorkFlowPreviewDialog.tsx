import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Box,
  Chip,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import AppDialog from "@/components/AppDialog";
import { getWorkTemplateVersion, type WorkflowId } from "@/api/workflow-work";
import { FlowMiniMap } from "@/components/flow-designer/FlowDesigner";

export interface WorkFlowPreviewVersion {
  id: WorkflowId;
  versionNumber: number;
  status?: string;
  isCurrent?: boolean;
  nodesJson?: string | null;
  edgesJson?: string | null;
}

type PreviewNodeData = {
  label?: string;
  kind?:
    | "START"
    | "END"
    | "FORM"
    | "NOTIFICATION"
    | "CONFIRMATION"
    | "CONDITION";
  config?: {
    formTemplateName?: string;
    recipients?: string;
    confirmationInstruction?: string;
    conditionBranches?: Array<{
      id: string;
      name: string;
      conditionRule?: unknown;
    }>;
  };
};

type PreviewNode = Node<PreviewNodeData>;

const previewAppearance: Record<
  NonNullable<PreviewNodeData["kind"]>,
  { label: string; color: string; background: string }
> = {
  START: { label: "开始", color: "#1677c8", background: "#e8f4ff" },
  END: { label: "结束", color: "#677386", background: "#eef1f5" },
  FORM: { label: "表单填写", color: "#1677c8", background: "#f2f8ff" },
  NOTIFICATION: { label: "消息通知", color: "#8a5a00", background: "#fff8e8" },
  CONFIRMATION: { label: "人工确认", color: "#217a4b", background: "#effaf3" },
  CONDITION: { label: "条件分支", color: "#7650b5", background: "#f6f1ff" },
};

const previewEdgeMarker = {
  type: MarkerType.ArrowClosed,
  color: "#8a97a6",
} as const;

function previewKind(node: Pick<Node<PreviewNodeData>, "data" | "type">) {
  return (
    node.data?.kind ??
    (node.type === "input" ? "START" : node.type === "output" ? "END" : "FORM")
  );
}

function previewNodeCaption(
  data: PreviewNodeData,
  kind: NonNullable<PreviewNodeData["kind"]>,
) {
  const config = data.config ?? {};
  if (kind === "FORM") return config.formTemplateName || "未配置表单";
  if (kind === "NOTIFICATION") return config.recipients || "未配置接收人";
  if (kind === "CONFIRMATION")
    return config.confirmationInstruction || "未配置确认要求";
  if (kind === "CONDITION") {
    const branches = Array.isArray(config.conditionBranches)
      ? config.conditionBranches
      : [];
    return `${branches.length} 条条件分支 + 否则`;
  }
  return "";
}

function PreviewWorkNode({ data }: NodeProps<PreviewNode>) {
  const kind = data.kind ?? "FORM";
  const appearance = previewAppearance[kind];
  const boundary = kind === "START" || kind === "END";
  const branches =
    kind === "CONDITION"
      ? [
          ...(data.config?.conditionBranches ?? []),
          { id: "condition-default", name: "否则" },
        ]
      : [];
  const hiddenHandleStyle = { opacity: 0 };
  return (
    <Box
      sx={{
        minWidth: boundary ? 96 : 148,
        minHeight: boundary ? 52 : 60,
        boxSizing: "border-box",
        border: "1px solid",
        borderColor: `${appearance.color}55`,
        borderRadius: 1,
        bgcolor: appearance.background,
        boxShadow: "0 1px 2px rgba(31,45,61,.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 1,
        py: 0.8,
        userSelect: "none",
      }}
    >
      {kind === "CONDITION" ? (
        <Handle
          id="condition-input"
          type="target"
          position={Position.Top}
          isConnectable={false}
          style={hiddenHandleStyle}
        />
      ) : kind !== "START" ? (
        <>
          {(["top", "right", "bottom", "left"] as const).map((direction) => (
            <Handle
              key={`target-${direction}`}
              id={`target-${direction}`}
              type="target"
              position={
                direction === "top"
                  ? Position.Top
                  : direction === "right"
                    ? Position.Right
                    : direction === "bottom"
                      ? Position.Bottom
                      : Position.Left
              }
              isConnectable={false}
              style={hiddenHandleStyle}
            />
          ))}
        </>
      ) : null}
      <Typography
        noWrap
        sx={{
          color: appearance.color,
          fontSize: boundary ? 14 : 11,
          fontWeight: 650,
          maxWidth: 220,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data.label || appearance.label}
      </Typography>
      {!boundary ? (
        <Typography
          noWrap
          sx={{
            mt: 0.3,
            maxWidth: 220,
            color: "#7a8796",
            fontSize: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {previewNodeCaption(data, kind)}
        </Typography>
      ) : null}
      {kind === "CONDITION" ? (
        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            mt: 0.8,
            maxWidth: 240,
            overflow: "hidden",
          }}
        >
          {branches.map((branch) => (
            <Box
              key={branch.id}
              sx={{
                position: "relative",
                px: 0.75,
                py: 0.25,
                border: "1px solid",
                borderColor:
                  branch.id === "condition-default" ? "#c7d0da" : "#c9b8e8",
                borderRadius: 0.75,
                bgcolor:
                  branch.id === "condition-default" ? "#f7f9fb" : "#fbf9ff",
                color:
                  branch.id === "condition-default" ? "#596575" : "#7650b5",
                fontSize: 9,
                whiteSpace: "nowrap",
              }}
            >
              <Handle
                id={
                  branch.id === "condition-default"
                    ? "condition-default"
                    : branch.id.startsWith("condition-")
                      ? branch.id
                      : `condition-${branch.id}`
                }
                type="source"
                position={Position.Bottom}
                isConnectable={false}
                style={hiddenHandleStyle}
              />
              {branch.name}
            </Box>
          ))}
        </Box>
      ) : null}
      {kind !== "CONDITION" && kind !== "END" ? (
        <>
          {(["top", "right", "bottom", "left"] as const).map((direction) => (
            <Handle
              key={`source-${direction}`}
              id={`source-${direction}`}
              type="source"
              position={
                direction === "top"
                  ? Position.Top
                  : direction === "right"
                    ? Position.Right
                    : direction === "bottom"
                      ? Position.Bottom
                      : Position.Left
              }
              isConnectable={false}
              style={hiddenHandleStyle}
            />
          ))}
        </>
      ) : null}
    </Box>
  );
}

const previewNodeTypes = { workNode: PreviewWorkNode };

function parseGraph<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function WorkFlowPreviewCanvas({
  version,
  minHeight = 480,
}: {
  version: WorkFlowPreviewVersion;
  minHeight?: number;
}) {
  const nodes = useMemo(
    () =>
      parseGraph<Node<PreviewNodeData>[]>(version.nodesJson, []).map(
        (node) => ({
          ...node,
          type: "workNode",
          data: { ...node.data, kind: previewKind(node) },
          selectable: false,
          draggable: false,
        }),
      ),
    [version.nodesJson],
  );
  const edges = useMemo(
    () =>
      parseGraph<Edge[]>(version.edgesJson, []).map((edge) => ({
        ...edge,
        type: edge.type ?? "smoothstep",
        markerEnd: edge.markerEnd ?? previewEdgeMarker,
        selectable: false,
      })),
    [version.edgesJson],
  );

  return (
    <Box
      sx={{
        minHeight,
        height: minHeight,
        overflow: "hidden",
        border: "1px solid #e4e7ed",
        borderRadius: 1,
        bgcolor: "#fbfcfe",
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          key={version.id}
          nodes={nodes}
          edges={edges}
          nodeTypes={previewNodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#dfe4ea" gap={20} size={1} />
          <Controls showInteractive={false} />
          <FlowMiniMap />
        </ReactFlow>
      </ReactFlowProvider>
    </Box>
  );
}

export default function WorkFlowPreviewDialog({
  open,
  templateId,
  version,
  onClose,
}: {
  open: boolean;
  templateId: WorkflowId | null;
  version: WorkFlowPreviewVersion | null;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["work-template-version-preview", templateId, version?.id],
    enabled: open && Boolean(templateId && version?.id),
    queryFn: async () =>
      (await getWorkTemplateVersion(templateId!, version!.id)).data
        .data as WorkFlowPreviewVersion,
    staleTime: 30_000,
  });
  const previewVersion = detail.data ?? version;
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ zIndex: (theme) => theme.zIndex.modal + 200 }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        已发布流程预览
        {version ? (
          <Chip
            size="small"
            color="success"
            label={`流程 V${version.versionNumber}`}
          />
        ) : null}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {detail.isLoading ? (
          <Typography sx={{ py: 8, textAlign: "center", color: "#909399" }}>
            正在加载流程详情...
          </Typography>
        ) : detail.isError ? (
          <Typography sx={{ py: 8, textAlign: "center", color: "#c62828" }}>
            无法加载流程详情
          </Typography>
        ) : previewVersion ? (
          <WorkFlowPreviewCanvas version={previewVersion} />
        ) : (
          <Typography sx={{ py: 8, textAlign: "center", color: "#909399" }}>
            暂无可预览的已发布流程
          </Typography>
        )}
      </DialogContent>
    </AppDialog>
  );
}
