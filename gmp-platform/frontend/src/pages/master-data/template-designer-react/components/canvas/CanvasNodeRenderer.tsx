import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { Box, IconButton, Stack } from '@mui/material';
import CanvasDropZone from './CanvasDropZone';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasNode } from '../../types';

function isAbsoluteNode(node: CanvasNode) {
  return node.style.position === 'absolute';
}

export default function CanvasNodeRenderer({ nodes }: { nodes: CanvasNode[] }) {
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);
  const moveNode = useTemplateDesignerStore((state) => state.moveNode);
  const removeNode = useTemplateDesignerStore((state) => state.removeNode);

  const renderNode = (node: CanvasNode) => {
    const definition = getComponentDefinition(node.type);
    const Renderer = definition.renderDesigner;
    const selected = node.id === selectedNodeId;
    const absolute = isAbsoluteNode(node);

    return (
      <Box
        key={node.id}
        sx={absolute ? {
          position: 'absolute',
          left: Number(node.style.compLeft ?? 0),
          top: Number(node.style.compTop ?? 0),
          width: Math.max(40, Number(node.style.compWidth ?? 240)),
          minHeight: Math.max(28, Number(node.style.compHeight ?? 40)),
          zIndex: selected ? 2 : 1,
        } : undefined}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Renderer
              node={node}
              selected={selected}
              onSelect={() => setSelectedNodeId(node.id)}
            />
          </Box>
          {selected ? (
            <>
              <IconButton
                size="small"
                aria-label="上移节点"
                onClick={(event) => {
                  event.stopPropagation();
                  moveNode(node.id, 'up');
                }}
              >
                <ArrowUpward fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="下移节点"
                onClick={(event) => {
                  event.stopPropagation();
                  moveNode(node.id, 'down');
                }}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                aria-label="删除节点"
                onClick={(event) => {
                  event.stopPropagation();
                  removeNode(node.id);
                }}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </>
          ) : null}
        </Box>
        {node.children?.map ? (
          <Box sx={{ mt: 1, ml: 2, pl: 2, borderLeft: '1px dashed #d0d7e2' }}>
            <CanvasDropZone parentId={node.id} />
            <CanvasNodeRenderer nodes={node.children} />
          </Box>
        ) : null}
      </Box>
    );
  };

  const absoluteNodes = nodes.filter((node) => isAbsoluteNode(node));
  const flowNodes = nodes.filter((node) => !isAbsoluteNode(node));

  return (
    <>
      {absoluteNodes.length ? (
        <Box sx={{ position: 'relative' }}>
          {absoluteNodes.map((node) => renderNode(node))}
        </Box>
      ) : null}
      {flowNodes.length ? (
        <Stack spacing={1.5}>
          {flowNodes.map((node) => renderNode(node))}
        </Stack>
      ) : null}
    </>
  );
}
