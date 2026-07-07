export interface WorkflowNodeData {
  label: string;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowDesignState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  config: Record<string, unknown>;
}
