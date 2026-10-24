import { MarkerType, type Connection, type Edge, type Node } from '@xyflow/react';
import type { RouteGraphPayload, RouteGraphResponse, RouteNodeRecord, RouteRelationRecord } from '@/api/master-data';
import type { FlowDirection } from '@/components/flow-designer/FlowDesigner';

export type RouteOperationKind = 'PRODUCTION' | 'REWORK';

export interface RouteFlowNodeData extends Record<string, unknown> {
  label: string;
  operationId?: string | number | null;
  operationCode?: string | null;
  operationName?: string | null;
  nodeType?: string | null;
  routeOperationKind?: RouteOperationKind;
  virtual?: boolean;
  sourceConnected?: boolean;
  targetConnected?: boolean;
  connectedHandleIds?: string[];
  showConnectableHandles?: boolean;
  parallelBadges?: string[];
  mergeBadges?: string[];
  reworkBadges?: string[];
  occurrenceBadge?: string;
}

interface RouteFlowEdgeData extends Record<string, unknown> {
  relationType: string;
  label: string;
  ruleExpression?: string | null;
}

export type RouteFlowNode = Node<RouteFlowNodeData>;
export type RouteFlowEdge = Edge<RouteFlowEdgeData>;

function productionLinks(nodes: RouteFlowNode[], edges: RouteFlowEdge[]) {
  const normal = new Set(nodes.filter((node) => node.data.nodeType !== 'REWORK').map((node) => node.id));
  const next = new Map<string, string[]>(), previous = new Map<string, string[]>();
  edges.filter((edge) => normal.has(edge.source) && normal.has(edge.target)).forEach((edge) => {
    next.set(edge.source, [...(next.get(edge.source) ?? []), edge.target]);
    previous.set(edge.target, [...(previous.get(edge.target) ?? []), edge.source]);
  });
  return { normal, next, previous };
}

function reachable(from: string, links: Map<string, string[]>) {
  const seen = new Set<string>(), pending = [from];
  while (pending.length) {
    const id = pending.pop()!;
    if (seen.has(id)) continue;
    seen.add(id); pending.push(...(links.get(id) ?? []));
  }
  return seen;
}

export function getRouteConnectionError(nodes: RouteFlowNode[], edges: RouteFlowEdge[], connection: Pick<Connection, 'source' | 'target'>) {
  const source = nodes.find((node) => node.id === connection.source);
  const target = nodes.find((node) => node.id === connection.target);
  if (!source || !target) return '路线连线引用了不存在的节点';
  if (source.id === target.id) return '节点不能连接自身';
  if (source.data.nodeType === 'END') return '结束节点不能有出去连线';
  if (target.data.nodeType === 'START') return '开始节点不能有进入连线';
  if (edges.some((edge) => edge.source === source.id && edge.target === target.id)) return '同一对节点之间不能重复连线';
  if (source.data.nodeType !== 'REWORK' && target.data.nodeType !== 'REWORK'
    && reachable(target.id, productionLinks(nodes, edges).next).has(source.id)) return '普通生产工序不能形成循环';
  return null;
}

// Partial edits may be disconnected, but must not introduce invalid topology.
export function getRouteTopologyErrors(nodes: RouteFlowNode[], edges: RouteFlowEdge[]) {
  const errors: Record<string, string> = {};
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (byId.size !== nodes.length) errors.__graph__ = '路线节点标识不能重复';
  nodes.forEach((node) => {
    if (!['START', 'END', 'OPERATION', 'REWORK'].includes(node.data.nodeType ?? '')) errors[node.id] = '路线节点类型不正确';
  });
  const starts = nodes.filter((node) => node.data.nodeType === 'START');
  const ends = nodes.filter((node) => node.data.nodeType === 'END');
  if (starts.length !== 1 || ends.length !== 1) {
    errors.__graph__ = '路线必须有且只有一个开始节点和一个结束节点';
    return errors;
  }
  const start = starts[0].id, end = ends[0].id;
  const pairs = new Set<string>();
  edges.forEach((edge) => {
    if (!byId.has(edge.source) || !byId.has(edge.target)) { errors.__graph__ = '路线连线引用了不存在的节点'; return; }
    const pair = JSON.stringify([edge.source, edge.target]);
    if (edge.source === edge.target) errors[edge.source] = '节点不能连接自身';
    if (pairs.has(pair)) errors[edge.source] = errors[edge.target] = '同一对节点之间不能重复连线';
    pairs.add(pair);
    if (edge.target === start) errors[start] = '开始节点不能有进入连线';
    if (edge.source === end) errors[end] = '结束节点不能有出去连线';
  });
  const { normal, next, previous } = productionLinks(nodes, edges);
  const incoming = new Map([...normal].map((id) => [id, previous.get(id)?.length ?? 0]));
  const pending = [...normal].filter((id) => incoming.get(id) === 0);
  while (pending.length) {
    const id = pending.pop()!;
    normal.delete(id);
    (next.get(id) ?? []).forEach((target) => {
      incoming.set(target, incoming.get(target)! - 1);
      if (incoming.get(target) === 0) pending.push(target);
    });
  }
  normal.forEach((id) => {
    if ((next.get(id) ?? []).some((target) => reachable(target, next).has(id))) errors[id] ||= '普通生产工序不能形成循环';
  });
  return errors;
}

