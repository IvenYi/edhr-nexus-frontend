import type { CanvasCellBorder, CanvasPage, CanvasSelectionRange } from '../types';
import { normalizeRange } from './subTableRegion';

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function findMergedRangeContaining(page: CanvasPage, row: number, col: number) {
  return page.mergedCells
    .map((range) => normalizeRange(range))
    .find((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function getRenderedAdjacentCellBorder(
  page: CanvasPage,
  row: number,
  col: number,
  edge: 'top' | 'left',
): CanvasCellBorder | undefined {
  const mergedRange = findMergedRangeContaining(page, row, col);
  if (mergedRange) {
    if (edge === 'top' && mergedRange.t !== row) return undefined;
    if (edge === 'left' && mergedRange.l !== col) return undefined;
    return page.cells[getCellKey(mergedRange.t, mergedRange.l)]?.border;
  }
  return page.cells[getCellKey(row, col)]?.border;
}

function isAdjacentCellBorderCovered(page: CanvasPage, range: CanvasSelectionRange, edge: 'right' | 'bottom') {
  if (edge === 'right') {
    if (range.r >= page.sheet.columnCount) return false;
    const adjacentCol = range.r + 1;
    for (let row = range.t; row <= range.b; row += 1) {
      const neighborBorder = getRenderedAdjacentCellBorder(page, row, adjacentCol, 'left');
      if (!neighborBorder?.left) return false;
    }
    return true;
  }

  if (range.b >= page.sheet.rowCount) return false;
  const adjacentRow = range.b + 1;
  for (let col = range.l; col <= range.r; col += 1) {
    const neighborBorder = getRenderedAdjacentCellBorder(page, adjacentRow, col, 'top');
    if (!neighborBorder?.top) return false;
  }
  return true;
}

export function shouldRenderSheetCellBorderEdge(page: CanvasPage, range: CanvasSelectionRange, edge: 'top' | 'right' | 'bottom' | 'left') {
  const cellBorder = page.cells[getCellKey(range.t, range.l)]?.border;
  if (edge === 'right') return Boolean(cellBorder?.right && !isAdjacentCellBorderCovered(page, range, 'right'));
  if (edge === 'bottom') return Boolean(cellBorder?.bottom && !isAdjacentCellBorderCovered(page, range, 'bottom'));
  return Boolean(edge === 'top' ? cellBorder?.top : cellBorder?.left);
}
