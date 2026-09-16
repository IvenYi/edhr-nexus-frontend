import type { CanvasNode, CanvasPage, CanvasSelectionRange, CanvasSheetCell } from '../types';
import { normalizeRange, rangeContainsRange, readNodeCellRange } from './subTableRegion';
import { isCellDisplayNode } from '../registry/commonComponentRegistry';

/** Expand the display page only; template coordinates and entered values stay unchanged. */
export function buildDynamicSubTablePage(page: CanvasPage, recordCounts: Record<string, number>): CanvasPage {
  const flatten = (nodes: CanvasNode[]): CanvasNode[] => nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
  const templates = flatten(page.nodes).flatMap((node) => {
    const region = node.bindings?.subTableRegion;
    if (node.type !== 'sub-table' || region?.repeat.type !== 'dynamic') return [];
    const source = region.recordTemplate.groupRange
      ?? [...region.ranges].sort((a, b) => a.order - b.order)[0]?.range ?? readNodeCellRange(node);
    if (!source) return [];
    const range = normalizeRange(source);
    const count = Math.max(1, Math.floor(recordCounts[node.id] || 1));
    return [{ range, count, height: range.b - range.t + 1 }];
  });
  const insertions = new Map<number, { rows: number; heights: number[] }>();
  const rowHeight = (row: number) => page.sheet.rowHeights[row - 1] ?? page.sheet.defaultRowHeight ?? 32;
  templates.forEach(({ range, count, height }) => {
    const rows = (count - 1) * height;
    // Side-by-side tables share inserted sheet rows rather than adding their heights together.
    if (rows > (insertions.get(range.b)?.rows ?? 0)) {
      insertions.set(range.b, { rows, heights: Array.from({ length: rows }, (_, index) => rowHeight(range.t + index % height)) });
    }
  });
  if (!insertions.size) return page;
  const occupiedRanges = flatten(page.nodes)
    .filter((node) => node.type !== 'sub-table' && (node.bindings?.fieldId || node.bindings?.subTableFieldId || isCellDisplayNode(node)))
    .flatMap((node) => { const range = readNodeCellRange(node); return range ? [range] : []; });
  const mapRow = (row: number) => row + [...insertions].reduce((sum, [after, addition]) => sum + (after < row ? addition.rows : 0), 0);
  const mapRange = (range: CanvasSelectionRange) => ({ ...range, t: mapRow(range.t), b: mapRow(range.b) });
  const rowHeights: number[] = [];
  const pixelInsertions: Array<{ after: number; height: number }> = [];
  let originalTop = 0;
  for (let row = 1; row <= page.sheet.rowCount; row += 1) {
    const height = rowHeight(row);
    rowHeights.push(height);
    originalTop += height;
    const addition = insertions.get(row);
    if (addition) {
      rowHeights.push(...addition.heights);
      pixelInsertions.push({ after: originalTop, height: addition.heights.reduce((sum, value) => sum + value, 0) });
    }
  }
  const mapTop = (top: number) => top + pixelInsertions.reduce((sum, entry) => sum + (entry.after <= top ? entry.height : 0), 0);
  const cells: Record<string, CanvasSheetCell> = {};
  Object.entries(page.cells).forEach(([key, cell]) => {
    const [row, col] = key.split(':').map(Number);
    cells[`${mapRow(row)}:${col}`] = cell;
  });
  const mergedCells = page.mergedCells.map(mapRange);
  const borderAt = (row: number, col: number, edge: 'top' | 'bottom' | 'left' | 'right') => {
    const merge = page.mergedCells.find((range) => range.t <= row && row <= range.b && range.l <= col && col <= range.r);
    if (merge && ((edge === 'top' && row !== merge.t) || (edge === 'bottom' && row !== merge.b)
      || (edge === 'left' && col !== merge.l) || (edge === 'right' && col !== merge.r))) return undefined;
    const border = page.cells[`${merge?.t ?? row}:${merge?.l ?? col}`]?.border;
    return border?.[edge] ? border : undefined;
  };
  templates.forEach(({ range, count, height }) => {
    const merges = page.mergedCells.filter((merge) => rangeContainsRange(range, merge));
    for (let index = 0; index < count; index += 1) {
      const offset = mapRow(range.t) - range.t + index * height;
      for (let row = range.t; row <= range.b; row += 1) {
        for (let col = range.l; col <= range.r; col += 1) {
          const source = page.cells[`${row}:${col}`] ?? {};
          const merge = merges.find((item) => item.t === row && item.l === col);
          const bottom = merge?.b ?? row;
          const right = merge?.r ?? col;
          const columns = Array.from({ length: right - col + 1 }, (_, i) => col + i);
          const rows = Array.from({ length: bottom - row + 1 }, (_, i) => row + i);
          const neighbors = {
            top: columns.map((c) => borderAt(row - 1, c, 'bottom')),
            bottom: columns.map((c) => borderAt(bottom + 1, c, 'top')),
            left: rows.map((r) => borderAt(r, col - 1, 'right')),
            right: rows.map((r) => borderAt(r, right + 1, 'left')),
          };
          const border = { ...source.border };
          for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
            if (!border[edge] && neighbors[edge].every(Boolean)) {
              border[edge] = true;
              border.color ??= neighbors[edge][0]?.color;
            }
          }
          const coveredByControl = occupiedRanges.some((item) => row >= item.t && row <= item.b && col >= item.l && col <= item.r);
          cells[`${row + offset}:${col}`] = { ...source, ...(coveredByControl ? { value: undefined } : {}), ...(source.style ? { style: { ...source.style } } : {}), border };
        }
      }
      if (index) merges.forEach((merge) => mergedCells.push({ ...merge, t: merge.t + offset, b: merge.b + offset }));
    }
  });
  const mapNodes = (nodes: CanvasNode[]): CanvasNode[] => nodes.map((node) => {
    const range = readNodeCellRange(node);
    const region = node.bindings?.subTableRegion;
    return {
      ...node,
      style: { ...node.style, ...(range ? { cellRange: mapRange(range) } : {}),
        ...(typeof node.style.compTop === 'number' ? { compTop: mapTop(node.style.compTop) } : {}) },
      ...(region ? { bindings: { ...node.bindings, subTableRegion: {
        ...region,
        ranges: region.ranges.map((entry) => entry.pageId === page.id ? { ...entry, range: mapRange(entry.range) } : entry),
        recordTemplate: { ...region.recordTemplate,
          anchor: { ...region.recordTemplate.anchor, row: mapRow(region.recordTemplate.anchor.row) },
          ...(region.recordTemplate.groupRange ? { groupRange: mapRange(region.recordTemplate.groupRange) } : {}),
        },
      } } } : {}),
      children: mapNodes(node.children ?? []),
    };
  });
  return { ...page, cells, mergedCells, nodes: mapNodes(page.nodes),
    sheet: { ...page.sheet, rowCount: rowHeights.length, rowHeights },
    images: page.images.map((image) => ({ ...image, layout: { ...image.layout, top: mapTop(image.layout.top) } })),
  };
}