export function getRouteConnectivityErrors(nodes: RouteFlowNode[], edges: RouteFlowEdge[]) {
  const errors = getRouteTopologyErrors(nodes, edges);
  const start = nodes.find((node) => node.data.nodeType === 'START')?.id;
  const end = nodes.find((node) => node.data.nodeType === 'END')?.id;
  if (!start || !end) return errors;
  const { next, previous } = productionLinks(nodes, edges);
  const fromStart = reachable(start, next), toEnd = reachable(end, previous);
  if (!fromStart.has(end)) {
    errors[start] ||= '开始节点尚未连通到结束节点';
    errors[end] ||= '结束节点尚未连通到开始节点';
  }
  nodes.filter((node) => node.data.nodeType === 'OPERATION').forEach((node) => {
    if (!fromStart.has(node.id)) errors[node.id] ||= '该工序未连接到开始节点';
    else if (!toEnd.has(node.id)) errors[node.id] ||= '该工序无法到达结束节点';
  });
  return errors;
}

export function createRouteQuickConnection(anchor: RouteFlowNode, other: RouteFlowNode, direction: FlowDirection): RouteFlowEdge {
  const handles = { top: ROUTE_DESIGNER_HANDLE_IDS.TOP, right: ROUTE_DESIGNER_HANDLE_IDS.RIGHT, bottom: ROUTE_DESIGNER_HANDLE_IDS.BOTTOM, left: ROUTE_DESIGNER_HANDLE_IDS.LEFT };
  const opposite = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' } as const;
  const before = anchor.data.nodeType === 'END' || direction === 'top';
  const source = before ? other : anchor, target = before ? anchor : other;
  return {
    id: `edge-${source.id}-${target.id}-${Date.now()}`, source: source.id, target: target.id,
    sourceHandle: handles[before ? opposite[direction] : direction], targetHandle: handles[before ? direction : opposite[direction]],
    type: 'smoothstep', ...getRouteEdgePresentation(),
    data: { relationType: 'SEQUENTIAL', label: getRouteRelationLabel('SEQUENTIAL') },
  };
}

export function getRouteAnchoredAddPosition(anchor: RouteFlowNode, nodes: RouteFlowNode[], direction: FlowDirection) {
  const size = getRouteNodeSize(anchor), width = ROUTE_DESIGNER_OPERATION_NODE_WIDTH, height = ROUTE_DESIGNER_OPERATION_NODE_HEIGHT;
  const position = { x: anchor.position.x + (size.width - width) / 2, y: anchor.position.y + (size.height - height) / 2 };
  const dx = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
  const dy = direction === 'bottom' ? 1 : direction === 'top' ? -1 : 0;
  position.x += dx * ((size.width + width) / 2 + 80);
  position.y += dy * ((size.height + height) / 2 + 80);
  while (nodes.some((node) => {
    const other = getRouteNodeSize(node);
    return position.x < node.position.x + other.width + 20 && position.x + width + 20 > node.position.x
      && position.y < node.position.y + other.height + 20 && position.y + height + 20 > node.position.y;
  })) {
    position.x += dx * (width + 80); position.y += dy * (height + 80);
  }
  return position;
}
const ROUTE_START_NODE_KEY = '__route_start__';
export const ROUTE_END_NODE_KEY = '__route_end__';
const ROUTE_VIRTUAL_NODE_LABELS = {
  START: '开始',
  END: '结束',
} as const;
export const ROUTE_DESIGNER_OPERATION_NODE_WIDTH = 148;
export const ROUTE_DESIGNER_OPERATION_NODE_HEIGHT = 60;
export const ROUTE_DESIGNER_QUICK_ADD_VERTICAL_GAP = 56;
const ROUTE_DESIGNER_EDGE_MARKER_SIZE = 14;
export const ROUTE_DESIGNER_CONNECTED_COLOR = '#8a97a6';
const ROUTE_DESIGNER_REWORK_COLOR = '#f56c6c';
export const ROUTE_DESIGNER_HANDLE_IDS = {
  TOP: 'route-handle-top',
  RIGHT: 'route-handle-right',
  BOTTOM: 'route-handle-bottom',
  LEFT: 'route-handle-left',
} as const;
const ROUTE_DESIGNER_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  height: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  color: ROUTE_DESIGNER_CONNECTED_COLOR,
} as const;
const ROUTE_DESIGNER_REWORK_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  height: ROUTE_DESIGNER_EDGE_MARKER_SIZE,
  color: ROUTE_DESIGNER_REWORK_COLOR,
} as const;
const ROUTE_DESIGNER_CONNECTED_EDGE_STYLE = {
  stroke: ROUTE_DESIGNER_CONNECTED_COLOR,
  strokeWidth: 1,
} as const;
const ROUTE_DESIGNER_REWORK_EDGE_STYLE = {
  stroke: ROUTE_DESIGNER_REWORK_COLOR,
  strokeWidth: 2,
  strokeDasharray: '6 4',
} as const;
const ROUTE_RELATION_LABELS: Record<string, string> = {
  SEQUENTIAL: '串行',
  PARALLEL: '并行',
  OPTIONAL: '可选分支',
  REWORK: '返工回流',
  JUMP: '跳转规则',
  ALTERNATIVE: '替代工序',
};

export function getRouteRelationLabel(type?: string | null) {
  return type ? ROUTE_RELATION_LABELS[type] ?? type : '串行';
}

