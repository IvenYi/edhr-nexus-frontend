import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { Box, IconButton, Stack } from '@mui/material';
import CanvasDropZone from './CanvasDropZone';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasNode, CanvasSelectionRange } from '../../types';

const CELL_FIELD_INSET = 3;
const MIN_COMPONENT_WIDTH = 32;
const MIN_COMPONENT_HEIGHT = 20;
const RESIZE_DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

type ResizeDirection = typeof RESIZE_DIRECTIONS[number];

interface CellRangeLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  textAlign?: string;
  verticalAlign?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

interface WordTableCellTarget {
  blockId: string;
  cellId: string;
}

interface NodeLayoutPreview {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CanvasNodeRendererProps {
  nodes: CanvasNode[];
  resolveCellRangeLayout?: (range: CanvasSelectionRange) => CellRangeLayout;
  resolveWordTableCellLayout?: (target: WordTableCellTarget) => CellRangeLayout | null;
  onCellFieldMouseDown?: (range: CanvasSelectionRange, event: ReactMouseEvent<HTMLElement>) => void;
  onCellFieldContextMenu?: (range: CanvasSelectionRange, event: ReactMouseEvent<HTMLElement>) => void;
  onWordTableFieldDrop?: (target: WordTableCellTarget, event: ReactDragEvent<HTMLElement>) => void;
  onNodeSelect?: () => void;
}

function isAbsoluteNode(node: CanvasNode) {
  return node.style.position === 'absolute';
}

function readNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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

function readNodeWordTableCellTarget(node: CanvasNode): WordTableCellTarget | null {
  const value = node.style.wordTableCell;
  if (!value || typeof value !== 'object') return null;

  const target = value as Partial<WordTableCellTarget>;
  if (typeof target.blockId !== 'string' || typeof target.cellId !== 'string') return null;
  return { blockId: target.blockId, cellId: target.cellId };
}

export default function CanvasNodeRenderer({
  nodes,
  resolveCellRangeLayout,
  resolveWordTableCellLayout,
  onCellFieldMouseDown,
  onCellFieldContextMenu,
  onWordTableFieldDrop,
  onNodeSelect,
}: CanvasNodeRendererProps) {
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);
  const setSelectedRange = useTemplateDesignerStore((state) => state.setSelectedRange);
  const setActiveCanvasRail = useTemplateDesignerStore((state) => state.setActiveCanvasRail);
  const moveNode = useTemplateDesignerStore((state) => state.moveNode);
  const removeNode = useTemplateDesignerStore((state) => state.removeNode);
  const updateNodeStyle = useTemplateDesignerStore((state) => state.updateNodeStyle);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const nodeLayoutPreviewRef = useRef<Record<string, NodeLayoutPreview>>({});
  const [nodeLayoutPreviews, setNodeLayoutPreviews] = useState<Record<string, NodeLayoutPreview>>({});
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const setNodeLayoutPreview = (nodeId: string, layout: NodeLayoutPreview) => {
    nodeLayoutPreviewRef.current = { ...nodeLayoutPreviewRef.current, [nodeId]: layout };
    setNodeLayoutPreviews(nodeLayoutPreviewRef.current);
  };

  const clearNodeLayoutPreview = (nodeId: string) => {
    if (!nodeLayoutPreviewRef.current[nodeId]) return;
    const { [nodeId]: _removed, ...remaining } = nodeLayoutPreviewRef.current;
    nodeLayoutPreviewRef.current = remaining;
    setNodeLayoutPreviews(remaining);
  };

  useEffect(() => () => {
    pointerCleanupRef.current?.();
  }, []);

