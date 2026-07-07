import { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { WorkflowEdge, WorkflowNode } from '../../types';

export default function WorkflowTab() {
  const document = useTemplateDesignerStore((state) => state.document);
  const addWorkflowNode = useTemplateDesignerStore((state) => state.addWorkflowNode);
  const setWorkflowNodes = useTemplateDesignerStore((state) => state.setWorkflowNodes);
  const setWorkflowEdges = useTemplateDesignerStore((state) => state.setWorkflowEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(document?.workflow.nodes as Node[] ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(document?.workflow.edges as Edge[] ?? []);

  useEffect(() => {
    setNodes(document?.workflow.nodes as Node[] ?? []);
  }, [document?.workflow.nodes, setNodes]);

  useEffect(() => {
    setEdges(document?.workflow.edges as Edge[] ?? []);
  }, [document?.workflow.edges, setEdges]);

  useEffect(() => {
    if (!document) return;
    setWorkflowNodes(nodes as WorkflowNode[]);
  }, [document, nodes, setWorkflowNodes]);

  useEffect(() => {
    if (!document) return;
    setWorkflowEdges(edges as WorkflowEdge[]);
  }, [document, edges, setWorkflowEdges]);

  const handleConnect = (connection: Connection) => {
    setEdges((current) => addEdge(connection, current));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={() => addWorkflowNode()}>
        新增节点
      </Button>
      <Box sx={{ flex: 1, minHeight: 480, bgcolor: '#fff', borderRadius: 1, overflow: 'hidden' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            fitView
          >
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