interface RouteEdgeMaps {
  outgoing: Map<string, string[]>;
  incoming: Map<string, string[]>;
}

interface RouteParallelGroup {
  source: string;
  index: string;
  branchStartIds: string[];
  branchNodeIds: Set<string>;
  mergeNodeId?: string;
}

function appendRouteBadge(map: Map<string, string[]>, nodeId: string, badge: string) {
  const current = map.get(nodeId) ?? [];
  if (!current.includes(badge)) {
    map.set(nodeId, [...current, badge]);
  }
}

function getRouteEdgeMaps(edges: RouteFlowEdge[]): RouteEdgeMaps {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!edge.source || !edge.target || edge.source === edge.target) return;
    const sourceTargets = outgoing.get(edge.source) ?? [];
    if (!sourceTargets.includes(edge.target)) {
      outgoing.set(edge.source, [...sourceTargets, edge.target]);
    }
    const targetSources = incoming.get(edge.target) ?? [];
    if (!targetSources.includes(edge.source)) {
      incoming.set(edge.target, [...targetSources, edge.source]);
    }
  });
  return { outgoing, incoming };
}

function getRouteNodeDepths(nodes: RouteFlowNode[], edgeMaps: RouteEdgeMaps) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const startIds = nodeIds.has(ROUTE_START_NODE_KEY)
    ? [ROUTE_START_NODE_KEY]
    : nodes.filter((node) => (edgeMaps.incoming.get(node.id) ?? []).length === 0).map((node) => node.id);
  const depths = new Map<string, number>();
  const queue = startIds.map((id) => ({ id, depth: 0 }));
  queue.forEach(({ id, depth }) => depths.set(id, depth));
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    (edgeMaps.outgoing.get(current.id) ?? []).forEach((targetId) => {
      const nextDepth = current.depth + 1;
      if (!depths.has(targetId) || nextDepth < (depths.get(targetId) ?? Number.MAX_SAFE_INTEGER)) {
        depths.set(targetId, nextDepth);
        queue.push({ id: targetId, depth: nextDepth });
      }
    });
  }
  return depths;
}

function getRouteReachableDistances(startNodeId: string, outgoing: Map<string, string[]>) {
  const distances = new Map<string, number>();
  const queue = [{ id: startNodeId, distance: 0 }];
  distances.set(startNodeId, 0);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    (outgoing.get(current.id) ?? []).forEach((targetId) => {
      if (distances.has(targetId)) return;
      const distance = current.distance + 1;
      distances.set(targetId, distance);
      queue.push({ id: targetId, distance });
    });
  }
  return distances;
}

function getRouteParallelMergeNode(sourceNodeId: string, branchStartIds: string[], outgoing: Map<string, string[]>) {
  const branchDistances = branchStartIds.map((branchStartId) => getRouteReachableDistances(branchStartId, outgoing));
  if (branchDistances.length < 2) return undefined;
  const blockedNodeIds = new Set([sourceNodeId, ...branchStartIds]);
  const commonNodeIds = [...branchDistances[0].keys()].filter((nodeId) => (
    !blockedNodeIds.has(nodeId) && branchDistances.every((distances) => distances.has(nodeId))
  ));
  commonNodeIds.sort((left, right) => {
    const leftDistances = branchDistances.map((distances) => distances.get(left) ?? Number.MAX_SAFE_INTEGER);
    const rightDistances = branchDistances.map((distances) => distances.get(right) ?? Number.MAX_SAFE_INTEGER);
    const leftMax = Math.max(...leftDistances);
    const rightMax = Math.max(...rightDistances);
    if (leftMax !== rightMax) return leftMax - rightMax;
    const leftTotal = leftDistances.reduce((sum, distance) => sum + distance, 0);
    const rightTotal = rightDistances.reduce((sum, distance) => sum + distance, 0);
    return leftTotal === rightTotal ? left.localeCompare(right) : leftTotal - rightTotal;
  });
  return commonNodeIds[0];
}

function getRouteParallelBranchNodeIds(branchStartIds: string[], outgoing: Map<string, string[]>, mergeNodeId?: string) {
  const branchNodeIds = new Set<string>();
  branchStartIds.forEach((branchStartId) => {
    const visitedNodeIds = new Set<string>();
    const queue = [branchStartId];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || visitedNodeIds.has(nodeId) || nodeId === mergeNodeId) continue;
      visitedNodeIds.add(nodeId);
      branchNodeIds.add(nodeId);
      (outgoing.get(nodeId) ?? []).forEach((targetId) => {
        if (targetId !== mergeNodeId) {
          queue.push(targetId);
        }
      });
    }
  });
  return branchNodeIds;
}

function getRouteProductionBranchTargets(targetIds: string[], nodeById: Map<string, RouteFlowNode>) {
  return targetIds.filter((targetId) => {
    const targetNode = nodeById.get(targetId);
    return targetNode && !targetNode.data.virtual && getRouteOperationKind(targetNode) === 'PRODUCTION';
  });
}

