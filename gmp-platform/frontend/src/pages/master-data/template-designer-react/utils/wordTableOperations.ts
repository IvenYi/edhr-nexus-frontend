import type { CanvasCellBorder, CanvasWordTableBlock, CanvasWordTableCell } from '../types';

export interface WordTableRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

const DEFAULT_BORDER: CanvasCellBorder = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  color: '#111827',
};

function makeCellId(tableId: string, row: number, col: number) {
  return `${tableId}-cell-${row}-${col}-${Math.random().toString(36).slice(2, 8)}`;
}

function isCellCovering(cell: CanvasWordTableCell, row: number, col: number) {
  return row >= cell.row
    && row < cell.row + cell.rowSpan
    && col >= cell.col
    && col < cell.col + cell.colSpan;
}

function findCellAt(table: CanvasWordTableBlock, row: number, col: number) {
  return table.cells.find((cell) => isCellCovering(cell, row, col));
}

function doesCellIntersectRange(cell: CanvasWordTableCell, range: WordTableRange) {
  return cell.row <= range.bottom
    && cell.row + cell.rowSpan - 1 >= range.top
    && cell.col <= range.right
    && cell.col + cell.colSpan - 1 >= range.left;
}

function getLayout(table: CanvasWordTableBlock, columnWidths: number[], rowHeights: number[]) {
  return {
    ...table.layout,
    width: columnWidths.reduce((sum, width) => sum + width, 0),
    height: rowHeights.reduce((sum, height) => sum + height, 0),
  };
}

function createEmptyCell(table: CanvasWordTableBlock, row: number, col: number, template?: CanvasWordTableCell): CanvasWordTableCell {
  return {
    id: makeCellId(table.id, row, col),
    row,
    col,
    rowSpan: 1,
    colSpan: 1,
    text: '',
    style: template?.style ? { ...template.style } : undefined,
    border: template?.border ? { ...template.border } : { ...DEFAULT_BORDER },
  };
}

function fillTableGaps(table: CanvasWordTableBlock, cells: CanvasWordTableCell[]) {
  const completed = [...cells];
  for (let row = 1; row <= table.rowHeights.length; row += 1) {
    for (let col = 1; col <= table.columnWidths.length; col += 1) {
      if (completed.some((cell) => isCellCovering(cell, row, col))) continue;
      const template = findCellAt(table, Math.min(row, table.rowHeights.length), Math.min(col, table.columnWidths.length));
      completed.push(createEmptyCell(table, row, col, template));
    }
  }
  return completed.sort((first, second) => first.row - second.row || first.col - second.col);
}

function makeTable(table: CanvasWordTableBlock, columnWidths: number[], rowHeights: number[], cells: CanvasWordTableCell[]): CanvasWordTableBlock {
  const draft = {
    ...table,
    columnWidths,
    rowHeights,
    layout: getLayout(table, columnWidths, rowHeights),
  };
  return { ...draft, cells: fillTableGaps(draft, cells) };
}

function averageSize(sizes: number[], index: number, fallback: number) {
  return Math.max(1, Math.round(sizes[index - 1] ?? sizes[index] ?? fallback));
}

export function isMergeableWordTableRange(table: CanvasWordTableBlock, range: WordTableRange) {
  if (range.top === range.bottom && range.left === range.right) return false;
  return table.cells.every((cell) => {
    const cellBottom = cell.row + cell.rowSpan - 1;
    const cellRight = cell.col + cell.colSpan - 1;
    const intersects = cell.row <= range.bottom
      && cellBottom >= range.top
      && cell.col <= range.right
      && cellRight >= range.left;
    if (!intersects) return true;
    return cell.row >= range.top
      && cellBottom <= range.bottom
      && cell.col >= range.left
      && cellRight <= range.right;
  });
}

export function updateWordTableCellStyle(
  table: CanvasWordTableBlock,
  range: WordTableRange,
  patch: Record<string, unknown>,
) {
  return {
    ...table,
    cells: table.cells.map((cell) => (
      doesCellIntersectRange(cell, range)
        ? { ...cell, style: { ...cell.style, ...patch } }
        : cell
    )),
  };
}

export function insertWordTableColumns(table: CanvasWordTableBlock, insertAt: number, count: number) {
  const safeCount = Math.max(1, Math.floor(count));
  const safeInsertAt = Math.min(Math.max(1, Math.floor(insertAt)), table.columnWidths.length + 1);
  const width = averageSize(table.columnWidths, safeInsertAt, 96);
  const columnWidths = [
    ...table.columnWidths.slice(0, safeInsertAt - 1),
    ...Array.from({ length: safeCount }, () => width),
    ...table.columnWidths.slice(safeInsertAt - 1),
  ];
  const cells = table.cells.map((cell) => {
    const right = cell.col + cell.colSpan - 1;
    if (cell.col >= safeInsertAt) return { ...cell, col: cell.col + safeCount };
    if (right >= safeInsertAt) return { ...cell, colSpan: cell.colSpan + safeCount };
    return cell;
  });
  return makeTable(table, columnWidths, table.rowHeights, cells);
}

