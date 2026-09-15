import { Box } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import type { CanvasNode, CanvasPage, CanvasWordTableBlock } from '../../types';
import { constrainWordTableToCanvas } from '../../utils/wordTableLayout';
import { decodeWordTableCellContent } from '../../utils/wordTableInlineContent';

const MM_TO_PX = 96 / 25.4;

function textStyle(style?: Record<string, unknown>): CSSProperties {
  return {
    color: String(style?.color ?? '#1f2937'),
    fontSize: Number(style?.fontSize ?? 13),
    fontFamily: style?.fontFamily as string | undefined,
    fontWeight: style?.fontWeight as CSSProperties['fontWeight'],
    fontStyle: style?.fontStyle as string | undefined,
    textDecoration: style?.textDecoration as string | undefined,
    textAlign: (style?.textAlign ?? 'left') as CSSProperties['textAlign'],
    lineHeight: style?.lineHeight as CSSProperties['lineHeight'],
    whiteSpace: style?.whiteSpace === 'nowrap' ? 'nowrap' : 'pre-wrap',
    overflowWrap: 'break-word',
    paddingTop: Number(style?.paddingTop ?? 0),
    paddingRight: Number(style?.paddingRight ?? 0),
    paddingBottom: Number(style?.paddingBottom ?? 0),
    paddingLeft: Number(style?.paddingLeft ?? 0),
    backgroundColor: style?.backgroundColor as string | undefined,
  };
}

function flattenNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

function WordTablePreview({ table, nodes, legacyBorders, renderField }: {
  table: CanvasWordTableBlock;
  nodes: CanvasNode[];
  legacyBorders: boolean;
  renderField: (node: CanvasNode) => ReactNode;
}) {
  return (
    <Box data-word-preview-table={table.id} sx={{ position: 'absolute', ...table.layout,
      display: 'grid', gridTemplateColumns: table.columnWidths.map((width) => `${width}px`).join(' '),
      gridTemplateRows: table.rowHeights.map((height) => `${height}px`).join(' ') }}>
      {table.cells.map((cell) => {
        const fields = nodes.filter((node) => {
          const target = node.style.wordTableCell as { blockId?: string; cellId?: string } | undefined;
          return target?.blockId === table.id && target.cellId === cell.id;
        });
        const segments = decodeWordTableCellContent(cell.text, fields.map((node) => node.id));
        const inlineIds = new Set(segments.flatMap((segment) => segment.type === 'field' ? [segment.nodeId] : []));
        const border = (edge: 'top' | 'right' | 'bottom' | 'left') => (
          !legacyBorders && cell.border?.[edge] === false ? 'none' : `1px solid ${cell.border?.color ?? '#111827'}`
        );
        const diagonals = [
          cell.diagonalTopLeftToBottomRight ? `linear-gradient(to bottom left, transparent calc(50% - 0.5px), ${cell.border?.color ?? '#111827'} 50%, transparent calc(50% + 0.5px))` : '',
          cell.diagonalTopRightToBottomLeft ? `linear-gradient(to bottom right, transparent calc(50% - 0.5px), ${cell.border?.color ?? '#111827'} 50%, transparent calc(50% + 0.5px))` : '',
        ].filter(Boolean).join(', ');
        const fieldElement = (node: CanvasNode) => (
          <Box key={node.id} component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', maxWidth: '100%' }}>
            {renderField(node)}
          </Box>
        );
        return (
          <Box key={cell.id} sx={{ gridColumn: `${cell.col} / span ${cell.colSpan}`, gridRow: `${cell.row} / span ${cell.rowSpan}`,
            display: 'flex', alignItems: cell.style?.verticalAlign === 'top' ? 'flex-start' : cell.style?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            minWidth: 0, minHeight: 0, overflow: 'hidden', boxSizing: 'border-box', mr: '-1px', mb: '-1px',
            borderTop: border('top'), borderRight: border('right'), borderBottom: border('bottom'), borderLeft: border('left'),
            bgcolor: String(cell.style?.backgroundColor ?? '#fff'), backgroundImage: diagonals || undefined }}>
            <div style={{ width: '100%', boxSizing: 'border-box', ...textStyle(cell.style) }}>
              {segments.map((segment, index) => segment.type === 'text'
                ? <span key={index}>{segment.text}</span>
                : fieldElement(fields.find((node) => node.id === segment.nodeId)!))}
              {fields.filter((node) => !inlineIds.has(node.id)).map(fieldElement)}
            </div>
          </Box>
        );
      })}
    </Box>
  );
}