function getRouteParallelGroups(nodes: RouteFlowNode[], edges: RouteFlowEdge[]): RouteParallelGroup[] {
  const edgeMaps = getRouteEdgeMaps(edges);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const nodeDepths = getRouteNodeDepths(nodes, edgeMaps);
  const forkSourceIds = nodes
    .map((node) => node.id)
    .filter((nodeId) => {
      const outgoing = edgeMaps.outgoing.get(nodeId) ?? [];
      const productionOutgoing = getRouteProductionBranchTargets(outgoing, nodeById);
      return productionOutgoing.length >= 2;
    })
    .sort((left, right) => {
      const leftNode = nodeById.get(left);
      const rightNode = nodeById.get(right);
      const depthDelta = (nodeDepths.get(left) ?? Number.MAX_SAFE_INTEGER) - (nodeDepths.get(right) ?? Number.MAX_SAFE_INTEGER);
      if (depthDelta !== 0) return depthDelta;
      const yDelta = (leftNode?.position.y ?? 0) - (rightNode?.position.y ?? 0);
      if (yDelta !== 0) return yDelta;
      return (leftNode?.position.x ?? 0) - (rightNode?.position.x ?? 0);
    });
  const groups: RouteParallelGroup[] = [];
  const childGroupCounters = new Map<string, number>();
  let topLevelGroupIndex = 0;
  forkSourceIds.forEach((source) => {
    const outgoing = getRouteProductionBranchTargets(edgeMaps.outgoing.get(source) ?? [], nodeById);
    if (outgoing.length < 2) return;
    const parentGroup = [...groups].reverse().find((group) => group.branchNodeIds.has(source));
    let index: string;
    if (parentGroup) {
      const localIndex = (childGroupCounters.get(parentGroup.index) ?? 0) + 1;
      childGroupCounters.set(parentGroup.index, localIndex);
      index = `${parentGroup.index}-${localIndex}`;
    } else {
      topLevelGroupIndex += 1;
      index = String(topLevelGroupIndex);
    }
    const mergeNodeId = getRouteParallelMergeNode(source, outgoing, edgeMaps.outgoing);
    groups.push({
      source,
      index,
      branchStartIds: outgoing,
      branchNodeIds: getRouteParallelBranchNodeIds(outgoing, edgeMaps.outgoing, mergeNodeId),
      mergeNodeId,
    });
  });
  return groups;
}

function getRouteParallelBadgeMaps(groups: RouteParallelGroup[]) {
  const parallel = new Map<string, string[]>();
  const merge = new Map<string, string[]>();
  groups.forEach((group) => {
    group.branchStartIds.forEach((nodeId) => appendRouteBadge(parallel, nodeId, `并${group.index}`));
    if (group.mergeNodeId) {
      appendRouteBadge(merge, group.mergeNodeId, `合${group.index}`);
    }
  });
  return { parallel, merge };
}

function getRouteReworkBadgeMaps(nodes: RouteFlowNode[]) {
  const rework = new Map<string, string[]>();
  nodes
    .filter((node) => getRouteOperationKind(node) === 'REWORK')
    .sort((left, right) => {
      const yDelta = left.position.y - right.position.y;
      return yDelta === 0 ? left.position.x - right.position.x : yDelta;
    })
    .forEach((node, index) => appendRouteBadge(rework, node.id, `返${index + 1}`));
  return { rework };
}

function getRouteParallelSourceIds(nodes: RouteFlowNode[], edges: RouteFlowEdge[]) {
  const { outgoing } = getRouteEdgeMaps(edges);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  return new Set([...outgoing.entries()]
    .filter(([, targets]) => getRouteProductionBranchTargets(targets, nodeById).length >= 2)
    .map(([source]) => source));
}

function getRouteNodeCenter(node: RouteFlowNode) {
  const size = getRouteNodeSize(node);
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}

export function getRouteParallelBoundaryNodeId(nodes: RouteFlowNode[], edges: RouteFlowEdge[], selectedNodeIds: string[], direction: 'upstream' | 'downstream') {
  const selectedNodeIdSet = new Set(selectedNodeIds);
  const selectedNodes = nodes.filter((node) => selectedNodeIdSet.has(node.id));
  if (selectedNodes.length === 0) return undefined;
  const selectedCenters = selectedNodes.map(getRouteNodeCenter);
  const selectedAverageX = selectedCenters.reduce((sum, center) => sum + center.x, 0) / selectedCenters.length;
  const selectedMinY = Math.min(...selectedCenters.map((center) => center.y));
  const selectedMaxY = Math.max(...selectedCenters.map((center) => center.y));
  const existingBoundaryIds = direction === 'upstream'
    ? [...new Set(edges.filter((edge) => selectedNodeIdSet.has(edge.target) && !selectedNodeIdSet.has(edge.source)).map((edge) => edge.source))]
    : [...new Set(edges.filter((edge) => selectedNodeIdSet.has(edge.source) && !selectedNodeIdSet.has(edge.target)).map((edge) => edge.target))];
  if (existingBoundaryIds.length === 1) return existingBoundaryIds[0];
  const candidates = nodes
    .filter((node) => !selectedNodeIdSet.has(node.id))
    .map((node) => ({ node, center: getRouteNodeCenter(node) }))
    .filter(({ center }) => (direction === 'upstream' ? center.y < selectedMinY : center.y > selectedMaxY));
  candidates.sort((left, right) => {
    const leftYDistance = direction === 'upstream' ? selectedMinY - left.center.y : left.center.y - selectedMaxY;
    const rightYDistance = direction === 'upstream' ? selectedMinY - right.center.y : right.center.y - selectedMaxY;
    if (leftYDistance !== rightYDistance) return leftYDistance - rightYDistance;
    return Math.abs(left.center.x - selectedAverageX) - Math.abs(right.center.x - selectedAverageX);
  });
  return candidates[0]?.node.id;
}

