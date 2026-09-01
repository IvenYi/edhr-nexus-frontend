import type { CanvasWordBlockLayout, CanvasWordTableBlock } from '../types';

export interface WordTableAlignmentTarget {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const WORD_TABLE_ALIGNMENT_TOLERANCE = 8;

function getRenderedWordTableColumnWidths(table: CanvasWordTableBlock): number[] {
  if (table.cells.length === 0) return table.columnWidths;

  const usedColumnCount = Math.min(
    table.columnWidths.length,
    Math.max(1, ...table.cells.map((cell) => cell.col + cell.colSpan - 1)),
  );
  return table.columnWidths.slice(0, usedColumnCount);
}

export function fitWordTableColumnWidthsToCanvas(columnWidths: number[], canvasWidth: number): number[] {
  const maximumWidth = Math.max(1, Math.round(canvasWidth));
  const totalWidth = columnWidths.reduce((sum, width) => sum + Math.max(0, width), 0);
  if (totalWidth <= maximumWidth) return columnWidths;

  let remainingWidth = maximumWidth;
  return columnWidths.map((width, index) => {
    if (index === columnWidths.length - 1) return remainingWidth;
    const nextWidth = Math.min(remainingWidth, Math.max(0, Math.floor((Math.max(0, width) / totalWidth) * maximumWidth)));
    remainingWidth -= nextWidth;
    return nextWidth;
  });
}

export function constrainWordTableLayout(layout: CanvasWordBlockLayout, canvasWidth: number): CanvasWordBlockLayout {
  const width = Math.min(Math.max(1, Math.round(layout.width)), Math.max(1, Math.round(canvasWidth)));
  const maximumLeft = Math.max(0, Math.round(canvasWidth) - width);

  return {
    ...layout,
    left: Math.max(0, Math.min(Math.round(layout.left), maximumLeft)),
    top: Math.max(0, Math.round(layout.top)),
    width,
  };
}

export function getWordTableEffectiveLayout(table: CanvasWordTableBlock, canvasWidth: number): CanvasWordBlockLayout {
  const width = getRenderedWordTableColumnWidths(table).reduce((sum, columnWidth) => sum + Math.max(0, columnWidth), 0);
  return constrainWordTableLayout({ ...table.layout, width }, canvasWidth);
}

export function constrainWordTableToCanvas(table: CanvasWordTableBlock, canvasWidth: number): CanvasWordTableBlock {
  const layout = getWordTableEffectiveLayout(table, canvasWidth);
  const columnWidths = fitWordTableColumnWidthsToCanvas(getRenderedWordTableColumnWidths(table), layout.width);

  return {
    ...table,
    layout: { ...layout, width: columnWidths.reduce((sum, width) => sum + width, 0) },
    columnWidths,
  };
}

export function snapWordTableLayout(
  layout: CanvasWordBlockLayout,
  canvasWidth: number,
  alignmentTargets: WordTableAlignmentTarget[],
): CanvasWordBlockLayout {
  const constrained = constrainWordTableLayout(layout, canvasWidth);
  const candidates = alignmentTargets.flatMap((target) => [
    target.left,
    target.left + target.width - constrained.width,
  ]);
  const nearest = candidates.reduce<number | null>((closest, candidate) => {
    if (Math.abs(candidate - constrained.left) > WORD_TABLE_ALIGNMENT_TOLERANCE) return closest;
    return closest === null || Math.abs(candidate - constrained.left) < Math.abs(closest - constrained.left)
      ? candidate
      : closest;
  }, null);

  return nearest === null
    ? constrained
    : constrainWordTableLayout({ ...constrained, left: nearest }, canvasWidth);
}
