import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  selectNode: (nodeId: string | null) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (nodeId) => set((s) => ({
    nodes: s.nodes.filter((n) => n.id !== nodeId),
    edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  })),
  updateNode: (nodeId, data) => set((s) => ({
    nodes: s.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n),
  })),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  reset: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));
