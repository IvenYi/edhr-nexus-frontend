import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { Box, IconButton, Stack } from '@mui/material';
import CanvasDropZone from './CanvasDropZone';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasNode, CanvasSelectionRange } from '../../types';

const CELL_FIELD_INSET = 3;

function isAbsoluteNode(node: CanvasNode) {
  return node.style.position === 'absolute';
}

function readNodeCellRange(node: CanvasNode): CanvasSelectionRange | null {
  const value = node.style.cellRange;
  if (!value || typeof value !== 'object') return null;

  const range = value as Partial<CanvasSelectionRange>;
  const { t, l, b, r } = range;
  if (typeof t !== 'number' || typeof l !== 'number' || typeof b !== 'number' || typeof r !== 'number') {
    return null;
  }
  return { t, l, b, r };
}

export default function CanvasNodeRenderer({ nodes }: { nodes: CanvasNode[] }) {
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);
  const setSelectedRange = useTemplateDesignerStore((state) => state.setSelectedRange);
  const moveNode = useTemplateDesignerStore((state) => state.moveNode);
  const removeNode = useTemplateDesignerStore((state) => state.removeNode);

  const renderNode = (node: CanvasNode) => {
    const definition = getComponentDefinition(node.type);
    const Renderer = definition.renderDesigner;
    const selected = node.id === selectedNodeId;
    const absolute = isAbsoluteNode(node);
    const cellInset = absolute && node.bindings?.fieldId ? CELL_FIELD_INSET : 0;
    const absoluteLeft = Number(node.style.compLeft ?? 0);
    const absoluteTop = Number(node.style.compTop ?? 0);
    const absoluteWidth = Number(node.style.compWidth ?? 240);
    const absoluteHeight = Number(node.style.compHeight ?? 40);
    const handleSelect = () => {
      const cellRange = readNodeCellRange(node);
      if (cellRange) {
        setSelectedRange(cellRange, { row: cellRange.t, col: cellRange.l });
      }
      setSelectedNodeId(node.id);
    };

    return (
      <Box
        key={node.id}
        sx={absolute ? {
          position: 'absolute',
          left: absoluteLeft + cellInset,
          top: absoluteTop + cellInset,
          width: Math.max(0, absoluteWidth - cellInset * 2),
          height: Math.max(0, absoluteHeight - cellInset * 2),
          zIndex: selected ? 2 : 1,
          overflow: 'hidden',
        } : undefined}
      >
        {absolute ? (
          <Renderer
            node={node}
            selected={selected}
            onSelect={handleSelect}
            renderMode="cell"
          />
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Renderer
                  node={node}
                  selected={selected}
                  onSelect={handleSelect}
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
          </>
        )}
      </Box>
    );
  };

  const absoluteNodes = nodes.filter((node) => isAbsoluteNode(node));
  const flowNodes = nodes.filter((node) => !isAbsoluteNode(node));

  return (
    <>
      {absoluteNodes.length ? (
        <Box
          data-canvas-absolute-node-layer="true"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            '& > *': { pointerEvents: 'auto' },
          }}
        >
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