export default function WordCanvasPreview({ page, renderField }: {
  page: CanvasPage;
  renderField: (node: CanvasNode) => ReactNode;
}) {
  const nodes = flattenNodes(page.nodes);
  const word = page.wordDocument;
  const hasStaticText = nodes.some((node) => node.type === 'static-text');
  const media = new Map(page.medias.map((item) => [item.id, item.src]));
  const paperWidth = Math.round((page.sheet.paperOrientation === 'landscape' ? 297 : 210) * MM_TO_PX);
  const paperHeight = Math.round((page.sheet.paperOrientation === 'landscape' ? 210 : 297) * MM_TO_PX);
  const left = Math.round(page.sheet.paperMarginLeftMm * MM_TO_PX);
  const right = Math.round(page.sheet.paperMarginRightMm * MM_TO_PX);
  const top = Math.round(page.sheet.paperMarginTopMm * MM_TO_PX) + (page.sheet.showHeader ? 46 : 0);
  const bottom = Math.round(page.sheet.paperMarginBottomMm * MM_TO_PX) + (page.sheet.showFooter ? 36 : 0);
  const contentWidth = paperWidth - left - right - 2;
  const contentHeight = Math.max(word?.contentHeight ?? 0,
    ...(word?.blocks.map((block) => block.layout.top + block.layout.height) ?? []),
    ...nodes.filter((node) => !node.style.wordTableCell).map((node) => Number(node.style.compTop ?? 0) + Number(node.style.compHeight ?? 32)));
  const height = Math.max(paperHeight, Math.ceil((top + contentHeight + bottom) / paperHeight) * paperHeight);

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#eef3f8', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
        <Box data-word-preview-page={page.id} sx={{ position: 'relative', width: paperWidth, height, flexShrink: 0,
          bgcolor: '#fff', border: '1px solid #dde3ea', boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)' }}>
          <Box sx={{ position: 'absolute', left, top, width: contentWidth }}>
            {word?.blocks.map((block) => {
              if (block.type === 'table') return <WordTablePreview key={block.id}
                table={constrainWordTableToCanvas(block, contentWidth)} nodes={nodes}
                legacyBorders={(block.borderEncodingVersion ?? word.borderEncodingVersion) !== 2} renderField={renderField} />;
              if (block.type === 'paragraph') return hasStaticText ? null : (
                <div key={block.id} style={{ position: 'absolute', ...block.layout, boxSizing: 'border-box', ...textStyle(block.style) }}>{block.text}</div>
              );
              const src = media.get(block.mediaId);
              return src ? <Box key={block.id} component="img" src={src} alt="" sx={{ position: 'absolute', ...block.layout, objectFit: 'contain' }} /> : null;
            })}
            {page.images.map((image) => {
              const src = media.get(image.mediaId);
              return src ? <Box key={image.id} component="img" src={src} alt="" sx={{ position: 'absolute', ...image.layout, objectFit: 'contain' }} /> : null;
            })}
            {nodes.filter((node) => node.style.position === 'absolute' && !node.style.wordTableCell && !node.bindings?.hidden).map((node) => (
              <Box key={node.id} sx={{ position: 'absolute', left: Number(node.style.compLeft ?? 0), top: Number(node.style.compTop ?? 0),
                width: Number(node.style.compWidth ?? 160), height: Number(node.style.compHeight ?? 32) }}>
                {node.type === 'static-text' ? (
                  <div style={{ height: '100%', boxSizing: 'border-box', ...textStyle(node.style) }}>{String(node.props.text ?? '')}</div>
                ) : node.type === 'static-image' ? (
                  <Box component="img" src={String(node.props.src ?? '')} alt={String(node.props.alt ?? '')} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : renderField(node)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
