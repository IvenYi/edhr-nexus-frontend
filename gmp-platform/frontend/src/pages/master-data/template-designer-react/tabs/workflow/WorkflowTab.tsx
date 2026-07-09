import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const hasDocument = Boolean(document);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(document?.workflow.nodes as Node[] ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(document?.workflow.edges as Edge[] ?? []);

  useEffect(() => {
    setNodes(document?.workflow.nodes as Node[] ?? []);
  }, [document?.workflow.nodes, setNodes]);

  useEffect(() => {
    setEdges(document?.workflow.edges as Edge[] ?? []);
  }, [document?.workflow.edges, setEdges]);

  useEffect(() => {
    if (!hasDocument) return;
    setWorkflowNodes(nodes as WorkflowNode[]);
  }, [hasDocument, nodes, setWorkflowNodes]);

  useEffect(() => {
    if (!hasDocument) return;
    setWorkflowEdges(edges as WorkflowEdge[]);
  }, [hasDocument, edges, setWorkflowEdges]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const handleConnect = (connection: Connection) => {
    setEdges((current) => addEdge(connection, current));
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' }, gap: 2, height: '100%', minHeight: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={() => addWorkflowNode()}>
          新增节点
        </Button>
        <Box sx={{ flex: 1, minHeight: 0, height: '100%', bgcolor: '#fff', borderRadius: 1, overflow: 'hidden' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              fitView
            >
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>流程节点属性</Typography>
          {selectedNode ? (
            <TextField
              size="small"
              label="节点名称"
              value={String(selectedNode.data?.label ?? '')}
              onChange={(event) => {
                const value = event.target.value;
                setNodes((current) => current.map((node) => (
                  node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, label: value } }
                    : node
                )));
              }}
              fullWidth
            />
          ) : (
            <Typography color="text.secondary">请选择一个流程节点后再编辑。</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