  const beginNodePointerOperation = (
    event: ReactPointerEvent<HTMLElement>,
    node: CanvasNode,
    operation: 'move' | 'resize',
    direction?: ResizeDirection,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    pointerCleanupRef.current?.();

    const ownerDocument = event.currentTarget.ownerDocument;
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = readNumber(node.style.compLeft, 0);
    const startTop = readNumber(node.style.compTop, 0);
    const startWidth = Math.max(MIN_COMPONENT_WIDTH, readNumber(node.style.compWidth, 240));
    const startHeight = Math.max(MIN_COMPONENT_HEIGHT, readNumber(node.style.compHeight, 40));

    const finish = (shouldCommit: boolean) => {
      ownerDocument.removeEventListener('pointermove', handleMove);
      ownerDocument.removeEventListener('pointerup', handleEnd);
      ownerDocument.removeEventListener('pointercancel', handleEnd);
      pointerCleanupRef.current = null;

      const preview = nodeLayoutPreviewRef.current[node.id];
      clearNodeLayoutPreview(node.id);
      if (!shouldCommit || !preview) return;

      if (
        preview.left !== startLeft
        || preview.top !== startTop
        || preview.width !== startWidth
        || preview.height !== startHeight
      ) {
        updateNodeStyle(node.id, {
          compLeft: preview.left,
          compTop: preview.top,
          compWidth: preview.width,
          compHeight: preview.height,
        });
      }
    };

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (operation === 'move') {
        setNodeLayoutPreview(node.id, {
          left: Math.max(0, Math.round(startLeft + deltaX)),
          top: Math.max(0, Math.round(startTop + deltaY)),
          width: startWidth,
          height: startHeight,
        });
        return;
      }

      const resizeDirection = direction ?? 'se';
      const nextLayout: NodeLayoutPreview = {
        left: startLeft,
        top: startTop,
        width: startWidth,
        height: startHeight,
      };
      if (resizeDirection.includes('e')) nextLayout.width = Math.max(MIN_COMPONENT_WIDTH, Math.round(startWidth + deltaX));
      if (resizeDirection.includes('s')) nextLayout.height = Math.max(MIN_COMPONENT_HEIGHT, Math.round(startHeight + deltaY));
      if (resizeDirection.includes('w')) {
        const width = Math.max(MIN_COMPONENT_WIDTH, Math.round(startWidth - deltaX));
        nextLayout.width = width;
        nextLayout.left = Math.max(0, Math.round(startLeft + startWidth - width));
      }
      if (resizeDirection.includes('n')) {
        const height = Math.max(MIN_COMPONENT_HEIGHT, Math.round(startHeight - deltaY));
        nextLayout.height = height;
        nextLayout.top = Math.max(0, Math.round(startTop + startHeight - height));
      }
      setNodeLayoutPreview(node.id, nextLayout);
    };