export function createRouteParallelEdge(source: string, target: string): RouteFlowEdge {
  const edgePresentation = getRouteEdgePresentation();
  return {
    id: `edge-${source}-${target}-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    source,
    target,
    sourceHandle: getRouteFallbackSourceHandleId(source),
    targetHandle: getRouteFallbackTargetHandleId(target),
    type: 'smoothstep',
    ...edgePresentation,
    data: {
      relationType: 'PARALLEL',
      label: getRouteRelationLabel('PARALLEL'),
    },
  };
}

export function getRouteOperationKind(node: RouteFlowNode): RouteOperationKind {
  return node.data.routeOperationKind === 'REWORK' || node.data.nodeType === 'REWORK' ? 'REWORK' : 'PRODUCTION';
}

function getRouteOperationIdentity(node: RouteFlowNode) {
  if (node.data.virtual) return '';
  if (node.data.operationId !== null && node.data.operationId !== undefined) return `id:${node.data.operationId}`;
  const operationCode = String(node.data.operationCode ?? '').trim();
  if (operationCode) return `code:${operationCode}`;
  const operationName = String(node.data.operationName || node.data.label || '').trim();
  return operationName ? `name:${operationName}` : '';
}

export function hasRouteProductionConflict(nodes: RouteFlowNode[], selectedNodeIds: string[]) {
  const selectedNodeIdSet = new Set(selectedNodeIds);
  const selectedReworkOperationIds = new Set(nodes
    .filter((node) => selectedNodeIdSet.has(node.id) && !node.data.virtual && getRouteOperationKind(node) === 'REWORK')
    .map(getRouteOperationIdentity)
    .filter(Boolean));
  if (selectedReworkOperationIds.size === 0) return false;
  return nodes.some((node) => (
    !node.data.virtual
    && getRouteOperationKind(node) === 'PRODUCTION'
    && selectedReworkOperationIds.has(getRouteOperationIdentity(node))
  ));
}

export function hasRouteReworkConflict(nodes: RouteFlowNode[], selectedNodeIds: string[]) {
  const selectedNodeIdSet = new Set(selectedNodeIds);
  const selectedProductionOperationIds = new Set(nodes
    .filter((node) => selectedNodeIdSet.has(node.id) && !node.data.virtual && getRouteOperationKind(node) === 'PRODUCTION')
    .map(getRouteOperationIdentity)
    .filter(Boolean));
  if (selectedProductionOperationIds.size === 0) return false;
  return nodes.some((node) => (
    !node.data.virtual
    && getRouteOperationKind(node) === 'REWORK'
    && selectedProductionOperationIds.has(getRouteOperationIdentity(node))
  ));
}

function getRouteCopyBaseLabel(label?: string | null, routeOperationKind: RouteOperationKind = 'PRODUCTION') {
  const normalizedLabel = label?.trim() || '工序';
  const baseLabel = normalizedLabel.replace(/\s+\d+$/, '').replace(/\s*返工$/, '').trim() || normalizedLabel;
  return routeOperationKind === 'REWORK' ? `${baseLabel} 返工` : baseLabel;
}

export function getNextRouteCopyLabel(nodes: RouteFlowNode[], sourceLabel?: string | null, routeOperationKind: RouteOperationKind = 'PRODUCTION') {
  const baseLabel = getRouteCopyBaseLabel(sourceLabel, routeOperationKind);
  const initialIndex = routeOperationKind === 'REWORK' ? 0 : 1;
  const maxIndex = nodes.reduce((currentMax, node) => {
    const nodeLabel = String(node.data.label || node.data.operationName || '').trim();
    if (nodeLabel === baseLabel) return Math.max(currentMax, 1);
    if (!nodeLabel.startsWith(`${baseLabel} `)) return currentMax;
    const suffix = nodeLabel.slice(baseLabel.length).trim();
    return /^\d+$/.test(suffix) ? Math.max(currentMax, Number(suffix)) : currentMax;
  }, initialIndex);
  return `${baseLabel} ${maxIndex + 1}`;
}

export function createRouteCopiedNode(node: RouteFlowNode, label: string, offsetIndex: number, routeOperationKind: RouteOperationKind): RouteFlowNode {
  return {
    ...node,
    id: `${node.id}-copy-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    position: {
      x: node.position.x + ROUTE_DESIGNER_OPERATION_NODE_WIDTH + 72,
      y: node.position.y + offsetIndex * (ROUTE_DESIGNER_OPERATION_NODE_HEIGHT + 18),
    },
    selected: true,
    data: {
      ...node.data,
      label,
      operationName: label,
      nodeType: routeOperationKind === 'REWORK' ? 'REWORK' : 'OPERATION',
      routeOperationKind,
      sourceConnected: false,
      targetConnected: false,
      parallelBadges: [],
      mergeBadges: [],
    },
  };
}

