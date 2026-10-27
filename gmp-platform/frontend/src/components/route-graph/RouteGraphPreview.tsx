import { FlowCanvasBackground, FlowCanvasControls } from '@/components/flow-designer/FlowDesigner';
import { useMemo } from 'react';
import { Box } from '@mui/material';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RouteGraphResponse } from '@/api/master-data';
import { fromRouteGraphResponse, presentRouteGraph } from './routeGraph';
import { routeDesignerNodeTypes } from './RouteGraphNode';

export default function RouteGraphPreview({ graph, selectedNodeKey, onSelectNode }: {
  graph: RouteGraphResponse;
  selectedNodeKey?: string;
  onSelectNode?: (nodeKey: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const graphView = fromRouteGraphResponse(graph);
    const presented = presentRouteGraph(graphView.nodes, graphView.edges);
    return {
      ...presented,
      nodes: presented.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeKey,
        draggable: false,
        deletable: false,
        selectable: Boolean(onSelectNode),
      })),
    };
  }, [graph, selectedNodeKey, onSelectNode]);
  return <Box data-route-graph-preview sx={{ height: '100%', minHeight: 0, minWidth: 0 }}>
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={routeDesignerNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={Boolean(onSelectNode)}
        deleteKeyCode={null}
        panOnDrag
        zoomOnDoubleClick={false}
        onNodeClick={(_, node) => onSelectNode?.(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <FlowCanvasBackground />
        <FlowCanvasControls editable={false} />
      </ReactFlow>
    </ReactFlowProvider>
  </Box>;
}
