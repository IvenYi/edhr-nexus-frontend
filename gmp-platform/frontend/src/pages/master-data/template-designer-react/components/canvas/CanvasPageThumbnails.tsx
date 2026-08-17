import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { Box, Button, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasCellBorder, CanvasPage, CanvasSelectionRange, CanvasSheetCell, CanvasWordTableBlock } from '../../types';

const MM_TO_PX = 96 / 25.4;
const A4_PAPER_WIDTH_MM = 210;
const A4_PAPER_HEIGHT_MM = 297;
const THUMBNAIL_VIRTUAL_OVERSCAN = 2;
const THUMBNAIL_CARD_GAP = 12;
const THUMBNAIL_CARD_PADDING_Y = 10;
const THUMBNAIL_LABEL_HEIGHT = 20;
const THUMBNAIL_LABEL_MARGIN_TOP = 9;
type CanvasCellBorderEdge = 'top' | 'right' | 'bottom' | 'left';

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function buildOffsets(sizes: number[]) {
  const offsets = [0];
  sizes.forEach((size) => {
    offsets.push(offsets[offsets.length - 1] + size);
  });
  return offsets;
}

function findFirstItemEndingAfter(offsets: number[], offset: number) {
  let low = 0;
  let high = Math.max(0, offsets.length - 2);
  let result = high;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if ((offsets[middle + 1] ?? 0) >= offset) {
      result = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return result;
}

function findLastItemStartingBefore(offsets: number[], offset: number) {
  let low = 0;
  let high = Math.max(0, offsets.length - 2);
  let result = 0;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if ((offsets[middle] ?? 0) <= offset) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return result;
}

function getThumbnailDimensions(page: CanvasPage) {
  const paperWidth = Math.round((page.sheet.paperOrientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM) * MM_TO_PX);
  const paperHeight = Math.round((page.sheet.paperOrientation === 'landscape' ? A4_PAPER_WIDTH_MM : A4_PAPER_HEIGHT_MM) * MM_TO_PX);
  const width = page.sheet.paperOrientation === 'landscape' ? 168 : 118;
  const height = Math.round(width * (paperHeight / paperWidth));
  return { width, height };
}

function fitColumnWidths(widths: number[], maxWidth: number) {
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= maxWidth) return widths;

  let remainingWidth = maxWidth;
  return widths.map((width, index) => {
    if (index === widths.length - 1) return Math.max(16, remainingWidth);
    const scaledWidth = Math.max(16, Math.round((width / totalWidth) * maxWidth));
    remainingWidth -= scaledWidth;
    return scaledWidth;
  });
}

function buildMergedCellMaps(ranges: CanvasSelectionRange[]) {
  const startMap = new Map<string, CanvasSelectionRange>();
  const skipSet = new Set<string>();

  ranges.forEach((range) => {
    startMap.set(getCellKey(range.t, range.l), range);
    for (let row = range.t; row <= range.b; row += 1) {
      for (let col = range.l; col <= range.r; col += 1) {
        if (row === range.t && col === range.l) continue;
        skipSet.add(getCellKey(row, col));
      }
    }
  });

  return { startMap, skipSet };
}