export function getRouteQuickAddPosition(nodes: RouteFlowNode[]) {
  const selectableNodes = nodes.filter((node) => !node.data.virtual);
  const selectedNode = selectableNodes.find((node) => node.selected);
  const anchor = selectedNode ?? selectableNodes.reduce<RouteFlowNode | null>((latest, node) => (
    latest === null || node.position.y > latest.position.y ? node : latest
  ), null) ?? nodes.find((node) => getRouteBoundaryNodeType(node.id, node.data.nodeType) === 'START') ?? null;
  const anchorSize = anchor ? getRouteNodeSize(anchor) : { width: ROUTE_DESIGNER_OPERATION_NODE_WIDTH, height: ROUTE_DESIGNER_OPERATION_NODE_HEIGHT };
  const position = {
    x: anchor?.position.x ?? 360,
    y: (anchor?.position.y ?? 40) + anchorSize.height + ROUTE_DESIGNER_QUICK_ADD_VERTICAL_GAP,
  };
  const occupiedNodes = nodes.filter((node) => !node.data.virtual);
  while (occupiedNodes.some((node) => (
    Math.abs(node.position.x - position.x) < ROUTE_DESIGNER_OPERATION_NODE_WIDTH
      && Math.abs(node.position.y - position.y) < ROUTE_DESIGNER_OPERATION_NODE_HEIGHT + ROUTE_DESIGNER_QUICK_ADD_VERTICAL_GAP
  ))) {
    position.y += ROUTE_DESIGNER_OPERATION_NODE_HEIGHT + ROUTE_DESIGNER_QUICK_ADD_VERTICAL_GAP;
  }
  return position;
}

function getRouteBoundaryNodeType(nodeKey?: string | null, nodeType?: string | null): keyof typeof ROUTE_VIRTUAL_NODE_LABELS | null {
  const normalizedType = nodeType?.trim().toUpperCase();
  if (normalizedType === 'START' || nodeKey === ROUTE_START_NODE_KEY) return 'START';
  if (normalizedType === 'END' || nodeKey === ROUTE_END_NODE_KEY) return 'END';
  return null;
}

export function getRouteEdgePresentation(edge?: Pick<RouteFlowEdge, 'source' | 'target' | 'data'>, routeNodeKindById = new Map<string, RouteOperationKind>()) {
  const sourceKind = edge ? routeNodeKindById.get(edge.source) : undefined;
  const targetKind = edge ? routeNodeKindById.get(edge.target) : undefined;
  const isReworkEdge = sourceKind === 'REWORK' || targetKind === 'REWORK' || edge?.data?.relationType === 'REWORK';
  if (!isReworkEdge) {
    return {
      markerEnd: ROUTE_DESIGNER_EDGE_MARKER,
      style: ROUTE_DESIGNER_CONNECTED_EDGE_STYLE,
      label: undefined,
    };
  }
  return {
    markerEnd: ROUTE_DESIGNER_REWORK_EDGE_MARKER,
    style: ROUTE_DESIGNER_REWORK_EDGE_STYLE,
    label: '返工',
    labelStyle: { fill: ROUTE_DESIGNER_REWORK_COLOR, fontSize: 12 },
  };
}

export function getRouteFallbackSourceHandleId(nodeId?: string | null) {
  return nodeId === ROUTE_END_NODE_KEY ? ROUTE_DESIGNER_HANDLE_IDS.TOP : ROUTE_DESIGNER_HANDLE_IDS.BOTTOM;
}

export function getRouteFallbackTargetHandleId(nodeId?: string | null) {
  return nodeId === ROUTE_START_NODE_KEY ? ROUTE_DESIGNER_HANDLE_IDS.BOTTOM : ROUTE_DESIGNER_HANDLE_IDS.TOP;
}

function getRouteFallbackHandlePair(sourceNodeKey?: string | null, targetNodeKey?: string | null, nodeById = new Map<string, RouteFlowNode>()) {
  const fallbackHandles = {
    sourceHandle: getRouteFallbackSourceHandleId(sourceNodeKey),
    targetHandle: getRouteFallbackTargetHandleId(targetNodeKey),
  };
  if (!sourceNodeKey || !targetNodeKey) return fallbackHandles;
  const sourceNode = nodeById.get(sourceNodeKey);
  const targetNode = nodeById.get(targetNodeKey);
  if (!sourceNode || !targetNode) return fallbackHandles;
  const sourceCenter = getRouteNodeCenter(sourceNode);
  const targetCenter = getRouteNodeCenter(targetNode);
  const deltaX = targetCenter.x - sourceCenter.x;
  const deltaY = targetCenter.y - sourceCenter.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return {
      sourceHandle: deltaX >= 0 ? ROUTE_DESIGNER_HANDLE_IDS.RIGHT : ROUTE_DESIGNER_HANDLE_IDS.LEFT,
      targetHandle: deltaX >= 0 ? ROUTE_DESIGNER_HANDLE_IDS.LEFT : ROUTE_DESIGNER_HANDLE_IDS.RIGHT,
    };
  }
  return {
    sourceHandle: deltaY >= 0 ? ROUTE_DESIGNER_HANDLE_IDS.BOTTOM : ROUTE_DESIGNER_HANDLE_IDS.TOP,
    targetHandle: deltaY >= 0 ? ROUTE_DESIGNER_HANDLE_IDS.TOP : ROUTE_DESIGNER_HANDLE_IDS.BOTTOM,
  };
}

export function normalizeRouteConnectionHandles(connection: Connection): Connection {
  return {
    ...connection,
    sourceHandle: connection.sourceHandle || getRouteFallbackSourceHandleId(connection.source),
    targetHandle: connection.targetHandle || getRouteFallbackTargetHandleId(connection.target),
  };
}