    const handleEnd = () => finish(true);
    ownerDocument.addEventListener('pointermove', handleMove);
    ownerDocument.addEventListener('pointerup', handleEnd);
    ownerDocument.addEventListener('pointercancel', handleEnd);
    pointerCleanupRef.current = () => finish(false);
  };

  const renderNode = (node: CanvasNode) => {
    const definition = getComponentDefinition(node.type);
    const Renderer = definition.renderDesigner;
    const selected = node.id === selectedNodeId;
    const hovered = node.id === hoveredNodeId;
    const absolute = isAbsoluteNode(node);
    const cellRange = readNodeCellRange(node);
    const wordTableCellTarget = readNodeWordTableCellTarget(node);
    if (wordTableCellTarget && node.bindings?.fieldId) return null;
    const cellRangeLayout = absolute && node.bindings?.fieldId && cellRange
      ? resolveCellRangeLayout?.(cellRange) ?? null
      : null;
    const wordTableCellLayout = absolute && node.bindings?.fieldId && wordTableCellTarget
      ? resolveWordTableCellLayout?.(wordTableCellTarget) ?? null
      : null;
    const wordTableCellSiblingNodes = wordTableCellTarget
      ? nodes.filter((candidate) => {
          const candidateTarget = readNodeWordTableCellTarget(candidate);
          return candidateTarget?.blockId === wordTableCellTarget.blockId && candidateTarget.cellId === wordTableCellTarget.cellId;
        })
      : [];
    const wordTableCellSiblingIndex = wordTableCellSiblingNodes.findIndex((candidate) => candidate.id === node.id);
    const wordTableFieldGap = 2;
    const wordTableFieldHeight = wordTableCellLayout
      ? Math.max(
          MIN_COMPONENT_HEIGHT,
          Math.floor((wordTableCellLayout.height - CELL_FIELD_INSET * 2 - wordTableFieldGap * (wordTableCellSiblingNodes.length - 1)) / wordTableCellSiblingNodes.length),
        )
      : 0;
    const resolvedCellLayout = wordTableCellLayout ?? cellRangeLayout;
    const cellInset = absolute && node.bindings?.fieldId ? (node.type === 'sub-table' ? 0 : CELL_FIELD_INSET) : 0;
    const persistedWidth = readNumber(node.style.compWidth, 240);
    const persistedHeight = readNumber(node.style.compHeight, 40);
    const layoutPreview = nodeLayoutPreviews[node.id];
    const absoluteLeft = resolvedCellLayout ? resolvedCellLayout.left : layoutPreview?.left ?? readNumber(node.style.compLeft, 0);
    const absoluteTop = wordTableCellLayout
      ? wordTableCellLayout.top + Math.max(0, wordTableCellSiblingIndex) * (wordTableFieldHeight + wordTableFieldGap)
      : resolvedCellLayout ? resolvedCellLayout.top : layoutPreview?.top ?? readNumber(node.style.compTop, 0);
    const absoluteWidth = resolvedCellLayout ? resolvedCellLayout.width : persistedWidth;
    const absoluteHeight = wordTableCellLayout ? wordTableFieldHeight : resolvedCellLayout ? resolvedCellLayout.height : persistedHeight;
    const renderedWidth = resolvedCellLayout ? absoluteWidth : layoutPreview?.width ?? absoluteWidth;
    const renderedHeight = resolvedCellLayout ? absoluteHeight : layoutPreview?.height ?? absoluteHeight;
    const rendererNode = resolvedCellLayout
      ? {
          ...node,
          style: {
            ...node.style,
            compLeft: absoluteLeft,
            compTop: absoluteTop,
            compWidth: renderedWidth,
            compHeight: renderedHeight,
            wordTableCellTextAlign: wordTableCellLayout?.textAlign,
            wordTableCellVerticalAlign: wordTableCellLayout?.verticalAlign,
            wordTableCellPaddingLeft: wordTableCellLayout?.paddingLeft,
            wordTableCellPaddingRight: wordTableCellLayout?.paddingRight,
            wordTableCellPaddingTop: wordTableCellLayout?.paddingTop,
            wordTableCellPaddingBottom: wordTableCellLayout?.paddingBottom,
            wordTableCellInset: wordTableCellLayout ? cellInset : undefined,
          },
        }
      : node;
    const handleSelect = () => {
      onNodeSelect?.();
      if (cellRange) {
        setSelectedRange(cellRange, { row: cellRange.t, col: cellRange.l });
        const activeRail = node.type === 'sub-table' ? 'fields' : 'config';
        if (activeRail === 'config') {
          setActiveCanvasRail('config');
        } else {
          setActiveCanvasRail(activeRail);
        }
      }
      setSelectedNodeId(node.id);
    };
    const handleOpenConfig = () => {
      if (cellRange) {
        setSelectedRange(cellRange, { row: cellRange.t, col: cellRange.l });
      }
      setSelectedNodeId(node.id);
      setActiveCanvasRail('config');
    };

    return (
      <Box
        key={node.id}
        data-canvas-node="true"
        tabIndex={absolute ? -1 : undefined}
        onPointerDown={(event) => {
          if (
            !absolute
            || cellRange
            || wordTableCellTarget
            || event.detail > 1
            || (event.target as HTMLElement).closest('[contenteditable="true"]')
          ) return;
          // The canvas delete handler is scoped to the focused paper surface.
          // Images have no editable DOM target, so focus the selected node explicitly.
          event.currentTarget.focus({ preventScroll: true });
          handleSelect();
          beginNodePointerOperation(event, node, 'move');
        }}
        onPointerEnter={() => setHoveredNodeId(node.id)}
        onPointerLeave={() => setHoveredNodeId((current) => current === node.id ? null : current)}
        sx={absolute ? {
          position: 'absolute',
          left: absoluteLeft + cellInset,
          top: absoluteTop + cellInset,
          ...(resolvedCellLayout ? {
            width: Math.max(0, absoluteWidth - cellInset * 2),
            height: Math.max(0, absoluteHeight - cellInset * 2),
          } : {
            width: Math.max(0, renderedWidth),
            height: Math.max(0, renderedHeight),
          }),
          zIndex: selected ? 2 : 1,
          overflow: selected ? 'visible' : (node.type === 'sub-table' ? 'visible' : 'hidden'),
          pointerEvents: node.type === 'sub-table' ? 'none' : 'auto',
        } : undefined}
        onDragOver={(event) => {
          if (!wordTableCellTarget || !event.dataTransfer.types.includes('application/x-template-designer-field')) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(event) => {
          if (!wordTableCellTarget) return;
          onWordTableFieldDrop?.(wordTableCellTarget, event);
        }}
      >
        {absolute ? (
          <>
            <Renderer
              node={rendererNode}
              selected={selected}
              onSelect={handleSelect}
              onOpenConfig={handleOpenConfig}
              onCellMouseDown={(event) => {
                if (cellRange) {
                  onCellFieldMouseDown?.(cellRange, event);
                }
              }}
              onCellContextMenu={(event) => {
                if (cellRange) {
                  onCellFieldContextMenu?.(cellRange, event);
                }
              }}
              renderMode={wordTableCellTarget ? 'word-table-cell' : 'cell'}
            />
            {!cellRange && !wordTableCellTarget && selected ? (
              <>
              {RESIZE_DIRECTIONS.map((direction) => (
                <Box
                  key={direction}
                  data-canvas-node-resize-handle={direction}
                  onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => beginNodePointerOperation(event, node, 'resize', direction)}
                  sx={{
                    position: 'absolute', width: 8, height: 8, border: '1px solid #1976d2', bgcolor: '#fff', zIndex: 4,
                    ...(direction.includes('n') ? { top: -4 } : direction.includes('s') ? { bottom: -4 } : { top: '50%', transform: 'translateY(-50%)' }),
                    ...(direction.includes('w') ? { left: -4 } : direction.includes('e') ? { right: -4 } : { left: '50%', transform: direction.includes('n') || direction.includes('s') ? 'translateX(-50%)' : 'translate(-50%, -50%)' }),
                    cursor: direction === 'n' || direction === 's' ? 'ns-resize' : direction === 'e' || direction === 'w' ? 'ew-resize' : direction === 'ne' || direction === 'sw' ? 'nesw-resize' : 'nwse-resize',
                  }}
                />
              ))}
              </>
            ) : null}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Renderer
                  node={node}
                  selected={selected}
                  onSelect={handleSelect}
                  onOpenConfig={handleOpenConfig}
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
                <CanvasNodeRenderer
                  nodes={node.children}
                  resolveCellRangeLayout={resolveCellRangeLayout}
                  resolveWordTableCellLayout={resolveWordTableCellLayout}
                  onCellFieldMouseDown={onCellFieldMouseDown}
                  onCellFieldContextMenu={onCellFieldContextMenu}
                  onWordTableFieldDrop={onWordTableFieldDrop}
                  onNodeSelect={onNodeSelect}
                />
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
            zIndex: 2,
            pointerEvents: 'none',
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
