import type { CanvasNode, CanvasPage, CanvasSelectionRange, CanvasSheetCell } from '../types';

export interface SheetCellSnapshot {
  rows: number;
  columns: number;
  cells: Record<string, CanvasSheetCell>;
  mergedCells: CanvasSelectionRange[];
}

const intersects = (a: CanvasSelectionRange, b: CanvasSelectionRange) => a.t <= b.b && a.b >= b.t && a.l <= b.r && a.r >= b.l;
const contains = (a: CanvasSelectionRange, b: CanvasSelectionRange) => a.t <= b.t && a.b >= b.b && a.l <= b.l && a.r >= b.r;
const equal = (a: CanvasSelectionRange, b: CanvasSelectionRange) => a.t === b.t && a.b === b.b && a.l === b.l && a.r === b.r;

export function captureSheetCells(page: CanvasPage, range: CanvasSelectionRange): SheetCellSnapshot {
  if (page.mergedCells.some((merge) => intersects(merge, range) && !contains(range, merge))) {
    throw new Error('请完整选中合并单元格后再复制或拖拽。');
  }
  const cells: Record<string, CanvasSheetCell> = {};
  for (let row = range.t; row <= range.b; row += 1) {
    for (let col = range.l; col <= range.r; col += 1) {
      const cell = page.cells[`${row}:${col}`];
      if (cell) cells[`${row - range.t + 1}:${col - range.l + 1}`] = structuredClone(cell);
    }
  }
  return {
    rows: range.b - range.t + 1,
    columns: range.r - range.l + 1,
    cells,
    mergedCells: page.mergedCells.filter((merge) => contains(range, merge)).map((merge) => ({
      t: merge.t - range.t + 1, b: merge.b - range.t + 1,
      l: merge.l - range.l + 1, r: merge.r - range.l + 1,
    })),
  };
}

export function getSheetFillRange(source: CanvasSelectionRange, bottom: number, rowCount: number): CanvasSelectionRange | null {
  const height = source.b - source.t + 1;
  const repeats = Math.min(Math.ceil((bottom - source.b) / height), Math.floor((rowCount - source.b) / height));
  return repeats > 0 ? { ...source, t: source.b + 1, b: source.b + repeats * height } : null;
}

export function applySheetCells(page: CanvasPage, snapshot: SheetCellSnapshot, target: CanvasSelectionRange, formatOnly = false): CanvasPage {
  if (target.t < 1 || target.l < 1 || target.b > page.sheet.rowCount || target.r > page.sheet.columnCount) {
    throw new Error('目标区域超出表格边界，无法完整粘贴。');
  }
  if (page.mergedCells.some((merge) => intersects(merge, target) && !contains(target, merge))) {
    throw new Error('目标区域跨越已有合并单元格，请完整选中或先拆分后再操作。');
  }
  const merges: CanvasSelectionRange[] = [];
  for (let row = target.t; row <= target.b; row += snapshot.rows) {
    for (const merge of snapshot.mergedCells) {
      merges.push({ t: row + merge.t - 1, b: row + merge.b - 1, l: target.l + merge.l - 1, r: target.l + merge.r - 1 });
    }
  }
  const oldMerges = page.mergedCells.filter((merge) => intersects(merge, target));
  const changedMerges = [...oldMerges.filter((merge) => !merges.some((next) => equal(merge, next))),
    ...merges.filter((merge) => !oldMerges.some((old) => equal(merge, old)))];
  const touchesField = (nodes: CanvasNode[]): boolean => nodes.some((node) => {
    const range = node.style.cellRange as CanvasSelectionRange | undefined;
    return Boolean((range && changedMerges.some((merge) => intersects(merge, range))) || (node.children && touchesField(node.children)));
  });
  if (touchesField(page.nodes)) {
    throw new Error('合并结构变更涉及已有字段，请先调整字段位置后再操作。');
  }
  const cells = { ...page.cells };
  for (let row = target.t; row <= target.b; row += 1) {
    for (let col = target.l; col <= target.r; col += 1) {
      const key = `${row}:${col}`;
      const source = snapshot.cells[`${(row - target.t) % snapshot.rows + 1}:${col - target.l + 1}`] ?? {};
      const cell = structuredClone(source);
      if (formatOnly) {
        delete cell.value;
        if (cells[key]?.value !== undefined) cell.value = cells[key].value;
      }
      if (Object.keys(cell).length) cells[key] = cell;
      else delete cells[key];
    }
  }
  if (formatOnly) {
    for (const merge of merges) {
      const values: string[] = [];
      for (let row = merge.t; row <= merge.b; row += 1) {
        for (let col = merge.l; col <= merge.r; col += 1) {
          const cell = cells[`${row}:${col}`];
          if (cell?.value) values.push(cell.value);
          if (cell) delete cell.value;
        }
      }
      if (values.length) cells[`${merge.t}:${merge.l}`] = { ...cells[`${merge.t}:${merge.l}`], value: values.join('\n') };
    }
  }
  return { ...page, cells, mergedCells: [...page.mergedCells.filter((merge) => !intersects(merge, target)), ...merges] };
}