function getRouteVirtualNodeStyle(_nodeType: keyof typeof ROUTE_VIRTUAL_NODE_LABELS) {
  return { width: 96, height: 52 };
}

function getRouteNodeNumericValue(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function getRouteNodeSize(node: RouteFlowNode) {
  const renderedNode = node as RouteFlowNode & { measured?: { width?: number; height?: number }; width?: number; height?: number };
  const fallbackWidth = node.data.virtual ? 96 : ROUTE_DESIGNER_OPERATION_NODE_WIDTH;
  const fallbackHeight = node.data.virtual ? 52 : ROUTE_DESIGNER_OPERATION_NODE_HEIGHT;
  return {
    width: getRouteNodeNumericValue(renderedNode.width ?? renderedNode.measured?.width ?? node.style?.width, fallbackWidth),
    height: getRouteNodeNumericValue(renderedNode.height ?? renderedNode.measured?.height ?? node.style?.height, fallbackHeight),
  };
}

function createRouteVirtualNode(nodeType: keyof typeof ROUTE_VIRTUAL_NODE_LABELS, position?: { x: number; y: number }): RouteFlowNode {
  const isStart = nodeType === 'START';
  const label = ROUTE_VIRTUAL_NODE_LABELS[nodeType];
  const data: RouteFlowNodeData = isStart ? {
    label,
    operationId: null,
    operationCode: null,
    operationName: label,
    nodeType: 'START',
    virtual: true,
  } : {
    label,
    operationId: null,
    operationCode: null,
    operationName: label,
    nodeType: 'END',
    virtual: true,
  };
  return {
    id: isStart ? ROUTE_START_NODE_KEY : ROUTE_END_NODE_KEY,
    type: 'routeDesigner',
    position: position ?? { x: 360, y: isStart ? 40 : 520 },
    data,
    draggable: true,
    selectable: true,
    deletable: false,
    style: getRouteVirtualNodeStyle(nodeType),
  };
}

function normalizeRouteBoundaryNode(node: RouteFlowNode): RouteFlowNode {
  const nodeType = getRouteBoundaryNodeType(node.id, node.data.nodeType);
  if (!nodeType) return node;
  const label = ROUTE_VIRTUAL_NODE_LABELS[nodeType];
  return {
    ...node,
    id: nodeType === 'START' ? ROUTE_START_NODE_KEY : ROUTE_END_NODE_KEY,
    type: 'routeDesigner',
    data: {
      ...node.data,
      label,
      operationId: null,
      operationCode: null,
      operationName: label,
      nodeType,
      virtual: true,
    },
    draggable: true,
    selectable: true,
    deletable: false,
    style: getRouteVirtualNodeStyle(nodeType),
  };
}

export function ensureRouteBoundaryNodes(nodes: RouteFlowNode[]): RouteFlowNode[] {
  const normalizedNodes = nodes.map(normalizeRouteBoundaryNode);
  const hasStart = normalizedNodes.some((node) => getRouteBoundaryNodeType(node.id, node.data.nodeType) === 'START');
  const hasEnd = normalizedNodes.some((node) => getRouteBoundaryNodeType(node.id, node.data.nodeType) === 'END');
  return [
    ...(hasStart ? [] : [createRouteVirtualNode('START')]),
    ...normalizedNodes,
    ...(hasEnd ? [] : [createRouteVirtualNode('END')]),
  ];
}

export function fromRouteGraphResponse(graph?: RouteGraphResponse | null): { nodes: RouteFlowNode[]; edges: RouteFlowEdge[] } {
  const nodes = ensureRouteBoundaryNodes((graph?.nodes ?? []).map<RouteFlowNode>((node, index) => {
    const boundaryNodeType = getRouteBoundaryNodeType(node.nodeKey, node.nodeType);
    return {
      id: node.nodeKey,
      type: 'routeDesigner',
      position: {
        x: node.positionX ?? (boundaryNodeType ? 360 : 80 + index * 180),
        y: node.positionY ?? (boundaryNodeType === 'START' ? 40 : boundaryNodeType === 'END' ? 520 : 120),
      },
      data: {
        label: boundaryNodeType ? ROUTE_VIRTUAL_NODE_LABELS[boundaryNodeType] : node.operationName || node.operationCode || node.nodeKey,
        operationId: boundaryNodeType ? null : node.operationId ?? null,
        operationCode: boundaryNodeType ? null : node.operationCode ?? null,
        operationName: boundaryNodeType ? ROUTE_VIRTUAL_NODE_LABELS[boundaryNodeType] : node.operationName ?? null,
        nodeType: boundaryNodeType ?? node.nodeType ?? 'OPERATION',
        routeOperationKind: node.nodeType === 'REWORK' ? 'REWORK' : 'PRODUCTION',
        virtual: Boolean(boundaryNodeType),
      },
    };
  }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = (graph?.relations ?? []).map<RouteFlowEdge>((relation, index) => {
    const label = relation.label || getRouteRelationLabel(relation.relationType);
    const edgePresentation = getRouteEdgePresentation();
    const fallbackHandles = getRouteFallbackHandlePair(relation.sourceNodeKey, relation.targetNodeKey, nodeById);
    return {
      id: `${relation.sourceNodeKey}-${relation.targetNodeKey}-${index}`,
      source: relation.sourceNodeKey,
      target: relation.targetNodeKey,
      sourceHandle: relation.sourceHandle || fallbackHandles.sourceHandle,
      targetHandle: relation.targetHandle || fallbackHandles.targetHandle,
      type: 'smoothstep',
      ...edgePresentation,
      data: {
        relationType: relation.relationType || 'SEQUENTIAL',
        label,
        ruleExpression: relation.ruleExpression ?? null,
      },
    };
  });
  return { nodes, edges };
}

export function toRouteGraphPayload(nodes: RouteFlowNode[], edges: RouteFlowEdge[]): RouteGraphPayload {
  const graphNodes = ensureRouteBoundaryNodes(nodes);
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]));
  const parallelSourceIds = getRouteParallelSourceIds(graphNodes, edges);
  return {
    nodes: graphNodes.map<RouteNodeRecord>((node, index) => ({
      nodeKey: node.id,
      operationId: node.data.virtual ? null : node.data.operationId ?? null,
      operationCode: node.data.virtual ? null : node.data.operationCode ?? null,
      operationName: node.data.operationName ?? node.data.label,
      nodeType: node.data.nodeType === 'START' ? 'START' : node.data.nodeType === 'END' ? 'END' : node.data.routeOperationKind === 'REWORK' ? 'REWORK' : 'OPERATION',
      positionX: Math.round(node.position.x),
      positionY: Math.round(node.position.y),
      sortOrder: index + 1,
    })),
    relations: edges
      .filter((edge) => edge.source && edge.target)
      .map<RouteRelationRecord>((edge, index) => {
        const originalType = edge.data?.relationType || 'SEQUENTIAL';
        const normalEdge = nodeById.get(edge.source)?.data.nodeType !== 'REWORK' && nodeById.get(edge.target)?.data.nodeType !== 'REWORK';
        const relationType = originalType === 'SEQUENTIAL' && normalEdge && parallelSourceIds.has(edge.source) ? 'PARALLEL' : originalType;
        const fallbackHandles = getRouteFallbackHandlePair(edge.source, edge.target, nodeById);
        return {
          sourceNodeKey: edge.source,
          targetNodeKey: edge.target,
          sourceHandle: edge.sourceHandle || fallbackHandles.sourceHandle,
          targetHandle: edge.targetHandle || fallbackHandles.targetHandle,
          relationType,
          label: edge.data?.label || getRouteRelationLabel(relationType),
          ruleExpression: edge.data?.ruleExpression ?? null,
          priority: index + 1,
        };
      }),
  };
}