function findThumbnailMergedRangeContaining(page: CanvasPage, row: number, col: number) {
  return page.mergedCells.find((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function getRenderedThumbnailAdjacentCellBorder(page: CanvasPage, row: number, col: number, edge: 'top' | 'left'): CanvasCellBorder | undefined {
  const mergedRange = findThumbnailMergedRangeContaining(page, row, col);
  if (mergedRange) {
    if (edge === 'top' && mergedRange.t !== row) return undefined;
    if (edge === 'left' && mergedRange.l !== col) return undefined;
    return page.cells[getCellKey(mergedRange.t, mergedRange.l)]?.border;
  }
  return page.cells[getCellKey(row, col)]?.border;
}

function isThumbnailAdjacentCellBorderCovered(page: CanvasPage, range: CanvasSelectionRange, edge: 'right' | 'bottom') {
  if (edge === 'right') {
    if (range.r >= page.sheet.columnCount) return false;
    const adjacentCol = range.r + 1;
    for (let row = range.t; row <= range.b; row += 1) {
      const neighborBorder = getRenderedThumbnailAdjacentCellBorder(page, row, adjacentCol, 'left');
      if (!neighborBorder?.left) return false;
    }
    return true;
  }

  if (range.b >= page.sheet.rowCount) return false;
  const adjacentRow = range.b + 1;
  for (let col = range.l; col <= range.r; col += 1) {
    const neighborBorder = getRenderedThumbnailAdjacentCellBorder(page, adjacentRow, col, 'top');
    if (!neighborBorder?.top) return false;
  }
  return true;
}

function shouldRenderThumbnailCellBorderEdge(page: CanvasPage, range: CanvasSelectionRange, edge: CanvasCellBorderEdge) {
  const cellBorder = page.cells[getCellKey(range.t, range.l)]?.border;
  if (edge === 'right') return Boolean(cellBorder?.right && !isThumbnailAdjacentCellBorderCovered(page, range, 'right'));
  if (edge === 'bottom') return Boolean(cellBorder?.bottom && !isThumbnailAdjacentCellBorderCovered(page, range, 'bottom'));
  return Boolean(edge === 'top' ? cellBorder?.top : cellBorder?.left);
}

function resolveNumericStyle(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function hasVisibleCell(cell?: CanvasSheetCell) {
  return Boolean(
    String(cell?.value ?? '').trim()
    || cell?.style?.backgroundColor
    || cell?.border?.top
    || cell?.border?.right
    || cell?.border?.bottom
    || cell?.border?.left
  );
}

function buildTemplate(sizes: number[]) {
  return sizes.map((size) => `${Math.max(1, size)}px`).join(' ');
}

function getWordDocumentBottom(page: CanvasPage) {
  const documentBottom = page.wordDocument
    ? Math.max(
      page.wordDocument.contentHeight,
      ...page.wordDocument.blocks.map((block) => block.layout.top + block.layout.height),
    )
    : 0;
  const nodeBottom = page.nodes.reduce((bottom, node) => {
    if (node.style.position !== 'absolute') return bottom;
    return Math.max(bottom, Number(node.style.compTop ?? 0) + Number(node.style.compHeight ?? 0));
  }, 0);
  const imageBottom = page.images.reduce((bottom, image) => Math.max(bottom, image.layout.top + image.layout.height), 0);

  return Math.max(documentBottom, nodeBottom, imageBottom);
}

function resolvePreviewTextStyle(style?: Record<string, unknown>) {
  return {
    color: String(style?.color ?? '#1f2937'),
    fontSize: resolveNumericStyle(style?.fontSize, 12),
    fontWeight: style?.fontWeight as string | number | undefined,
    fontStyle: style?.fontStyle as string | undefined,
    fontFamily: style?.fontFamily as string | undefined,
    lineHeight: style?.lineHeight as string | number | undefined,
    textAlign: (style?.textAlign as 'left' | 'center' | 'right' | 'justify' | undefined) ?? 'left',
    textDecoration: style?.textDecoration as string | undefined,
    whiteSpace: style?.whiteSpace === 'nowrap' ? 'nowrap' : 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };
}

function resolveWordTableBorder(edge: keyof CanvasCellBorder, border?: CanvasCellBorder) {
  const color = String(border?.color ?? '#111827');
  return border?.[edge] === false ? 'none' : `1px solid ${color}`;
}

function fitWordTableColumnWidths(table: CanvasWordTableBlock) {
  return fitColumnWidths(table.columnWidths, table.layout.width);
}

function CanvasThumbnailWordTable({ table }: { table: CanvasWordTableBlock }) {
  const columnWidths = fitWordTableColumnWidths(table);
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const tableHeight = table.rowHeights.reduce((sum, height) => sum + height, 0);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: table.layout.left,
        top: table.layout.top,
        width: tableWidth,
        minHeight: tableHeight,
        display: 'grid',
        gridTemplateColumns: buildTemplate(columnWidths),
        gridTemplateRows: buildTemplate(table.rowHeights),
        bgcolor: '#fff',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {table.cells.map((cell) => (
        <Box
          key={cell.id}
          sx={{
            gridColumn: `${cell.col} / span ${cell.colSpan}`,
            gridRow: `${cell.row} / span ${cell.rowSpan}`,
            display: 'flex',
            alignItems: cell.style?.verticalAlign === 'top' ? 'flex-start' : cell.style?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            justifyContent: cell.style?.textAlign === 'right' ? 'flex-end' : cell.style?.textAlign === 'center' ? 'center' : 'flex-start',
            px: `${resolveNumericStyle(cell.style?.paddingLeft, 8)}px`,
            py: `${resolveNumericStyle(cell.style?.paddingTop, 4)}px`,
            pr: `${resolveNumericStyle(cell.style?.paddingRight, resolveNumericStyle(cell.style?.paddingLeft, 8))}px`,
            pb: `${resolveNumericStyle(cell.style?.paddingBottom, resolveNumericStyle(cell.style?.paddingTop, 4))}px`,
            borderTop: resolveWordTableBorder('top', cell.border),
            borderRight: resolveWordTableBorder('right', cell.border),
            borderBottom: resolveWordTableBorder('bottom', cell.border),
            borderLeft: resolveWordTableBorder('left', cell.border),
            bgcolor: String(cell.style?.backgroundColor ?? '#fff'),
            boxSizing: 'border-box',
            overflow: 'hidden',
            ...resolvePreviewTextStyle(cell.style),
          } as SxProps<Theme>}
        >
          {cell.text}
        </Box>
      ))}
    </Box>
  );
}

const CanvasThumbnailPreview = memo(function CanvasThumbnailPreview({ page, previewIndex }: { page: CanvasPage; previewIndex: number }) {
  const paperWidth = Math.round((page.sheet.paperOrientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM) * MM_TO_PX);
  const paperHeight = Math.round((page.sheet.paperOrientation === 'landscape' ? A4_PAPER_WIDTH_MM : A4_PAPER_HEIGHT_MM) * MM_TO_PX);
  const { width: thumbnailWidth, height: thumbnailHeight } = getThumbnailDimensions(page);
  const thumbnailScale = thumbnailWidth / paperWidth;
  const paperInsetLeft = Math.round(page.sheet.paperMarginLeftMm * MM_TO_PX);
  const paperInsetRight = Math.round(page.sheet.paperMarginRightMm * MM_TO_PX);
  const paperInsetTop = Math.round(page.sheet.paperMarginTopMm * MM_TO_PX);
  const paperInsetBottom = Math.round(page.sheet.paperMarginBottomMm * MM_TO_PX);
  const paperHeaderHeight = page.sheet.showHeader ? 46 : 0;
  const paperFooterHeight = page.sheet.showFooter ? 46 : 0;
  const paperContentWidth = paperWidth - paperInsetLeft - paperInsetRight;
  const isFreeCanvas = page.sheet.canvasMode === 'paper';
  const rowHeights = Array.from({ length: page.sheet.rowCount }, (_, index) => (
    page.sheet.rowHeights[index] ?? page.sheet.defaultRowHeight
  ));
  const displayColumnWidths = fitColumnWidths(
    Array.from({ length: page.sheet.columnCount }, (_, index) => (
      page.sheet.columnWidths[index] ?? page.sheet.defaultColumnWidth
    )),
    paperContentWidth,
  );
  const columnOffsets = useMemo(() => buildOffsets(displayColumnWidths), [displayColumnWidths]);
  const rowOffsets = useMemo(() => buildOffsets(rowHeights), [rowHeights]);
  const mergedCellMaps = useMemo(() => buildMergedCellMaps(page.mergedCells), [page.mergedCells]);
  const mediaSrcMap = useMemo(() => new Map(page.medias.map((media) => [media.id, media.src])), [page.medias]);
  const contentTop = paperInsetTop + paperHeaderHeight;
  const pageOffsetTop = previewIndex * paperHeight;
  const hasStaticTextNodes = page.nodes.some((node) => node.type === 'static-text' && node.style.position === 'absolute');
  const stageHeight = Math.max(
    (previewIndex + 1) * paperHeight,
    contentTop + rowOffsets[rowOffsets.length - 1] + paperFooterHeight + paperInsetBottom,
    contentTop + getWordDocumentBottom(page) + paperFooterHeight + paperInsetBottom,
  );

  return (
    <Box
      data-page-thumbnail-preview="true"
      sx={{
        position: 'relative',
        width: thumbnailWidth,
        height: thumbnailHeight,
        maxWidth: '100%',
        bgcolor: '#fff',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px #dce5f0 inset',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: -pageOffsetTop * thumbnailScale,
          width: paperWidth,
          height: stageHeight,
          transform: `scale(${thumbnailScale})`,
          transformOrigin: 'top left',
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: pageOffsetTop,
            left: 0,
            width: paperWidth,
            height: paperHeight,
            bgcolor: '#fff',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: contentTop,
            left: paperInsetLeft,
            width: paperContentWidth,
            height: rowOffsets[rowOffsets.length - 1],
            opacity: page.sheet.showGridLines ? 1 : 0,
            backgroundImage: `
              linear-gradient(to right, rgba(203, 213, 225, 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(203, 213, 225, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '24px 18px',
          }}
        />
        {Object.entries(page.cells).map(([cellKey, cell]) => {
          if (mergedCellMaps.skipSet.has(cellKey) || !hasVisibleCell(cell)) return null;

          const [rowText, colText] = cellKey.split(':');
          const row = Number(rowText);
          const col = Number(colText);
          const mergedRange = mergedCellMaps.startMap.get(cellKey);
          const range = mergedRange ?? { t: row, l: col, b: row, r: col };
          const top = contentTop + rowOffsets[range.t - 1];
          const left = paperInsetLeft + columnOffsets[range.l - 1];
          const width = columnOffsets[range.r] - columnOffsets[range.l - 1];
          const height = rowOffsets[range.b] - rowOffsets[range.t - 1];
          const borderColor = String(cell.border?.color ?? '#000000');

          return (
            <Box
              key={cellKey}
              data-page-thumbnail-cell="true"
              sx={{
                position: 'absolute',
                top,
                left,
                width,
                height,
                boxSizing: 'border-box',
                overflow: 'hidden',
                px: `${resolveNumericStyle(cell.style?.paddingLeft, 8)}px`,
                py: `${resolveNumericStyle(cell.style?.paddingTop, 4)}px`,
                bgcolor: cell.style?.backgroundColor ? String(cell.style.backgroundColor) : 'transparent',
                borderTop: shouldRenderThumbnailCellBorderEdge(page, range, 'top') ? `1px solid ${borderColor}` : 'none',
                borderRight: shouldRenderThumbnailCellBorderEdge(page, range, 'right') ? `1px solid ${borderColor}` : 'none',
                borderBottom: shouldRenderThumbnailCellBorderEdge(page, range, 'bottom') ? `1px solid ${borderColor}` : 'none',
                borderLeft: shouldRenderThumbnailCellBorderEdge(page, range, 'left') ? `1px solid ${borderColor}` : 'none',
                color: String(cell.style?.color ?? '#303133'),
                fontSize: resolveNumericStyle(cell.style?.fontSize, 12) || 12,
                fontWeight: cell.style?.fontWeight as string | undefined,
                whiteSpace: cell.style?.whiteSpace === 'normal' ? 'normal' : 'nowrap',
                lineHeight: cell.style?.lineHeight as string | number | undefined,
                wordBreak: 'break-word',
              }}
            >
              {cell.value ?? ''}
            </Box>
          );
        })}
        {page.images.map((image) => {
          const src = mediaSrcMap.get(image.mediaId);
          if (!src) return null;
          return (
            <Box
              key={image.id}
              component="img"
              src={src}
              alt=""
              sx={{
                position: 'absolute',
                left: paperInsetLeft + image.layout.left,
                top: contentTop + image.layout.top,
                width: image.layout.width,
                height: image.layout.height,
                objectFit: 'contain',
              }}
            />
          );
        })}
        {page.nodes
          .filter((node) => node.style.position === 'absolute')
          .map((node) => (
            <Box
              key={node.id}
              sx={{
                position: 'absolute',
                left: paperInsetLeft + Number(node.style.compLeft ?? 0),
                top: contentTop + Number(node.style.compTop ?? 0),
                width: Math.max(40, Number(node.style.compWidth ?? 160)),
                minHeight: Math.max(24, Number(node.style.compHeight ?? 32)),
                border: node.type === 'static-text' ? 'none' : '1px solid #cbd5e1',
                bgcolor: node.type === 'static-text' ? String(node.style.backgroundColor ?? node.props.backgroundColor ?? 'transparent') : '#f8fafc',
                color: '#475569',
                fontSize: 12,
                overflow: 'hidden',
                px: node.type === 'static-text' ? 0 : 1,
                py: node.type === 'static-text' ? 0 : undefined,
                ...(node.type === 'static-text' ? resolvePreviewTextStyle(node.style) : {}),
              } as SxProps<Theme>}
            >
              {node.type === 'static-image' ? (
                <Box
                  component="img"
                  src={String(node.props.src ?? '')}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : String(node.type === 'static-text' ? node.props.text ?? '' : node.props.label ?? node.type)}
            </Box>
          ))}
        {isFreeCanvas && page.wordDocument ? (
          <Box sx={{ position: 'absolute', left: paperInsetLeft, top: contentTop, width: paperContentWidth }}>
            {page.wordDocument.blocks.map((block) => {
              if (block.type === 'paragraph') {
                if (hasStaticTextNodes) return null;
                return (
                  <Box
                    key={block.id}
                    sx={{
                      position: 'absolute',
                      left: block.layout.left,
                      top: block.layout.top,
                      width: block.layout.width,
                      minHeight: block.layout.height,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      ...resolvePreviewTextStyle(block.style),
                    } as SxProps<Theme>}
                  >
                    {block.text}
                  </Box>
                );
              }

              if (block.type === 'table') {
                return <CanvasThumbnailWordTable key={block.id} table={block} />;
              }

              const src = mediaSrcMap.get(block.mediaId);
              if (!src) return null;
              return (
                <Box
                  key={block.id}
                  component="img"
                  src={src}
                  alt=""
                  sx={{
                    position: 'absolute',
                    left: block.layout.left,
                    top: block.layout.top,
                    width: block.layout.width,
                    height: block.layout.height,
                    objectFit: 'contain',
                  }}
                />
              );
            })}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
});

export default function CanvasPageThumbnails({ title = '分页缩略图', onClose }: { title?: string; onClose: () => void }) {
  const thumbnailScrollerRef = useRef<HTMLDivElement | null>(null);
  const thumbnailScrollFrameRef = useRef<number | null>(null);
  const [thumbnailViewport, setThumbnailViewport] = useState({ scrollTop: 0, height: 0 });
  const pages = useTemplateDesignerStore((state) => state.document?.canvas.pages ?? []);
  const currentPageId = useTemplateDesignerStore((state) => state.document?.canvas.currentPageId ?? '');
  const pagePreviewCounts = useTemplateDesignerStore((state) => state.pagePreviewCounts);
  const activePagePreviewIndexes = useTemplateDesignerStore((state) => state.activePagePreviewIndexes);
  const requestPagePreviewScroll = useTemplateDesignerStore((state) => state.requestPagePreviewScroll);
  const activePreviewKey = `${currentPageId}-${activePagePreviewIndexes[currentPageId] ?? 0}`;
  const thumbnailItems = useMemo(() => pages.flatMap((page) => {
    const previewCount = Math.max(1, pagePreviewCounts[page.id] ?? 1);
    const thumbnailHeight = getThumbnailDimensions(page).height;
    const itemHeight = thumbnailHeight + THUMBNAIL_CARD_PADDING_Y * 2 + THUMBNAIL_LABEL_MARGIN_TOP + THUMBNAIL_LABEL_HEIGHT + THUMBNAIL_CARD_GAP;
    return Array.from({ length: previewCount }, (_, previewIndex) => ({
      key: `${page.id}-${previewIndex + 1}`,
      page,
      previewIndex,
      itemHeight,
      buttonHeight: itemHeight - THUMBNAIL_CARD_GAP,
    }));
  }), [pagePreviewCounts, pages]);
  const thumbnailOffsets = useMemo(() => buildOffsets(thumbnailItems.map((item) => item.itemHeight)), [thumbnailItems]);
  const activeThumbnailIndex = useMemo(() => (
    thumbnailItems.findIndex((item) => item.page.id === currentPageId && item.previewIndex === (activePagePreviewIndexes[item.page.id] ?? 0))
  ), [activePagePreviewIndexes, currentPageId, thumbnailItems]);
  const visibleThumbnailRange = useMemo(() => {
    if (!thumbnailItems.length || thumbnailViewport.height <= 0) {
      return { start: 0, end: Math.min(thumbnailItems.length - 1, THUMBNAIL_VIRTUAL_OVERSCAN * 2) };
    }

    const visibleStart = findFirstItemEndingAfter(thumbnailOffsets, thumbnailViewport.scrollTop);
    const visibleEnd = findLastItemStartingBefore(thumbnailOffsets, thumbnailViewport.scrollTop + thumbnailViewport.height);
    return {
      start: Math.max(0, visibleStart - THUMBNAIL_VIRTUAL_OVERSCAN),
      end: Math.min(thumbnailItems.length - 1, visibleEnd + THUMBNAIL_VIRTUAL_OVERSCAN),
    };
  }, [thumbnailItems.length, thumbnailOffsets, thumbnailViewport.height, thumbnailViewport.scrollTop]);
  const visibleThumbnailItems = useMemo(() => (
    thumbnailItems
      .slice(visibleThumbnailRange.start, visibleThumbnailRange.end + 1)
      .map((item, offsetIndex) => ({
        ...item,
        index: visibleThumbnailRange.start + offsetIndex,
        top: thumbnailOffsets[visibleThumbnailRange.start + offsetIndex] ?? 0,
      }))
  ), [thumbnailItems, thumbnailOffsets, visibleThumbnailRange.end, visibleThumbnailRange.start]);
  const thumbnailContentHeight = thumbnailOffsets[thumbnailOffsets.length - 1] ?? 0;

  const syncThumbnailViewport = () => {
    const element = thumbnailScrollerRef.current;
    const scrollTop = element?.scrollTop ?? 0;
    const height = element?.clientHeight ?? 0;
    setThumbnailViewport((current) => (
      current.scrollTop === scrollTop && current.height === height
        ? current
        : { scrollTop, height }
    ));
  };
  const handleThumbnailScroll = () => {
    if (thumbnailScrollFrameRef.current !== null) return;
    thumbnailScrollFrameRef.current = window.requestAnimationFrame(() => {
      thumbnailScrollFrameRef.current = null;
      syncThumbnailViewport();
    });
  };

  useEffect(() => {
    const element = thumbnailScrollerRef.current;
    if (!element || activeThumbnailIndex < 0) return;

    const top = thumbnailOffsets[activeThumbnailIndex] ?? 0;
    const bottom = thumbnailOffsets[activeThumbnailIndex + 1] ?? top;
    if (top < element.scrollTop || bottom > element.scrollTop + element.clientHeight) {
      element.scrollTo({ top: Math.max(0, top - THUMBNAIL_CARD_GAP), behavior: 'auto' });
    }
  }, [activePreviewKey, activeThumbnailIndex, thumbnailOffsets]);

  useEffect(() => {
    syncThumbnailViewport();
    return () => {
      if (thumbnailScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(thumbnailScrollFrameRef.current);
      }
    };
  }, [thumbnailItems.length]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          height: 36,
          borderBottom: '1px solid #e8edf4',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#303133' }}>{title}</Typography>
        <Button
          aria-label="关闭侧边栏"
          onClick={onClose}
          sx={{ minWidth: 28, width: 28, height: 28, p: 0, color: '#808792' }}
        >
          <CloseOutlined fontSize="small" />
        </Button>
      </Box>
      <Box
        ref={thumbnailScrollerRef}
        onScroll={handleThumbnailScroll}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}
      >
        <Box sx={{ position: 'relative', height: thumbnailContentHeight || 'auto', minHeight: thumbnailItems.length ? undefined : 40 }}>
          {visibleThumbnailItems.map((item) => {
            const { page, previewIndex } = item;
            const isActive = item.index === activeThumbnailIndex;
            return (
              <Button
                key={item.key}
                data-page-thumbnail-active={isActive ? 'true' : 'false'}
                onClick={() => requestPagePreviewScroll(page.id, previewIndex)}
                sx={{
                  position: 'absolute',
                  top: item.top,
                  left: 4,
                  right: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'calc(100% - 8px)',
                  height: item.buttonHeight,
                  maxWidth: 'none',
                  mx: 'auto',
                  px: 1.25,
                  py: 1.25,
                  borderRadius: '4px',
                  border: isActive ? '1px solid #2990ff' : '1px solid transparent',
                  bgcolor: isActive ? '#eaf5ff' : '#f8fafc',
                  color: '#6b7280',
                  transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                  boxShadow: isActive ? '0 0 0 2px rgba(41, 144, 255, 0.14)' : 'none',
                  '&:hover': {
                    bgcolor: isActive ? '#eaf5ff' : '#f0f4f8',
                  },
                  contentVisibility: 'auto',
                  containIntrinsicSize: `${item.buttonHeight}px`,
                }}
              >
                <CanvasThumbnailPreview page={page} previewIndex={previewIndex} />
                <Typography sx={{ mt: 1.1, fontSize: 14, color: isActive ? '#2563eb' : '#667085', fontWeight: isActive ? 600 : 400 }}>
                  第 {previewIndex + 1} 页
                </Typography>
              </Button>
            );
          })}
          {!pages.length ? (
            <Typography sx={{ fontSize: 13, color: '#98a2b3' }}>第 1 页</Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