export function insertWordTableRows(table: CanvasWordTableBlock, insertAt: number, count: number) {
  const safeCount = Math.max(1, Math.floor(count));
  const safeInsertAt = Math.min(Math.max(1, Math.floor(insertAt)), table.rowHeights.length + 1);
  const height = averageSize(table.rowHeights, safeInsertAt, 32);
  const rowHeights = [
    ...table.rowHeights.slice(0, safeInsertAt - 1),
    ...Array.from({ length: safeCount }, () => height),
    ...table.rowHeights.slice(safeInsertAt - 1),
  ];
  const cells = table.cells.map((cell) => {
    const bottom = cell.row + cell.rowSpan - 1;
    if (cell.row >= safeInsertAt) return { ...cell, row: cell.row + safeCount };
    if (bottom >= safeInsertAt) return { ...cell, rowSpan: cell.rowSpan + safeCount };
    return cell;
  });
  return makeTable(table, table.columnWidths, rowHeights, cells);
}

export function mergeWordTableCells(table: CanvasWordTableBlock, range: WordTableRange) {
  if (!isMergeableWordTableRange(table, range)) return table;
  const anchor = findCellAt(table, range.top, range.left);
  if (!anchor) return table;
  const cells = table.cells
    .filter((cell) => (
      cell.row < range.top
      || cell.row > range.bottom
      || cell.col < range.left
      || cell.col > range.right
    ))
    .concat({
      ...anchor,
      row: range.top,
      col: range.left,
      rowSpan: range.bottom - range.top + 1,
      colSpan: range.right - range.left + 1,
    });
  return makeTable(table, table.columnWidths, table.rowHeights, cells);
}

export function splitWordTableCell(table: CanvasWordTableBlock, row: number, col: number) {
  const target = findCellAt(table, row, col);
  if (!target || (target.rowSpan === 1 && target.colSpan === 1)) return table;
  const cells = table.cells.filter((cell) => cell.id !== target.id);
  for (let currentRow = target.row; currentRow < target.row + target.rowSpan; currentRow += 1) {
    for (let currentCol = target.col; currentCol < target.col + target.colSpan; currentCol += 1) {
      cells.push({
        ...createEmptyCell(table, currentRow, currentCol, target),
        id: currentRow === target.row && currentCol === target.col ? target.id : makeCellId(table.id, currentRow, currentCol),
        text: currentRow === target.row && currentCol === target.col ? target.text : '',
      });
    }
  }
  return makeTable(table, table.columnWidths, table.rowHeights, cells);
}

function deleteTracks(
  table: CanvasWordTableBlock,
  axis: 'row' | 'column',
  start: number,
  count: number,
) {
  const sizes = axis === 'row' ? table.rowHeights : table.columnWidths;
  const safeCount = Math.min(Math.max(1, Math.floor(count)), sizes.length - 1);
  const safeStart = Math.min(Math.max(1, Math.floor(start)), sizes.length - safeCount + 1);
  const end = safeStart + safeCount - 1;
  const cells = table.cells.flatMap((cell) => {
    const cellStart = axis === 'row' ? cell.row : cell.col;
    const span = axis === 'row' ? cell.rowSpan : cell.colSpan;
    const cellEnd = cellStart + span - 1;
    const overlap = Math.max(0, Math.min(cellEnd, end) - Math.max(cellStart, safeStart) + 1);
    if (overlap === 0) {
      if (cellStart > end) return [axis === 'row' ? { ...cell, row: cell.row - safeCount } : { ...cell, col: cell.col - safeCount }];
      return [cell];
    }
    if (cellStart > end || cellEnd < safeStart) return [cell];
    if (cellEnd <= end && cellStart >= safeStart) return [];
    const nextSpan = span - overlap;
    if (nextSpan <= 0) return [];
    if (axis === 'row') {
      return [{ ...cell, row: cellStart >= safeStart ? safeStart : cell.row, rowSpan: nextSpan }];
    }
    return [{ ...cell, col: cellStart >= safeStart ? safeStart : cell.col, colSpan: nextSpan }];
  });
  const nextSizes = [...sizes.slice(0, safeStart - 1), ...sizes.slice(end)];
  return axis === 'row'
    ? makeTable(table, table.columnWidths, nextSizes, cells)
    : makeTable(table, nextSizes, table.rowHeights, cells);
}

export function deleteWordTableRows(table: CanvasWordTableBlock, start: number, count: number) {
  if (table.rowHeights.length <= 1) return table;
  return deleteTracks(table, 'row', start, count);
}

export function deleteWordTableColumns(table: CanvasWordTableBlock, start: number, count: number) {
  if (table.columnWidths.length <= 1) return table;
  return deleteTracks(table, 'column', start, count);
}