export function presentRouteGraph(nodes: RouteFlowNode[], edges: RouteFlowEdge[], connectionDragging = false, hoverNodeId: string | null = null): { nodes: RouteFlowNode[]; edges: RouteFlowEdge[] } {
  const connectedSourceNodeIds = new Set<string>();
  const connectedTargetNodeIds = new Set<string>();
  const connectedHandleIdsByNode = new Map<string, Set<string>>();
  const addConnectedHandleId = (nodeId: string, handleId: string) => {
    const current = connectedHandleIdsByNode.get(nodeId) ?? new Set<string>();
    current.add(handleId);
    connectedHandleIdsByNode.set(nodeId, current);
  };
  const routeParallelBadges = getRouteParallelBadgeMaps(getRouteParallelGroups(nodes, edges));
  const routeReworkBadges = getRouteReworkBadgeMaps(nodes);
  const occurrences = new Map<string, string[]>();
  nodes.filter((node) => !node.data.virtual && node.data.operationId != null).forEach((node) => {
    const key = String(node.data.operationId);
    occurrences.set(key, [...(occurrences.get(key) ?? []), node.id]);
  });
  edges.forEach((edge) => {
    if (edge.source) {
      connectedSourceNodeIds.add(edge.source);
      addConnectedHandleId(edge.source, edge.sourceHandle || getRouteFallbackSourceHandleId(edge.source));
    }
    if (edge.target) {
      connectedTargetNodeIds.add(edge.target);
      addConnectedHandleId(edge.target, edge.targetHandle || getRouteFallbackTargetHandleId(edge.target));
    }
  });
  const presentedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      sourceConnected: connectedSourceNodeIds.has(node.id),
      targetConnected: connectedTargetNodeIds.has(node.id),
      connectedHandleIds: [...(connectedHandleIdsByNode.get(node.id) ?? [])],
      showConnectableHandles: connectionDragging && hoverNodeId === node.id && node.data.nodeType !== 'START',
      parallelBadges: routeParallelBadges.parallel.get(node.id) ?? [],
      mergeBadges: routeParallelBadges.merge.get(node.id) ?? [],
      reworkBadges: routeReworkBadges.rework.get(node.id) ?? [],
      occurrenceBadge: (occurrences.get(String(node.data.operationId))?.length ?? 0) > 1
        ? `节点 ${(occurrences.get(String(node.data.operationId))?.indexOf(node.id) ?? 0) + 1}` : undefined,
    },
  }));

  const routeNodeKindById = new Map(nodes.map((node) => [node.id, getRouteOperationKind(node)]));
  return {
    nodes: presentedNodes,
    edges: edges.map((edge) => ({ ...edge, ...getRouteEdgePresentation(edge, routeNodeKindById) })),
  };
}
