import { Box, Stack } from '@mui/material';
import CanvasDropZone from './CanvasDropZone';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasNode } from '../../types';

export default function CanvasNodeRenderer({ nodes }: { nodes: CanvasNode[] }) {
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);

  return (
    <Stack spacing={1.5}>
      {nodes.map((node) => {
        const definition = getComponentDefinition(node.type);
        const Renderer = definition.renderDesigner;
        return (
          <Box key={node.id}>
            <Renderer
              node={node}
              selected={node.id === selectedNodeId}
              onSelect={() => setSelectedNodeId(node.id)}
            />
            {node.children?.map ? (
              <Box sx={{ mt: 1, ml: 2, pl: 2, borderLeft: '1px dashed #d0d7e2' }}>
                <CanvasDropZone parentId={node.id} />
                <CanvasNodeRenderer nodes={node.children} />
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Stack>
  );
}
