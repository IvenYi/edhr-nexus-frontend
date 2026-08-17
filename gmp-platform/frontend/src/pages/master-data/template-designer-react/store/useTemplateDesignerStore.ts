import { create } from 'zustand';
import type {
  CanvasCellBorder,
  CanvasMode,
  CanvasNode,
  CanvasPage,
  CanvasSelectionRange,
  CanvasSelectedCell,
  CanvasSheetCell,
  FieldType,
  ModelField,
  ModelFieldStatus,
  SubTableRegion,
  TemplateDesignerCanvasRailKey,
  TemplateDesignerDocument,
  TemplateDesignerTabKey,
} from '../types';
import { createCommonDisplayNode, type CommonDisplayComponentId } from '../registry/commonComponentRegistry';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';
import { createDefaultSubTableRegion, inferFixedRepeatCount, rebuildSubTableRecordTemplate } from '../utils/subTableRegion';

type MoveDirection = 'up' | 'down';

interface FieldCellLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  range?: CanvasSelectionRange;
}

interface CreateFieldInput {
  name: string;
  type: FieldType;
  description?: string;
}

const DOCUMENT_HISTORY_LIMIT = 50;

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFieldCodeBase(input: string, fallback: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function createUniqueFieldCode(fields: ModelField[], name: string, type: FieldType) {
  const base = normalizeFieldCodeBase(name, type);
  const usedCodes = new Set(fields.map((field) => field.code));
  if (!usedCodes.has(base)) return base;

  let index = 2;
  while (usedCodes.has(`${base}_${index}`)) {
    index += 1;
  }
  return `${base}_${index}`;
}

function createUniqueFieldName(fields: ModelField[], preferredName: string) {
  const baseName = preferredName.trim();
  const usedNames = new Set(fields.map((field) => field.name.trim()).filter(Boolean));
  if (!usedNames.has(baseName)) return baseName;

  let index = 1;
  while (usedNames.has(`${baseName}_${index}`)) {
    index += 1;
  }
  return `${baseName}_${index}`;
}

function normalizeModelFieldColumns(columns: unknown): ModelField[] {
  if (typeof columns === 'string') {
    return columns
      .split(/[\n,，]/)
      .map<ModelField | null>((column, index) => {
        const name = column.trim();
        if (!name) return null;
        const definition = getFieldTypeDefinition('text');
        return {
          ...definition.defaultField(name, index + 1),
          id: createId('sub-field'),
          code: createUniqueFieldCode([], name, definition.type),
        };
      })
      .filter((field): field is ModelField => Boolean(field));
  }

  if (!Array.isArray(columns)) return [];

  return columns
    .map<ModelField | null>((column, index) => {
      if (!column || typeof column !== 'object') return null;
      const source = column as Partial<ModelField> & Record<string, unknown>;
      const type = typeof source.type === 'string' && source.type !== 'subTable' ? source.type as FieldType : 'text';
      const definition = getFieldTypeDefinition(type);
      const fallbackField = definition.defaultField(
        typeof source.name === 'string' && source.name.trim() ? source.name.trim() : definition.label,
        index + 1,
      );
      return {
        ...fallbackField,
        ...source,
        type: definition.type,
        id: typeof source.id === 'string' && source.id ? source.id : createId('sub-field'),
        code: typeof source.code === 'string' && source.code ? source.code : createUniqueFieldCode([], fallbackField.name, definition.type),
        name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : fallbackField.name,
        sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : index + 1,
        status: source.status === 'disabled' ? 'disabled' as const : 'enabled' as const,
        description: typeof source.description === 'string' ? source.description : '',
        typeConfig: typeof source.typeConfig === 'object' && source.typeConfig
          ? { ...fallbackField.typeConfig, ...source.typeConfig }
          : { ...fallbackField.typeConfig },
      };
    })
    .filter((field): field is ModelField => Boolean(field));
}

function createModelFieldFromInput(input: CreateFieldInput, sortOrder: number, fields: ModelField[], idPrefix = 'field') {
  const effectiveType = input.type === 'subTable' ? 'text' : input.type;
  const definition = getFieldTypeDefinition(effectiveType);
  const preferredName = input.name.trim() || definition.label;
  const name = createUniqueFieldName(fields, preferredName);
  return {
    ...definition.defaultField(name, sortOrder),
    id: createId(idPrefix),
    code: createUniqueFieldCode(fields, name, definition.type),
    description: input.description?.trim() ?? '',
  };
}

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function createSingleCellRange(row = 1, col = 1): CanvasSelectionRange {
  return { t: row, l: col, b: row, r: col };
}

function normalizeRange(range: CanvasSelectionRange): CanvasSelectionRange {
  return {
    t: Math.min(range.t, range.b),
    l: Math.min(range.l, range.r),
    b: Math.max(range.t, range.b),
    r: Math.max(range.l, range.r),
  };
}

function isMultiCellRange(range: CanvasSelectionRange) {
  return range.t !== range.b || range.l !== range.r;
}

function rangesIntersect(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  return first.l <= second.r
    && first.r >= second.l
    && first.t <= second.b
    && first.b >= second.t;
}

function rangesEqual(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  const normalizedFirst = normalizeRange(first);
  const normalizedSecond = normalizeRange(second);
  return normalizedFirst.t === normalizedSecond.t
    && normalizedFirst.l === normalizedSecond.l
    && normalizedFirst.b === normalizedSecond.b
    && normalizedFirst.r === normalizedSecond.r;
}

function rangeContainsRange(outer: CanvasSelectionRange, inner: CanvasSelectionRange) {
  const normalizedOuter = normalizeRange(outer);
  const normalizedInner = normalizeRange(inner);
  return normalizedOuter.t <= normalizedInner.t
    && normalizedOuter.l <= normalizedInner.l
    && normalizedOuter.b >= normalizedInner.b
    && normalizedOuter.r >= normalizedInner.r;
}

function removeMergedRangesInSelection(
  ranges: CanvasSelectionRange[],
  selection: CanvasSelectionRange,
) {
  const normalizedSelection = normalizeRange(selection);
  return ranges.filter((range) => !rangesIntersect(range, normalizedSelection));
}

function mergePageCellValuesInRange(page: CanvasPage, selection: CanvasSelectionRange) {
  const normalizedSelection = normalizeRange(selection);
  const nextCells = { ...page.cells };
  const topLeftKey = getCellKey(normalizedSelection.t, normalizedSelection.l);
  const mergedValues: string[] = [];

  for (let row = normalizedSelection.t; row <= normalizedSelection.b; row += 1) {
    for (let col = normalizedSelection.l; col <= normalizedSelection.r; col += 1) {
      const cellKey = getCellKey(row, col);
      const value = nextCells[cellKey]?.value;
      if (typeof value === 'string' && value.trim()) {
        mergedValues.push(value.trim());
      }
    }
  }

  for (let row = normalizedSelection.t; row <= normalizedSelection.b; row += 1) {
    for (let col = normalizedSelection.l; col <= normalizedSelection.r; col += 1) {
      if (row === normalizedSelection.t && col === normalizedSelection.l) continue;

      const cellKey = getCellKey(row, col);
      const cell = nextCells[cellKey];
      if (!cell) continue;

      const nextCell: CanvasSheetCell = {
        ...(cell.style ? { style: cell.style } : {}),
        ...(cell.border ? { border: cell.border } : {}),
      };

      if (nextCell.style || nextCell.border) {
        nextCells[cellKey] = nextCell;
      } else {
        delete nextCells[cellKey];
      }
    }
  }

  if (mergedValues.length) {
    nextCells[topLeftKey] = {
      ...(nextCells[topLeftKey] ?? {}),
      value: mergedValues.join('\n'),
    };
  }

  return {
    ...page,
    cells: nextCells,
  };
}

function shiftCellsForInsertedColumns(
  cells: Record<string, CanvasSheetCell>,
  insertAt: number,
  count: number,
) {
  const nextCells: Record<string, CanvasSheetCell> = {};

  Object.entries(cells).forEach(([key, value]) => {
    const [rowText, colText] = key.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    const nextCol = col >= insertAt ? col + count : col;
    nextCells[getCellKey(row, nextCol)] = value;
  });

  return nextCells;
}

function shiftCellsForInsertedRows(
  cells: Record<string, CanvasSheetCell>,
  insertAt: number,
  count: number,
) {
  const nextCells: Record<string, CanvasSheetCell> = {};

  Object.entries(cells).forEach(([key, value]) => {
    const [rowText, colText] = key.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    const nextRow = row >= insertAt ? row + count : row;
    nextCells[getCellKey(nextRow, col)] = value;
  });

  return nextCells;
}

function shiftCellsForDeletedColumns(
  cells: Record<string, CanvasSheetCell>,
  deleteStart: number,
  count: number,
) {
  const deleteEnd = deleteStart + count - 1;
  const nextCells: Record<string, CanvasSheetCell> = {};

  Object.entries(cells).forEach(([key, value]) => {
    const [rowText, colText] = key.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    if (col >= deleteStart && col <= deleteEnd) return;
    const nextCol = col > deleteEnd ? col - count : col;
    nextCells[getCellKey(row, nextCol)] = value;
  });

  return nextCells;
}

function shiftCellsForDeletedRows(
  cells: Record<string, CanvasSheetCell>,
  deleteStart: number,
  count: number,
) {
  const deleteEnd = deleteStart + count - 1;
  const nextCells: Record<string, CanvasSheetCell> = {};

  Object.entries(cells).forEach(([key, value]) => {
    const [rowText, colText] = key.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    if (row >= deleteStart && row <= deleteEnd) return;
    const nextRow = row > deleteEnd ? row - count : row;
    nextCells[getCellKey(nextRow, col)] = value;
  });

  return nextCells;
}

function shiftMergedRangesForInsertedColumns(
  ranges: CanvasSelectionRange[],
  insertAt: number,
  count: number,
) {
  return ranges.map((range) => {
    if (range.r < insertAt) {
      return range;
    }
    if (range.l >= insertAt) {
      return {
        ...range,
        l: range.l + count,
        r: range.r + count,
      };
    }
    return {
      ...range,
      r: range.r + count,
    };
  });
}

function shiftMergedRangesForInsertedRows(
  ranges: CanvasSelectionRange[],
  insertAt: number,
  count: number,
) {
  return ranges.map((range) => {
    if (range.b < insertAt) {
      return range;
    }
    if (range.t >= insertAt) {
      return {
        ...range,
        t: range.t + count,
        b: range.b + count,
      };
    }
    return {
      ...range,
      b: range.b + count,
    };
  });
}

function shiftRangeForInsertedRows(range: CanvasSelectionRange, insertAt: number, count: number): CanvasSelectionRange {
  const normalizedRange = normalizeRange(range);
  if (normalizedRange.b < insertAt) {
    return normalizedRange;
  }
  if (normalizedRange.t >= insertAt) {
    return {
      ...normalizedRange,
      t: normalizedRange.t + count,
      b: normalizedRange.b + count,
    };
  }
  return {
    ...normalizedRange,
    b: normalizedRange.b + count,
  };
}

function shiftSubTableRegionForInsertedRows(region: SubTableRegion, insertAt: number, count: number): SubTableRegion {
  return {
    ...region,
    ranges: region.ranges.map((fragment) => ({
      ...fragment,
      range: shiftRangeForInsertedRows(fragment.range, insertAt, count),
    })),
    recordTemplate: {
      ...region.recordTemplate,
      anchor: {
        ...region.recordTemplate.anchor,
        row: region.recordTemplate.anchor.row >= insertAt
          ? region.recordTemplate.anchor.row + count
          : region.recordTemplate.anchor.row,
      },
      groupRange: region.recordTemplate.groupRange
        ? shiftRangeForInsertedRows(region.recordTemplate.groupRange, insertAt, count)
        : region.recordTemplate.groupRange,
    },
  };
}

function shiftRangeForDeletedRows(
  range: CanvasSelectionRange,
  deleteStart: number,
  count: number,
): CanvasSelectionRange | null {
  const normalizedRange = normalizeRange(range);
  const deleteEnd = deleteStart + count - 1;

  if (normalizedRange.b < deleteStart) {
    return normalizedRange;
  }
  if (normalizedRange.t > deleteEnd) {
    return {
      ...normalizedRange,
      t: normalizedRange.t - count,
      b: normalizedRange.b - count,
    };
  }

  const removedRows = Math.min(normalizedRange.b, deleteEnd) - Math.max(normalizedRange.t, deleteStart) + 1;
  const nextRowCount = normalizedRange.b - normalizedRange.t + 1 - removedRows;
  if (nextRowCount <= 0) {
    return null;
  }

  const nextTop = normalizedRange.t >= deleteStart ? deleteStart : normalizedRange.t;
  return {
    ...normalizedRange,
    t: nextTop,
    b: nextTop + nextRowCount - 1,
  };
}

function shiftSubTableRegionForDeletedRows(
  region: SubTableRegion,
  deleteStart: number,
  count: number,
): SubTableRegion | null {
  const nextRanges = region.ranges.flatMap((fragment) => {
    const range = shiftRangeForDeletedRows(fragment.range, deleteStart, count);
    return range ? [{ ...fragment, range }] : [];
  });
  if (!nextRanges.length) return null;

  const deleteEnd = deleteStart + count - 1;
  const nextAnchorRow = region.recordTemplate.anchor.row > deleteEnd
    ? region.recordTemplate.anchor.row - count
    : region.recordTemplate.anchor.row >= deleteStart
      ? deleteStart
      : region.recordTemplate.anchor.row;
  const nextGroupRange = region.recordTemplate.groupRange
    ? shiftRangeForDeletedRows(region.recordTemplate.groupRange, deleteStart, count)
    : null;

  return {
    ...region,
    ranges: nextRanges,
    recordTemplate: {
      ...region.recordTemplate,
      anchor: {
        ...region.recordTemplate.anchor,
        row: nextAnchorRow,
      },
      groupRange: nextGroupRange ?? undefined,
    },
  };
}

function shiftRangeForDeletedColumns(
  range: CanvasSelectionRange,
  deleteStart: number,
  count: number,
): CanvasSelectionRange | null {
  const normalizedRange = normalizeRange(range);
  const deleteEnd = deleteStart + count - 1;

  if (normalizedRange.r < deleteStart) {
    return normalizedRange;
  }
  if (normalizedRange.l > deleteEnd) {
    return {
      ...normalizedRange,
      l: normalizedRange.l - count,
      r: normalizedRange.r - count,
    };
  }

  const removedColumns = Math.min(normalizedRange.r, deleteEnd) - Math.max(normalizedRange.l, deleteStart) + 1;
  const nextColumnCount = normalizedRange.r - normalizedRange.l + 1 - removedColumns;
  if (nextColumnCount <= 0) {
    return null;
  }

  const nextLeft = normalizedRange.l >= deleteStart ? deleteStart : normalizedRange.l;
  return {
    ...normalizedRange,
    l: nextLeft,
    r: nextLeft + nextColumnCount - 1,
  };
}

function shiftSubTableRegionForDeletedColumns(
  region: SubTableRegion,
  deleteStart: number,
  count: number,
): SubTableRegion | null {
  const nextRanges = region.ranges.flatMap((fragment) => {
    const range = shiftRangeForDeletedColumns(fragment.range, deleteStart, count);
    return range ? [{ ...fragment, range }] : [];
  });
  if (!nextRanges.length) return null;

  const deleteEnd = deleteStart + count - 1;
  const nextAnchorCol = region.recordTemplate.anchor.col > deleteEnd
    ? region.recordTemplate.anchor.col - count
    : region.recordTemplate.anchor.col >= deleteStart
      ? deleteStart
      : region.recordTemplate.anchor.col;
  const nextGroupRange = region.recordTemplate.groupRange
    ? shiftRangeForDeletedColumns(region.recordTemplate.groupRange, deleteStart, count)
    : null;

  return {
    ...region,
    ranges: nextRanges,
    recordTemplate: {
      ...region.recordTemplate,
      anchor: {
        ...region.recordTemplate.anchor,
        col: nextAnchorCol,
      },
      groupRange: nextGroupRange ?? undefined,
    },
  };
}

function getSubTableRegionPrimaryRange(region: SubTableRegion): CanvasSelectionRange | null {
  const primary = [...region.ranges].sort((first, second) => first.order - second.order)[0];
  return primary ? normalizeRange(primary.range) : null;
}

function getRangeSpan(range: CanvasSelectionRange, direction: SubTableRegion['recordTemplate']['direction']) {
  const normalizedRange = normalizeRange(range);
  return direction === 'row'
    ? normalizedRange.b - normalizedRange.t + 1
    : normalizedRange.r - normalizedRange.l + 1;
}

function resolveFixedRepeatFromTemplateRange(
  region: SubTableRegion,
  templateRange: CanvasSelectionRange,
  direction: SubTableRegion['recordTemplate']['direction'],
) {
  const normalizedTemplate = normalizeRange(templateRange);
  const regionRange = getSubTableRegionPrimaryRange(region) ?? normalizedTemplate;
  const stride = Math.max(1, getRangeSpan(normalizedTemplate, direction));
  const fillRange = direction === 'row'
    ? normalizeRange({
        ...normalizedTemplate,
        b: Math.max(normalizedTemplate.b, regionRange.b),
      })
    : normalizeRange({
        ...normalizedTemplate,
        r: Math.max(normalizedTemplate.r, regionRange.r),
      });

  return {
    type: 'fixed' as const,
    count: inferFixedRepeatCount(fillRange, direction, stride),
    stride,
  };
}

function readNumericStyle(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function expandSelectedSubTableForHeaderRow(
  node: CanvasNode,
  headerRow: number,
  rowOffset: number,
): CanvasNode {
  const cellRange = readNodeCellRange(node);
  const region = node.bindings?.subTableRegion;
  if (!cellRange || !region) return node;

  const primaryOrder = region.ranges.reduce((current, fragment) => Math.min(current, fragment.order), Infinity);
  const expandedRange = normalizeRange({
    ...cellRange,
    t: headerRow,
  });

  return {
    ...node,
    style: {
      ...node.style,
      cellRange: expandedRange,
      compTop: Math.max(0, readNumericStyle(node.style.compTop, 0) - rowOffset),
      compHeight: readNumericStyle(node.style.compHeight, 0) + rowOffset,
    },
    bindings: {
      ...node.bindings,
      subTableRegion: {
        ...region,
        ranges: region.ranges.map((fragment) => (
          fragment.order === primaryOrder
            ? {
                ...fragment,
                range: {
                  ...normalizeRange(fragment.range),
                  t: headerRow,
                },
              }
            : fragment
        )),
        presentation: {
          ...region.presentation,
          showHeader: true,
        },
      },
    },
  };
}

function shiftCanvasNodesForInsertedRows(
  nodes: CanvasNode[],
  insertAt: number,
  count: number,
  rowOffset: number,
): CanvasNode[] {
  return nodes.map((node) => {
    const cellRange = readNodeCellRange(node);
    const shiftedRange = cellRange ? shiftRangeForInsertedRows(cellRange, insertAt, count) : null;
    const shouldShiftAbsoluteTop = Boolean(cellRange && cellRange.t >= insertAt);
    const shouldExpandAbsoluteHeight = Boolean(cellRange && cellRange.t < insertAt && cellRange.b >= insertAt);
    const subTableRegion = node.bindings?.subTableRegion
      ? shiftSubTableRegionForInsertedRows(node.bindings.subTableRegion, insertAt, count)
      : undefined;
    const nextNode: CanvasNode = {
      ...node,
      style: {
        ...node.style,
        ...(shiftedRange ? { cellRange: shiftedRange } : {}),
        ...(shouldShiftAbsoluteTop ? { compTop: Number(node.style.compTop ?? 0) + rowOffset } : {}),
        ...(shouldExpandAbsoluteHeight ? { compHeight: Number(node.style.compHeight ?? 0) + rowOffset } : {}),
      },
      bindings: subTableRegion
        ? {
            ...node.bindings,
            subTableRegion,
          }
        : node.bindings,
    };

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: shiftCanvasNodesForInsertedRows(nextNode.children, insertAt, count, rowOffset),
    };
  });
}

function shiftCanvasNodesForDeletedRows(
  nodes: CanvasNode[],
  deleteStart: number,
  count: number,
  rowOffset: number,
): CanvasNode[] {
  const deleteEnd = deleteStart + count - 1;

  return nodes.flatMap((node) => {
    const cellRange = readNodeCellRange(node);
    const shiftedRange = cellRange ? shiftRangeForDeletedRows(cellRange, deleteStart, count) : null;
    if (cellRange && !shiftedRange) {
      return [];
    }

    const shouldShiftAbsoluteTop = Boolean(cellRange && cellRange.t > deleteEnd);
    const shouldShrinkAbsoluteHeight = Boolean(cellRange && rangesIntersect(cellRange, {
      t: deleteStart,
      l: cellRange.l,
      b: deleteEnd,
      r: cellRange.r,
    }));
    const subTableRegion = node.bindings?.subTableRegion
      ? shiftSubTableRegionForDeletedRows(node.bindings.subTableRegion, deleteStart, count)
      : undefined;
    if (node.bindings?.subTableRegion && !subTableRegion) {
      return [];
    }

    const nextNode: CanvasNode = {
      ...node,
      style: {
        ...node.style,
        ...(shiftedRange ? { cellRange: shiftedRange } : {}),
        ...(shouldShiftAbsoluteTop ? { compTop: Math.max(0, readNumericStyle(node.style.compTop, 0) - rowOffset) } : {}),
        ...(shouldShrinkAbsoluteHeight ? { compHeight: Math.max(0, readNumericStyle(node.style.compHeight, 0) - rowOffset) } : {}),
      },
      bindings: subTableRegion
        ? {
            ...node.bindings,
            subTableRegion,
          }
        : node.bindings,
    };

    if (!nextNode.children?.length) return [nextNode];
    return [{
      ...nextNode,
      children: shiftCanvasNodesForDeletedRows(nextNode.children, deleteStart, count, rowOffset),
    }];
  });
}

function shiftCanvasNodesForDeletedColumns(
  nodes: CanvasNode[],
  deleteStart: number,
  count: number,
  columnOffset: number,
): CanvasNode[] {
  const deleteEnd = deleteStart + count - 1;

  return nodes.flatMap((node) => {
    const cellRange = readNodeCellRange(node);
    const shiftedRange = cellRange ? shiftRangeForDeletedColumns(cellRange, deleteStart, count) : null;
    if (cellRange && !shiftedRange) {
      return [];
    }

    const shouldShiftAbsoluteLeft = Boolean(cellRange && cellRange.l > deleteEnd);
    const shouldShrinkAbsoluteWidth = Boolean(cellRange && rangesIntersect(cellRange, {
      t: cellRange.t,
      l: deleteStart,
      b: cellRange.b,
      r: deleteEnd,
    }));
    const subTableRegion = node.bindings?.subTableRegion
      ? shiftSubTableRegionForDeletedColumns(node.bindings.subTableRegion, deleteStart, count)
      : undefined;
    if (node.bindings?.subTableRegion && !subTableRegion) {
      return [];
    }

    const nextNode: CanvasNode = {
      ...node,
      style: {
        ...node.style,
        ...(shiftedRange ? { cellRange: shiftedRange } : {}),
        ...(shouldShiftAbsoluteLeft ? { compLeft: Math.max(0, readNumericStyle(node.style.compLeft, 0) - columnOffset) } : {}),
        ...(shouldShrinkAbsoluteWidth ? { compWidth: Math.max(0, readNumericStyle(node.style.compWidth, 0) - columnOffset) } : {}),
      },
      bindings: subTableRegion
        ? {
            ...node.bindings,
            subTableRegion,
          }
        : node.bindings,
    };

    if (!nextNode.children?.length) return [nextNode];
    return [{
      ...nextNode,
      children: shiftCanvasNodesForDeletedColumns(nextNode.children, deleteStart, count, columnOffset),
    }];
  });
}

function shiftMergedRangesForDeletedColumns(
  ranges: CanvasSelectionRange[],
  deleteStart: number,
  count: number,
) {
  const deleteEnd = deleteStart + count - 1;

  return ranges.flatMap((range) => {
    if (range.r < deleteStart) {
      return [range];
    }
    if (range.l > deleteEnd) {
      return [{
        ...range,
        l: range.l - count,
        r: range.r - count,
      }];
    }

    const removedColumns = Math.min(range.r, deleteEnd) - Math.max(range.l, deleteStart) + 1;
    const nextColumnCount = range.r - range.l + 1 - removedColumns;
    if (nextColumnCount <= 0) {
      return [];
    }

    const nextLeft = range.l >= deleteStart ? deleteStart : range.l;
    return [{
      ...range,
      l: nextLeft,
      r: nextLeft + nextColumnCount - 1,
    }];
  });
}

function shiftMergedRangesForDeletedRows(
  ranges: CanvasSelectionRange[],
  deleteStart: number,
  count: number,
) {
  const deleteEnd = deleteStart + count - 1;

  return ranges.flatMap((range) => {
    if (range.b < deleteStart) {
      return [range];
    }
    if (range.t > deleteEnd) {
      return [{
        ...range,
        t: range.t - count,
        b: range.b - count,
      }];
    }

    const removedRows = Math.min(range.b, deleteEnd) - Math.max(range.t, deleteStart) + 1;
    const nextRowCount = range.b - range.t + 1 - removedRows;
    if (nextRowCount <= 0) {
      return [];
    }

    const nextTop = range.t >= deleteStart ? deleteStart : range.t;
    return [{
      ...range,
      t: nextTop,
      b: nextTop + nextRowCount - 1,
    }];
  });
}

function getDeleteRange(start: number, end: number, total: number) {
  if (total <= 1) return null;

  const deleteStart = Math.max(1, Math.min(start, end));
  const requestedEnd = Math.min(total, Math.max(start, end));
  if (deleteStart > requestedEnd) return null;

  const count = Math.min(requestedEnd - deleteStart + 1, total - 1);
  return {
    start: deleteStart,
    end: deleteStart + count - 1,
    count,
  };
}

function deleteSizes(sizes: number[], deleteStart: number, deleteEnd: number, nextCount: number, fallback: number) {
  const remainingSizes = sizes.filter((_, index) => {
    const position = index + 1;
    return position < deleteStart || position > deleteEnd;
  });

  return Array.from({ length: nextCount }, (_, index) => remainingSizes[index] ?? fallback);
}

function sumSizes(sizes: number[], start: number, end: number, fallback: number) {
  let total = 0;
  for (let position = start; position <= end; position += 1) {
    total += sizes[position - 1] ?? fallback;
  }
  return total;
}

function updateCanvasPage(
  document: TemplateDesignerDocument,
  updater: (page: CanvasPage) => CanvasPage,
) {
  return {
    ...document,
    canvas: {
      ...document.canvas,
      pages: document.canvas.pages.map((page) => (
        page.id === document.canvas.currentPageId ? updater(page) : page
      )),
    },
  };
}

function updatePageCellValue(
  page: CanvasPage,
  row: number,
  col: number,
  value: string,
) {
  const cellKey = getCellKey(row, col);

  return {
    ...page,
    cells: {
      ...page.cells,
      [cellKey]: {
        ...(page.cells[cellKey] ?? {}),
        value,
      },
    },
  };
}

function clearPageCellsInRange(page: CanvasPage, range: CanvasSelectionRange) {
  const normalizedRange = normalizeRange(range);
  const nextCells = { ...page.cells };

  for (let row = normalizedRange.t; row <= normalizedRange.b; row += 1) {
    for (let col = normalizedRange.l; col <= normalizedRange.r; col += 1) {
      const cellKey = getCellKey(row, col);
      const cell = nextCells[cellKey];
      if (!cell) continue;

      const nextCell: CanvasSheetCell = {
        ...(cell.style ? { style: cell.style } : {}),
        ...(cell.border ? { border: cell.border } : {}),
      };

      if (nextCell.style || nextCell.border) {
        nextCells[cellKey] = nextCell;
      } else {
        delete nextCells[cellKey];
      }
    }
  }

  return {
    ...page,
    cells: nextCells,
  };
}

function serializeClipboardCellValue(value: unknown) {
  const text = String(value ?? '');
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function serializePageCellsInRange(page: CanvasPage, range: CanvasSelectionRange) {
  const normalizedRange = normalizeRange(range);
  const rows: string[] = [];

  for (let row = normalizedRange.t; row <= normalizedRange.b; row += 1) {
    const values: string[] = [];
    for (let col = normalizedRange.l; col <= normalizedRange.r; col += 1) {
      values.push(serializeClipboardCellValue(page.cells[getCellKey(row, col)]?.value));
    }
    rows.push(values.join('\t'));
  }

  return rows.join('\n');
}

function parseClipboardTextToCells(text: string) {
  const rows: string[][] = [[]];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"' && value === '') {
      inQuotes = true;
    } else if (char === '\t') {
      rows[rows.length - 1].push(value);
      value = '';
    } else if (char === '\r' || char === '\n') {
      rows[rows.length - 1].push(value);
      value = '';
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }
      rows.push([]);
    } else {
      value += char;
    }
  }

  rows[rows.length - 1].push(value);
  if (rows.length > 1 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '' && /(\r\n|\r|\n)$/.test(text)) {
    rows.pop();
  }

  return rows;
}

function setPageCellValue(nextCells: Record<string, CanvasSheetCell>, row: number, col: number, value: string) {
  const cellKey = getCellKey(row, col);
  const cell = nextCells[cellKey] ?? {};

  if (value.length > 0) {
    nextCells[cellKey] = {
      ...cell,
      value,
    };
    return;
  }

  const nextCell: CanvasSheetCell = {
    ...(cell.style ? { style: cell.style } : {}),
    ...(cell.border ? { border: cell.border } : {}),
  };

  if (nextCell.style || nextCell.border) {
    nextCells[cellKey] = nextCell;
  } else {
    delete nextCells[cellKey];
  }
}

function pastePageCellsFromText(page: CanvasPage, startRow: number, startCol: number, text: string) {
  const rows = parseClipboardTextToCells(text);
  const nextCells = { ...page.cells };
  let pastedBottom = startRow - 1;
  let pastedRight = startCol - 1;

  rows.forEach((values, rowOffset) => {
    const row = startRow + rowOffset;
    if (row > page.sheet.rowCount) return;

    values.forEach((value, colOffset) => {
      const col = startCol + colOffset;
      if (col > page.sheet.columnCount) return;
      setPageCellValue(nextCells, row, col, value);
      pastedBottom = Math.max(pastedBottom, row);
      pastedRight = Math.max(pastedRight, col);
    });
  });

  if (pastedBottom < startRow || pastedRight < startCol) {
    return { page, range: null };
  }

  const range: CanvasSelectionRange = {
    t: startRow,
    l: startCol,
    b: pastedBottom,
    r: pastedRight,
  };

  return {
    page: {
      ...page,
      cells: nextCells,
    },
    range,
  };
}

function getPastedCellsRange(page: CanvasPage, startRow: number, startCol: number, text: string): CanvasSelectionRange | null {
  const rows = parseClipboardTextToCells(text);
  let pastedBottom = startRow - 1;
  let pastedRight = startCol - 1;

  rows.forEach((values, rowOffset) => {
    const row = startRow + rowOffset;
    if (row > page.sheet.rowCount) return;

    values.forEach((_, colOffset) => {
      const col = startCol + colOffset;
      if (col > page.sheet.columnCount) return;
      pastedBottom = Math.max(pastedBottom, row);
      pastedRight = Math.max(pastedRight, col);
    });
  });

  if (pastedBottom < startRow || pastedRight < startCol) {
    return null;
  }

  return {
    t: startRow,
    l: startCol,
    b: pastedBottom,
    r: pastedRight,
  };
}

function updatePageCellStyleInRange(
  page: CanvasPage,
  range: CanvasSelectionRange,
  patch: Record<string, unknown>,
) {
  const normalizedRange = normalizeRange(range);
  const nextCells = { ...page.cells };

  for (let row = normalizedRange.t; row <= normalizedRange.b; row += 1) {
    for (let col = normalizedRange.l; col <= normalizedRange.r; col += 1) {
      const cellKey = getCellKey(row, col);
      const cell = nextCells[cellKey] ?? {};
      nextCells[cellKey] = {
        ...cell,
        style: {
          ...(cell.style ?? {}),
          ...patch,
        },
      };
    }
  }

  return {
    ...page,
    cells: nextCells,
  };
}

function updatePageCellBorderInRange(
  page: CanvasPage,
  range: CanvasSelectionRange,
  border: CanvasCellBorder | null,
) {
  const normalizedRange = normalizeRange(range);
  const nextCells = { ...page.cells };

  for (let row = normalizedRange.t; row <= normalizedRange.b; row += 1) {
    for (let col = normalizedRange.l; col <= normalizedRange.r; col += 1) {
      const cellKey = getCellKey(row, col);
      const cell = nextCells[cellKey] ?? {};

      if (border) {
        nextCells[cellKey] = {
          ...cell,
          border,
        };
        continue;
      }

      const nextCell: CanvasSheetCell = {
        ...(cell.value ? { value: cell.value } : {}),
        ...(cell.style ? { style: cell.style } : {}),
      };

      if (nextCell.value || nextCell.style) {
        nextCells[cellKey] = nextCell;
      } else {
        delete nextCells[cellKey];
      }
    }
  }

  return {
    ...page,
    cells: nextCells,
  };
}

function mapNodes(nodes: CanvasNode[], nodeId: string, updater: (node: CanvasNode) => CanvasNode): CanvasNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) return updater(node);
    if (!node.children?.length) return node;
    return {
      ...node,
      children: mapNodes(node.children, nodeId, updater),
    };
  });
}

function findNode(nodes: CanvasNode[], nodeId: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children?.length) {
      const nested = findNode(node.children, nodeId);
      if (nested) return nested;
    }
  }
  return null;
}

function insertNodeIntoTree(nodes: CanvasNode[], parentId: string | null, node: CanvasNode): CanvasNode[] {
  if (!parentId) {
    return [...nodes, node];
  }
  return nodes.map((current) => {
    if (current.id === parentId) {
      return {
        ...current,
        children: [...(current.children ?? []), { ...node, parentId }],
      };
    }
    if (!current.children?.length) return current;
    return {
      ...current,
      children: insertNodeIntoTree(current.children, parentId, node),
    };
  });
}

function removeNodeFromTree(nodes: CanvasNode[], nodeId: string): CanvasNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (!node.children?.length) return node;
      return {
        ...node,
        children: removeNodeFromTree(node.children, nodeId),
      };
    });
}

function collectDeletedSubTableFieldIds(
  nodes: CanvasNode[],
  shouldDeleteNode: (node: CanvasNode) => boolean,
  target = new Set<string>(),
) {
  nodes.forEach((node) => {
    if (shouldDeleteNode(node) && node.type === 'sub-table' && node.bindings?.fieldId) {
      target.add(node.bindings.fieldId);
    }
    if (node.children?.length) {
      collectDeletedSubTableFieldIds(node.children, shouldDeleteNode, target);
    }
  });
  return target;
}

function removeSubTableChildFieldNodesFromTree(nodes: CanvasNode[], subTableFieldIds: Set<string>): CanvasNode[] {
  if (!subTableFieldIds.size) return nodes;

  return nodes
    .filter((node) => !(node.bindings?.subTableId && subTableFieldIds.has(node.bindings.subTableId)))
    .map((node) => {
      if (!node.children?.length) return node;
      return {
        ...node,
        children: removeSubTableChildFieldNodesFromTree(node.children, subTableFieldIds),
      };
    });
}

function removeNodeAndSubTableFieldsFromTree(nodes: CanvasNode[], nodeId: string): CanvasNode[] {
  const deletedSubTableFieldIds = collectDeletedSubTableFieldIds(nodes, (node) => node.id === nodeId);
  return removeSubTableChildFieldNodesFromTree(removeNodeFromTree(nodes, nodeId), deletedSubTableFieldIds);
}

function readNodeCellRange(node: CanvasNode): CanvasSelectionRange | null {
  const value = node.style.cellRange;
  if (!value || typeof value !== 'object') return null;

  const range = value as Partial<CanvasSelectionRange>;
  const { t, l, b, r } = range;
  if (typeof t !== 'number' || typeof l !== 'number' || typeof b !== 'number' || typeof r !== 'number') {
    return null;
  }
  return normalizeRange({ t, l, b, r });
}

function isMergeableCellFieldNode(node: CanvasNode) {
  return Boolean(node.bindings?.fieldId) && node.type !== 'sub-table';
}

function isCuttableCellFieldNode(node: CanvasNode) {
  return Boolean(node.bindings?.fieldId && node.type !== 'sub-table' && readNodeCellRange(node));
}

function cloneCanvasNode(node: CanvasNode): CanvasNode {
  return typeof structuredClone === 'function'
    ? structuredClone(node)
    : JSON.parse(JSON.stringify(node)) as CanvasNode;
}

function cloneFieldNodeForCellPaste(node: CanvasNode, layout: FieldCellLayout): CanvasNode {
  const clonedNode = cloneCanvasNode(node);
  const range = normalizeRange(layout.range ?? createSingleCellRange());
  return {
    ...clonedNode,
    id: createId('node'),
    parentId: null,
    style: {
      ...clonedNode.style,
      position: 'absolute',
      compLeft: layout.left,
      compTop: layout.top,
      compWidth: Math.max(layout.width, MIN_CELL_FIELD_WIDTH),
      compHeight: Math.max(layout.height, MIN_CELL_FIELD_HEIGHT),
      cellRange: range,
    },
  };
}

function removeCellFieldNodesFromTree(nodes: CanvasNode[], targetRange: CanvasSelectionRange): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);
  const deletedSubTableFieldIds = collectDeletedSubTableFieldIds(nodes, (node) => {
    if (!node.bindings?.fieldId) return false;
    const cellRange = readNodeCellRange(node);
    return Boolean(cellRange && rangesIntersect(cellRange, normalizedTarget));
  });

  const nextNodes = nodes
    .filter((node) => {
      if (!node.bindings?.fieldId) return true;
      const cellRange = readNodeCellRange(node);
      return !cellRange || !rangesIntersect(cellRange, normalizedTarget);
    })
    .map((node) => {
      if (!node.children?.length) return node;
      return {
        ...node,
        children: removeCellFieldNodesFromTree(node.children, normalizedTarget),
      };
    });

  return removeSubTableChildFieldNodesFromTree(nextNodes, deletedSubTableFieldIds);
}

function removeCellNodesInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);

  return nodes.flatMap((node) => {
    const cellRange = readNodeCellRange(node);
    const shouldRemoveNode = node.type !== 'sub-table'
      && Boolean(cellRange && rangesIntersect(cellRange, normalizedTarget));
    if (shouldRemoveNode) {
      return [];
    }

    if (!node.children?.length) return [node];
    return [{
      ...node,
      children: removeCellNodesInRange(node.children, normalizedTarget),
    }];
  });
}

function removeSubTableFieldNodesFromTree(
  nodes: CanvasNode[],
  subTableId: string,
  targetRange: CanvasSelectionRange,
): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);

  return nodes
    .filter((node) => {
      if (node.bindings?.subTableId !== subTableId || !node.bindings.subTableFieldId) return true;
      const cellRange = readNodeCellRange(node);
      return !cellRange || !rangesIntersect(cellRange, normalizedTarget);
    })
    .map((node) => {
      if (!node.children?.length) return node;
      return {
        ...node,
        children: removeSubTableFieldNodesFromTree(node.children, subTableId, normalizedTarget),
      };
    });
}

function compareCellRangesByStart(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  const normalizedFirst = normalizeRange(first);
  const normalizedSecond = normalizeRange(second);
  return normalizedFirst.t - normalizedSecond.t
    || normalizedFirst.l - normalizedSecond.l
    || normalizedFirst.b - normalizedSecond.b
    || normalizedFirst.r - normalizedSecond.r;
}

function findFirstCellFieldNodeInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  type CellFieldCandidate = { node: CanvasNode; range: CanvasSelectionRange; order: number };
  const normalizedTarget = normalizeRange(targetRange);
  let firstField: CellFieldCandidate | null = null;
  let order = 0;

  const visit = (items: CanvasNode[]) => {
    items.forEach((node) => {
      const cellRange = readNodeCellRange(node);
      const isSelectableCellField = node.bindings?.fieldId
        && cellRange
        && (node.type === 'sub-table'
          ? rangesEqual(cellRange, normalizedTarget)
          : rangesIntersect(cellRange, normalizedTarget));
      if (isSelectableCellField && cellRange) {
        const current = { node, range: cellRange, order };
        const rangeOrder = firstField ? compareCellRangesByStart(current.range, firstField.range) : -1;
        if (!firstField || rangeOrder < 0 || (rangeOrder === 0 && current.order < firstField.order)) {
          firstField = current;
        }
      }
      order += 1;

      if (node.children?.length) {
        visit(node.children);
      }
    });
  };

  visit(nodes);
  const selectedField = firstField as CellFieldCandidate | null;
  return selectedField?.node ?? null;
}

function findFirstCellFieldNodeIdInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  return findFirstCellFieldNodeInRange(nodes, targetRange)?.id ?? null;
}

function findSubTableNodeInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  const normalizedTarget = normalizeRange(targetRange);

  const visit = (items: CanvasNode[]): CanvasNode | null => {
    for (const node of items) {
      if (node.type === 'sub-table' && node.bindings?.fieldId) {
        const cellRange = readNodeCellRange(node);
        if (cellRange && rangesIntersect(cellRange, normalizedTarget)) {
          return node;
        }
      }
      if (node.children?.length) {
        const nested = visit(node.children);
        if (nested) return nested;
      }
    }

    return null;
  };

  return visit(nodes);
}

function selectionCrossesSubTableBoundary(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  const normalizedTarget = normalizeRange(targetRange);

  const visit = (items: CanvasNode[]): boolean => items.some((node) => {
    if (node.type === 'sub-table' && node.bindings?.fieldId) {
      const cellRange = readNodeCellRange(node);
      if (cellRange && rangesIntersect(cellRange, normalizedTarget) && !rangeContainsRange(cellRange, normalizedTarget)) {
        return true;
      }
    }
    return Boolean(node.children?.length && visit(node.children));
  });

  return visit(nodes);
}

function resolveSelectedCellRail(
  selectedFieldNode: CanvasNode | null,
  selectedRange: CanvasSelectionRange | null,
) {
  if (selectedFieldNode) {
    return selectedFieldNode?.type === 'sub-table' ? 'fields' : 'config';
  }
  return selectedRange ? 'fields' : 'thumbnails';
}

function findFirstMergeableCellFieldNodeIdInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  type CellFieldCandidate = { node: CanvasNode; range: CanvasSelectionRange; order: number };
  const normalizedTarget = normalizeRange(targetRange);
  let firstField: CellFieldCandidate | null = null;
  let order = 0;

  const visit = (items: CanvasNode[]) => {
    items.forEach((node) => {
      const cellRange = readNodeCellRange(node);
      const isSelectableCellField = isMergeableCellFieldNode(node)
        && cellRange
        && rangesIntersect(cellRange, normalizedTarget);
      if (isSelectableCellField && cellRange) {
        const current = { node, range: cellRange, order };
        const rangeOrder = firstField ? compareCellRangesByStart(current.range, firstField.range) : -1;
        if (!firstField || rangeOrder < 0 || (rangeOrder === 0 && current.order < firstField.order)) {
          firstField = current;
        }
      }
      order += 1;

      if (node.children?.length) {
        visit(node.children);
      }
    });
  };

  visit(nodes);
  const selectedField = firstField as CellFieldCandidate | null;
  return selectedField?.node.id ?? null;
}

function mergeCellFieldNodesForRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);
  const keptFieldNodeId = findFirstMergeableCellFieldNodeIdInRange(nodes, normalizedTarget);
  if (!keptFieldNodeId) return nodes;

  const reconcile = (items: CanvasNode[]): CanvasNode[] => items.flatMap((node) => {
    const cellRange = readNodeCellRange(node);
    const isFieldInRange = Boolean(isMergeableCellFieldNode(node) && cellRange && rangesIntersect(cellRange, normalizedTarget));

    if (isFieldInRange && node.id !== keptFieldNodeId) {
      return [];
    }

    const nextNode = isFieldInRange
      ? {
          ...node,
          style: {
            ...node.style,
            cellRange: normalizedTarget,
          },
        }
      : node;

    if (!nextNode.children?.length) return [nextNode];
    return [{
      ...nextNode,
      children: reconcile(nextNode.children),
    }];
  });

  return reconcile(nodes);
}

function collapseSplitCellFieldNodesToFirstCells(nodes: CanvasNode[], splitRanges: CanvasSelectionRange[]): CanvasNode[] {
  const normalizedSplitRanges = splitRanges.map(normalizeRange).sort(compareCellRangesByStart);
  if (!normalizedSplitRanges.length) return nodes;

  return nodes.map((node) => {
    const cellRange = readNodeCellRange(node);
    const splitRange = isMergeableCellFieldNode(node) && cellRange
      ? normalizedSplitRanges.find((range) => rangesIntersect(cellRange, range)) ?? null
      : null;
    const nextNode = splitRange
      ? {
          ...node,
          style: {
            ...node.style,
            cellRange: createSingleCellRange(splitRange.t, splitRange.l),
          },
        }
      : node;

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: collapseSplitCellFieldNodesToFirstCells(nextNode.children, normalizedSplitRanges),
    };
  });
}

function moveNodeInTree(nodes: CanvasNode[], nodeId: string, direction: MoveDirection): CanvasNode[] {
  const currentIndex = nodes.findIndex((node) => node.id === nodeId);
  if (currentIndex >= 0) {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= nodes.length) {
      return nodes;
    }

    const nextNodes = [...nodes];
    [nextNodes[currentIndex], nextNodes[targetIndex]] = [nextNodes[targetIndex], nextNodes[currentIndex]];
    return nextNodes;
  }

  return nodes.map((node) => {
    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: moveNodeInTree(node.children, nodeId, direction),
    };
  });
}

function resolveDefaultComponentType(field: ModelField) {
  const definition = getFieldTypeDefinition(field.type);

  if (field.type === 'text' && field.typeConfig.textMode === 'long') {
    return 'textarea';
  }
  if (field.type === 'number' && field.typeConfig.numberMode === 'decimal') {
    return 'inputdouble';
  }
  if (field.type === 'datetime') {
    if (field.typeConfig.mode === 'date') return 'datepicker';
    if (field.typeConfig.mode === 'time') return 'timepicker';
  }
  if (field.type === 'reference' && field.typeConfig.sourceType === 'department') {
    return 'department';
  }

  return definition.defaultComponentType;
}

const CELL_FIELD_INSET = 3;
const MIN_CELL_FIELD_WIDTH = 120 + CELL_FIELD_INSET * 2;
const MIN_CELL_FIELD_HEIGHT = 24 + CELL_FIELD_INSET * 2;

function createBoundNodeFromField(field: ModelField, layout?: FieldCellLayout) {
  const component = getComponentDefinition(resolveDefaultComponentType(field));
  const node = component.createDefaultNode();
  node.props = {
    ...node.props,
    label: field.name || component.label,
  };
  node.bindings = {
    ...node.bindings,
    fieldId: field.id,
    required: false,
    readonly: false,
    hidden: false,
    widgetConfig: {},
  };
  if (layout) {
    node.style = {
      ...node.style,
      position: 'absolute',
      compLeft: layout.left,
      compTop: layout.top,
      compWidth: Math.max(layout.width, MIN_CELL_FIELD_WIDTH),
      compHeight: Math.max(layout.height, MIN_CELL_FIELD_HEIGHT),
      cellRange: layout.range,
    };
  }
  return node;
}

function createBoundNodeFromSubTableField(subTableId: string, field: ModelField, layout: FieldCellLayout) {
  const node = createBoundNodeFromField(field, layout);
  node.bindings = {
    ...node.bindings,
    subTableId,
    subTableFieldId: field.id,
    subTableField: field,
  };
  return node;
}

function createBoundSubTableRegionNode(
  field: ModelField,
  pageId: string,
  range: CanvasSelectionRange,
  layout: Omit<FieldCellLayout, 'range'>,
) {
  const node = createBoundNodeFromField(field, {
    ...layout,
    range,
  });
  node.bindings = {
    ...node.bindings,
    fieldId: field.id,
    subTableRegion: createDefaultSubTableRegion({
      id: createId('sub-table-region'),
      fieldId: field.id,
      pageId,
      range,
    }),
  };
  return node;
}

function reconcileSubTableRegionTemplates(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.map((node) => {
    const nextNode = node.type === 'sub-table' && node.bindings?.subTableRegion
      ? {
          ...node,
          bindings: {
            ...node.bindings,
            subTableRegion: rebuildSubTableRecordTemplate(node.bindings.subTableRegion, nodes),
          },
        }
      : node;

    if (!nextNode.children?.length) return nextNode;
    return {
      ...nextNode,
      children: reconcileSubTableRegionTemplates(nextNode.children),
    };
  });
}

function collectBoundFieldIds(nodes: CanvasNode[], target = new Set<string>()) {
  nodes.forEach((node) => {
    if (node.bindings?.fieldId) {
      target.add(node.bindings.fieldId);
    }
    if (node.children?.length) {
      collectBoundFieldIds(node.children, target);
    }
  });
  return target;
}

function collectBoundSubTableFieldIds(nodes: CanvasNode[], subTableId: string, target = new Set<string>()) {
  nodes.forEach((node) => {
    if (node.bindings?.subTableId === subTableId && node.bindings.subTableFieldId) {
      target.add(node.bindings.subTableFieldId);
    }
    if (node.children?.length) {
      collectBoundSubTableFieldIds(node.children, subTableId, target);
    }
  });
  return target;
}

function isFieldBoundToOtherNode(nodes: CanvasNode[], fieldId: string, nodeId: string): boolean {
  return nodes.some((node) => {
    if (node.id !== nodeId && node.bindings?.fieldId === fieldId) {
      return true;
    }
    return node.children?.length ? isFieldBoundToOtherNode(node.children, fieldId, nodeId) : false;
  });
}

function syncBoundNodesForField(nodes: CanvasNode[], fieldId: string, field: ModelField): CanvasNode[] {
  const definition = getFieldTypeDefinition(field.type);
  return nodes.map((node) => {
    let nextNode = node;
    if (node.bindings?.fieldId === fieldId) {
      const nextType = definition.compatibleComponents.includes(node.type)
        ? node.type
        : resolveDefaultComponentType(field);
      const nextDefaults = getComponentDefinition(nextType).createDefaultNode();
      nextNode = {
        ...node,
        type: nextType,
        props: {
          ...nextDefaults.props,
          ...node.props,
          label: field.name || node.props.label || definition.label,
        },
        bindings: {
          ...node.bindings,
          widgetConfig: definition.compatibleComponents.includes(node.type)
            ? node.bindings.widgetConfig
            : {},
        },
      };
    }

    if (!nextNode.children?.length) {
      return nextNode;
    }

    return {
      ...nextNode,
      children: syncBoundNodesForField(nextNode.children, fieldId, field),
    };
  });
}

export interface TemplateDesignerStore {
  activeTab: TemplateDesignerTabKey;
  activeCanvasRail: TemplateDesignerCanvasRailKey;
  isCanvasSidebarVisible: boolean;
  document: TemplateDesignerDocument | null;
  savedSnapshot: string;
  undoStack: TemplateDesignerDocument[];
  redoStack: TemplateDesignerDocument[];
  pagePreviewCounts: Record<string, number>;
  activePagePreviewIndexes: Record<string, number>;
  pagePreviewScrollTarget: { pageId: string; previewIndex: number; requestId: number } | null;
  selectedFieldId: string | null;
  selectedNodeId: string | null;
  selectedSubTableGroupNodeId: string | null;
  selectedCell: CanvasSelectedCell | null;
  selectedRange: CanvasSelectionRange | null;
  setDocument: (document: TemplateDesignerDocument) => void;
  setActiveTab: (tab: TemplateDesignerTabKey) => void;
  setActiveCanvasRail: (rail: TemplateDesignerCanvasRailKey) => void;
  setCanvasSidebarVisible: (visible: boolean) => void;
  setCurrentPageId: (pageId: string) => void;
  setSelectedFieldId: (fieldId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  selectSubTableGroup: (nodeId: string) => void;
  setSelectedCell: (cell: CanvasSelectedCell | null) => void;
  setSelectedRange: (range: CanvasSelectionRange | null, activeCell?: CanvasSelectedCell | null) => void;
  selectAllCells: () => void;
  selectColumnRange: (colStart: number, colEnd?: number) => void;
  selectRowRange: (rowStart: number, rowEnd?: number) => void;
  addField: (type: FieldType, name?: string) => ModelField;
  addFields: (fields: CreateFieldInput[]) => ModelField[];
  addSubTableFields: (subTableFieldId: string, fields: CreateFieldInput[]) => ModelField[];
  updateField: (fieldId: string, patch: Partial<ModelField>) => void;
  setFieldStatus: (fieldId: string, status: ModelFieldStatus) => void;
  setModelFieldReportColumnWidth: (scopeKey: string, columnKey: string, width: number) => void;
  insertNode: (parentId: string | null, node: CanvasNode) => void;
  addFreeCanvasComponent: (componentId: CommonDisplayComponentId, position: { left: number; top: number }) => void;
  addNodeFromField: (fieldId: string, parentId?: string | null) => void;
  addNodeFromFieldToCell: (fieldId: string, layout: FieldCellLayout) => void;
  addNodeFromSubTableFieldToCell: (subTableId: string, field: ModelField, layout: FieldCellLayout) => void;
  addNodeFromFieldToRange: (fieldId: string, range: CanvasSelectionRange, layout: Omit<FieldCellLayout, 'range'>) => void;
  addSubTableRegionFromFieldToRange: (fieldId: string, range: CanvasSelectionRange, layout: Omit<FieldCellLayout, 'range'>) => void;
  setSubTableRecordTemplateFromRange: (subTableNodeId: string, range: CanvasSelectionRange) => void;
  bindFieldToNode: (nodeId: string, fieldId: string) => void;
  updateNodeBindings: (nodeId: string, patch: Record<string, unknown>) => void;
  updateSelectedSubTableRegion: (patch: Partial<SubTableRegion>) => void;
  setSelectedSubTableHeaderVisible: (visible: boolean) => void;
  updateNodeProps: (nodeId: string, patch: Record<string, unknown>) => void;
  updateNodeStyle: (nodeId: string, patch: Record<string, unknown>) => void;
  moveNode: (nodeId: string, direction: MoveDirection) => void;
  removeNode: (nodeId: string) => void;
  updateCurrentPage: (patch: Partial<TemplateDesignerDocument['canvas']['pages'][number]>) => void;
  updateCurrentPageSheet: (patch: Partial<CanvasPage['sheet']>) => void;
  replaceCurrentPageFromImport: (page: CanvasPage) => void;
  setCanvasMode: (mode: CanvasMode) => void;
  insertSheetColumns: (insertAt: number, count?: number) => void;
  insertSheetRows: (insertAt: number, count?: number) => void;
  deleteSheetColumns: (colStart: number, colEnd?: number) => void;
  deleteSheetRows: (rowStart: number, rowEnd?: number) => void;
  setSheetColumnWidth: (colStart: number, colEnd: number, width: number) => void;
  setSheetRowHeight: (rowStart: number, rowEnd: number, height: number) => void;
  updateSheetCellValue: (row: number, col: number, value: string) => void;
  updateSelectedCellValue: (value: string) => void;
  clearSelectedCells: () => void;
  copySelectedCellsText: () => string;
  pasteCellsFromText: (startRow: number, startCol: number, text: string) => void;
  cutSelectedFieldNode: () => CanvasNode | null;
  pasteFieldNodeToCell: (node: CanvasNode, layout: FieldCellLayout) => void;
  mergeSelectedCells: () => void;
  splitSelectedCells: () => void;
  updateCellStyleInRange: (range: CanvasSelectionRange, patch: Record<string, unknown>) => void;
  updateSelectedCellStyle: (patch: Record<string, unknown>) => void;
  updateSelectedCellBorder: (border: CanvasCellBorder | null) => void;
  undoCanvasChange: () => void;
  redoCanvasChange: () => void;
  canUndoCanvasChange: () => boolean;
  canRedoCanvasChange: () => boolean;
  setPagePreviewCount: (pageId: string, count: number) => void;
  setActivePagePreviewIndex: (pageId: string, previewIndex: number) => void;
  requestPagePreviewScroll: (pageId: string, previewIndex: number) => void;
  clearPagePreviewScrollTarget: (requestId: number) => void;
  getSelectedCellState: () => CanvasSheetCell | null;
  getCurrentPage: () => TemplateDesignerDocument['canvas']['pages'][number] | null;
  getSelectedNode: () => CanvasNode | null;
  getSelectedSubTableRegionNode: () => CanvasNode | null;
  getFieldById: (fieldId: string) => ModelField | null;
  getUsedFieldIdsForCurrentVersion: () => string[];
  getSubTableFieldForSelectedRange: () => ModelField | null;
  subTableFieldIdsUsedOnCanvas: (subTableId: string) => string[];
  getAvailableFieldsForCurrentVersion: (nodeId?: string | null) => ModelField[];
  addWorkflowNode: () => void;
  setWorkflowNodes: (nodes: TemplateDesignerDocument['workflow']['nodes']) => void;
  setWorkflowEdges: (edges: TemplateDesignerDocument['workflow']['edges']) => void;
  markSaved: () => void;
  isDirty: () => boolean;
}

function pushDocumentHistory(
  state: TemplateDesignerStore,
  nextState: Partial<TemplateDesignerStore> & { document?: TemplateDesignerDocument | null },
) {
  if (!state.document || !nextState.document || nextState.document === state.document) {
    return nextState;
  }

  return {
    ...nextState,
    undoStack: [...state.undoStack, state.document].slice(-DOCUMENT_HISTORY_LIMIT),
    redoStack: [],
  };
}

export const useTemplateDesignerStore = create<TemplateDesignerStore>((set, get) => ({
  activeTab: 'canvas',
  activeCanvasRail: 'thumbnails',
  isCanvasSidebarVisible: true,
  document: null,
  savedSnapshot: '',
  undoStack: [],
  redoStack: [],
  pagePreviewCounts: {},
  activePagePreviewIndexes: {},
  pagePreviewScrollTarget: null,
  selectedFieldId: null,
  selectedNodeId: null,
  selectedSubTableGroupNodeId: null,
  selectedCell: null,
  selectedRange: null,
  setDocument: (document) => set({
    document,
    activeTab: 'canvas',
    undoStack: [],
    redoStack: [],
    activeCanvasRail: 'thumbnails',
    isCanvasSidebarVisible: true,
    pagePreviewCounts: {},
    activePagePreviewIndexes: {},
    pagePreviewScrollTarget: null,
    selectedCell: null,
    selectedRange: null,
    selectedSubTableGroupNodeId: null,
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveCanvasRail: (activeCanvasRail) => set({ activeCanvasRail, isCanvasSidebarVisible: true }),
  setCanvasSidebarVisible: (isCanvasSidebarVisible) => set({ isCanvasSidebarVisible }),
  setCurrentPageId: (pageId) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          canvas: {
            ...state.document.canvas,
            currentPageId: pageId,
          },
        }
      : state.document,
    selectedCell: null,
    selectedRange: null,
    selectedNodeId: null,
    selectedSubTableGroupNodeId: null,
    activeCanvasRail: 'thumbnails',
    isCanvasSidebarVisible: true,
  })),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId, selectedSubTableGroupNodeId: null }),
  selectSubTableGroup: (selectedSubTableGroupNodeId) => set((state) => {
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    const selectedNode = currentPage ? findNode(currentPage.nodes, selectedSubTableGroupNodeId) : null;
    const groupRange = selectedNode?.type === 'sub-table'
      ? selectedNode.bindings?.subTableRegion?.recordTemplate.groupRange
      : null;
    if (!selectedNode || selectedNode.type !== 'sub-table' || !groupRange) {
      return {};
    }

    const normalizedGroupRange = normalizeRange(groupRange);
    return {
      selectedNodeId: selectedNode.id,
      selectedSubTableGroupNodeId: selectedNode.id,
      selectedRange: normalizedGroupRange,
      selectedCell: { row: normalizedGroupRange.t, col: normalizedGroupRange.l },
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    };
  }),
  setSelectedCell: (selectedCell) => set((state) => {
    const selectedRange = selectedCell ? createSingleCellRange(selectedCell.row, selectedCell.col) : null;
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    const selectedFieldNode = selectedRange && currentPage
      ? findFirstCellFieldNodeInRange(currentPage.nodes, selectedRange)
      : null;
    const selectedFieldNodeId = selectedFieldNode?.id ?? null;
    return {
      selectedCell,
      selectedRange,
      selectedNodeId: selectedFieldNodeId,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: resolveSelectedCellRail(selectedFieldNode, selectedRange),
      isCanvasSidebarVisible: true,
    };
  }),
  setSelectedRange: (selectedRange, activeCell = null) => set((state) => {
    const normalizedSelection = selectedRange ? normalizeRange(selectedRange) : null;
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    const selectedFieldNode = normalizedSelection && currentPage
      ? findFirstCellFieldNodeInRange(currentPage.nodes, normalizedSelection)
      : null;
    const selectedFieldNodeId = selectedFieldNode?.id ?? null;
    return {
      selectedRange: normalizedSelection,
      selectedCell: activeCell ?? (normalizedSelection ? {
        row: normalizedSelection.t,
        col: normalizedSelection.l,
      } : null),
      selectedNodeId: selectedFieldNodeId,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: resolveSelectedCellRail(selectedFieldNode, normalizedSelection),
      isCanvasSidebarVisible: true,
    };
  }),
  selectAllCells: () => set((state) => {
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    if (!currentPage) {
      return { selectedRange: state.selectedRange };
    }
    return {
      selectedRange: {
        t: 1,
        l: 1,
        b: currentPage.sheet.rowCount,
        r: currentPage.sheet.columnCount,
      },
      selectedCell: { row: 1, col: 1 },
      selectedNodeId: null,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: 'thumbnails',
      isCanvasSidebarVisible: true,
    };
  }),
  selectColumnRange: (colStart, colEnd = colStart) => set((state) => {
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    if (!currentPage) {
      return { selectedRange: state.selectedRange };
    }
    const range = normalizeRange({
      t: 1,
      l: colStart,
      b: currentPage.sheet.rowCount,
      r: colEnd,
    });
    return {
      selectedRange: range,
      selectedCell: { row: 1, col: range.l },
      selectedNodeId: null,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: 'thumbnails',
      isCanvasSidebarVisible: true,
    };
  }),
  selectRowRange: (rowStart, rowEnd = rowStart) => set((state) => {
    const currentPage = state.document
      ? state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId)
      : null;
    if (!currentPage) {
      return { selectedRange: state.selectedRange };
    }
    const range = normalizeRange({
      t: rowStart,
      l: 1,
      b: rowEnd,
      r: currentPage.sheet.columnCount,
    });
    return {
      selectedRange: range,
      selectedCell: { row: range.t, col: 1 },
      selectedNodeId: null,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: 'thumbnails',
      isCanvasSidebarVisible: true,
    };
  }),
  addField: (type, name) => {
    const definition = getFieldTypeDefinition(type);
    const fields = get().document?.model.fields ?? [];
    const sortOrder = fields.length + 1;
    const fieldName = name?.trim() || definition.label;
    const field = {
      ...definition.defaultField(fieldName, sortOrder),
      id: createId('field'),
      code: createUniqueFieldCode(fields, fieldName, definition.type),
    };
    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? {
            ...state.document,
            model: {
              ...state.document.model,
              fields: [...state.document.model.fields, field],
            },
          }
        : state.document,
      selectedFieldId: field.id,
    }));
    return field;
  },
  addFields: (fields) => {
    const document = get().document;
    if (!document) return [];

    const validInputs = fields.filter((field) => field.name.trim());
    if (!validInputs.length) return [];

    const createdFields = validInputs.reduce<ModelField[]>((result, input, index) => {
      const existingFields = [...document.model.fields, ...result];
      const field = createModelFieldFromInput(input, document.model.fields.length + index + 1, existingFields, 'field');
      return [...result, field];
    }, []);

    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? {
            ...state.document,
            model: {
              ...state.document.model,
              fields: [...state.document.model.fields, ...createdFields],
            },
          }
        : state.document,
      selectedFieldId: createdFields[createdFields.length - 1]?.id ?? state.selectedFieldId,
      activeCanvasRail: 'fields',
      isCanvasSidebarVisible: true,
    }));

    return createdFields;
  },
  addSubTableFields: (subTableFieldId, fields) => {
    const document = get().document;
    if (!document) return [];

    const subTableField = document.model.fields.find((field) => field.id === subTableFieldId && field.type === 'subTable');
    if (!subTableField) return [];

    const currentColumns = normalizeModelFieldColumns(subTableField.typeConfig.columns);
    const validInputs = fields.filter((field) => field.name.trim());
    if (!validInputs.length) return [];

    const createdFields = validInputs.reduce<ModelField[]>((result, input, index) => {
      const existingFields = [...currentColumns, ...result];
      const field = createModelFieldFromInput(input, currentColumns.length + index + 1, existingFields, 'sub-field');
      return [...result, field];
    }, []);

    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? {
            ...state.document,
            model: {
              ...state.document.model,
              fields: state.document.model.fields.map((field) => (
                field.id === subTableFieldId
                  ? {
                      ...field,
                      typeConfig: {
                        ...field.typeConfig,
                        columns: [...currentColumns, ...createdFields],
                      },
                    }
                  : field
              )),
            },
          }
        : state.document,
      selectedFieldId: createdFields[createdFields.length - 1]?.id ?? state.selectedFieldId,
      activeCanvasRail: 'fields',
      isCanvasSidebarVisible: true,
    }));

    return createdFields;
  },
  updateField: (fieldId, patch) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    let updatedField: ModelField | null = null;
    const nextFields = state.document.model.fields.map((field) => {
      if (field.id !== fieldId) return field;
      const nextType = patch.type ?? field.type;
      const typeChanged = nextType !== field.type;
      const definition = getFieldTypeDefinition(nextType);
      updatedField = {
        ...field,
        ...patch,
        type: definition.type,
        typeConfig: typeChanged && !patch.typeConfig
          ? { ...definition.defaultField(field.name, field.sortOrder).typeConfig }
          : { ...field.typeConfig, ...(patch.typeConfig ?? {}) },
      };
      return updatedField;
    });

    const nextPages = updatedField
      ? state.document.canvas.pages.map((page) => ({
          ...page,
          nodes: syncBoundNodesForField(page.nodes, fieldId, updatedField as ModelField),
        }))
      : state.document.canvas.pages;

    return pushDocumentHistory(state, {
      document: {
        ...state.document,
        model: {
          ...state.document.model,
          fields: nextFields,
        },
        canvas: {
          ...state.document.canvas,
          pages: nextPages,
        },
      },
    });
  }),
  setFieldStatus: (fieldId, status) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? {
          ...state.document,
          model: {
            ...state.document.model,
            fields: state.document.model.fields.map((field) => (
              field.id === fieldId ? { ...field, status } : field
            )),
          },
        }
      : state.document,
  })),
  setModelFieldReportColumnWidth: (scopeKey, columnKey, width) => set((state) => {
    if (!state.document || !scopeKey || !columnKey || !Number.isFinite(width)) {
      return { document: state.document };
    }

    const nextWidth = Math.round(width);
    const currentWidths = state.document.model.fieldReportColumnWidths ?? {};
    const currentScopeWidths = currentWidths[scopeKey] ?? {};

    return {
      document: {
        ...state.document,
        model: {
          ...state.document.model,
          fieldReportColumnWidths: {
            ...currentWidths,
            [scopeKey]: {
              ...currentScopeWidths,
              [columnKey]: nextWidth,
            },
          },
        },
      },
    };
  }),
  insertNode: (parentId, node) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: insertNodeIntoTree(page.nodes, parentId, node),
        }))
      : state.document,
    selectedNodeId: node.id,
  })),
  addFreeCanvasComponent: (componentId, position) => {
    const currentPage = get().getCurrentPage();
    if (!currentPage || currentPage.sheet.canvasMode !== 'paper') return;
    get().insertNode(null, createCommonDisplayNode(componentId, position));
  },
  addNodeFromField: (fieldId, parentId = null) => {
    const field = get().getFieldById(fieldId);
    const availableFields = get().getAvailableFieldsForCurrentVersion();
    const selectedRange = get().selectedRange;
    if (!field || field.status !== 'enabled' || !availableFields.some((item) => item.id === field.id)) return;
    if (field.type === 'subTable' && (!selectedRange || !isMultiCellRange(normalizeRange(selectedRange)))) return;
    get().insertNode(parentId, createBoundNodeFromField(field));
  },
  addNodeFromFieldToCell: (fieldId, layout) => {
    const field = get().getFieldById(fieldId);
    const availableFields = get().getAvailableFieldsForCurrentVersion();
    const selectedRange = get().selectedRange;
    if (!field || field.status !== 'enabled' || !availableFields.some((item) => item.id === field.id)) return;
    if (field.type === 'subTable' && (!selectedRange || !isMultiCellRange(normalizeRange(selectedRange)))) return;
    const node = createBoundNodeFromField(field, layout);
    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? updateCanvasPage(state.document, (page) => ({
            ...page,
            nodes: [
              ...removeCellFieldNodesFromTree(page.nodes, layout.range ?? createSingleCellRange()),
              node,
            ],
          }))
        : state.document,
      selectedNodeId: node.id,
    }));
  },
  addNodeFromSubTableFieldToCell: (subTableId, field, layout) => {
    if (!field || field.status !== 'enabled' || field.type === 'subTable') return;
    const node = createBoundNodeFromSubTableField(subTableId, field, layout);
    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? updateCanvasPage(state.document, (page) => ({
            ...page,
            nodes: reconcileSubTableRegionTemplates([
              ...removeSubTableFieldNodesFromTree(page.nodes, subTableId, layout.range ?? createSingleCellRange()),
              node,
            ]),
          }))
        : state.document,
      selectedNodeId: node.id,
    }));
  },
  addNodeFromFieldToRange: (fieldId, range, layout) => {
    const field = get().getFieldById(fieldId);
    const availableFields = get().getAvailableFieldsForCurrentVersion();
    const layoutRange = normalizeRange(range);
    if (!field || field.status !== 'enabled' || !availableFields.some((item) => item.id === field.id)) return;
    if (field.type === 'subTable') {
      get().addSubTableRegionFromFieldToRange(fieldId, layoutRange, layout);
      return;
    }
    const node = createBoundNodeFromField(field, {
      ...layout,
      range: layoutRange,
    });
    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? updateCanvasPage(state.document, (page) => ({
            ...page,
            nodes: [
              ...removeCellFieldNodesFromTree(page.nodes, layoutRange),
              node,
            ],
          }))
        : state.document,
      selectedNodeId: node.id,
      selectedRange: layoutRange,
      selectedCell: { row: layoutRange.t, col: layoutRange.l },
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    }));
  },
  addSubTableRegionFromFieldToRange: (fieldId, range, layout) => {
    const field = get().getFieldById(fieldId);
    const availableFields = get().getAvailableFieldsForCurrentVersion();
    const page = get().getCurrentPage();
    const layoutRange = normalizeRange(range);
    if (!field || field.type !== 'subTable' || field.status !== 'enabled' || !page) return;
    if (!availableFields.some((item) => item.id === field.id) || !isMultiCellRange(layoutRange)) return;

    const node = createBoundSubTableRegionNode(field, page.id, layoutRange, layout);
    set((state) => pushDocumentHistory(state, {
      document: state.document
        ? updateCanvasPage(state.document, (page) => ({
            ...page,
            nodes: [
              ...removeCellFieldNodesFromTree(page.nodes, layoutRange),
              node,
            ],
          }))
        : state.document,
      selectedNodeId: node.id,
      selectedRange: layoutRange,
      selectedCell: { row: layoutRange.t, col: layoutRange.l },
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    }));
  },
  setSubTableRecordTemplateFromRange: (subTableNodeId, range) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const normalizedRange = normalizeRange(range);

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        nodes: reconcileSubTableRegionTemplates(mapNodes(page.nodes, subTableNodeId, (node) => {
          if (node.type !== 'sub-table' || !node.bindings?.subTableRegion) return node;
          const currentRegion = node.bindings.subTableRegion;
          const direction = currentRegion.repeat.type === 'dynamic'
            ? 'row'
            : currentRegion.recordTemplate.direction;
          const repeat = currentRegion.repeat.type === 'fixed'
            ? resolveFixedRepeatFromTemplateRange(currentRegion, normalizedRange, direction)
            : currentRegion.repeat;
          return {
            ...node,
            bindings: {
              ...node.bindings,
              subTableRegion: {
                ...currentRegion,
                repeat,
                recordTemplate: {
                  ...currentRegion.recordTemplate,
                  direction,
                  anchor: { row: normalizedRange.t, col: normalizedRange.l },
                  groupRange: normalizedRange,
                },
              },
            },
          };
        })),
      })),
      selectedRange: normalizedRange,
      selectedCell: { row: normalizedRange.t, col: normalizedRange.l },
      selectedNodeId: subTableNodeId,
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    });
  }),
  bindFieldToNode: (nodeId, fieldId) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    const field = fieldId ? state.document.model.fields.find((item) => item.id === fieldId) ?? null : null;
    if (fieldId && (!currentPage || !field || field.status !== 'enabled' || isFieldBoundToOtherNode(currentPage.nodes, fieldId, nodeId))) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        nodes: mapNodes(page.nodes, nodeId, (node) => {
          if (!field) {
            return {
              ...node,
              bindings: { ...node.bindings, fieldId: undefined },
            };
          }

          const definition = getFieldTypeDefinition(field.type);
          const nextType = definition.compatibleComponents.includes(node.type)
            ? node.type
            : resolveDefaultComponentType(field);
          const nextDefaults = getComponentDefinition(nextType).createDefaultNode();

          return {
            ...node,
            type: nextType,
            props: {
              ...nextDefaults.props,
              ...node.props,
              label: field.name || node.props.label || definition.label,
            },
            bindings: {
              ...node.bindings,
              fieldId: field.id,
              displayLabel: undefined,
              widgetConfig: definition.compatibleComponents.includes(node.type)
                ? node.bindings?.widgetConfig
                : {},
            },
          };
        }),
      })),
    });
  }),
  updateNodeBindings: (nodeId, patch) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: mapNodes(page.nodes, nodeId, (node) => ({
            ...node,
            bindings: { ...node.bindings, ...patch } as CanvasNode['bindings'],
          })),
        }))
      : state.document,
  })),
  updateSelectedSubTableRegion: (patch) => set((state) => {
    if (!state.document || !state.selectedNodeId) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        nodes: mapNodes(page.nodes, state.selectedNodeId!, (node) => {
          if (node.type !== 'sub-table' || !node.bindings?.subTableRegion) return node;
          return {
            ...node,
            bindings: {
              ...node.bindings,
              subTableRegion: {
                ...node.bindings.subTableRegion,
                ...patch,
              },
            },
          };
        }),
      })),
    });
  }),
  setSelectedSubTableHeaderVisible: (visible) => set((state) => {
    if (!state.document || !state.selectedNodeId) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    const selectedNode = currentPage ? findNode(currentPage.nodes, state.selectedNodeId) : null;
    if (selectedNode?.type !== 'sub-table' || !selectedNode.bindings?.subTableRegion) {
      return { document: state.document };
    }

    const region = selectedNode.bindings.subTableRegion;
    const primaryRange = getSubTableRegionPrimaryRange(region) ?? readNodeCellRange(selectedNode);
    if (!primaryRange || region.presentation.showHeader === visible) {
      return { document: state.document };
    }

    if (!visible) {
      const deleteStart = primaryRange.t;
      const deleteCount = 1;
      const collapsedRange = normalizeRange({
        ...primaryRange,
        b: Math.max(primaryRange.t, primaryRange.b - deleteCount),
      });

      return pushDocumentHistory(state, {
        document: updateCanvasPage(state.document, (page) => {
          const rowOffset = page.sheet.rowHeights[deleteStart - 1] ?? page.sheet.defaultRowHeight;
          const shiftedNodes = shiftCanvasNodesForDeletedRows(page.nodes, deleteStart, deleteCount, rowOffset);
          const nodesWithoutHeader = mapNodes(shiftedNodes, state.selectedNodeId!, (node) => {
            if (node.type !== 'sub-table' || !node.bindings?.subTableRegion) return node;
            return {
              ...node,
              bindings: {
                ...node.bindings,
                subTableRegion: {
                  ...node.bindings.subTableRegion,
                  presentation: {
                    ...node.bindings.subTableRegion.presentation,
                    showHeader: false,
                  },
                },
              },
            };
          });

          return {
            ...page,
            sheet: {
              ...page.sheet,
              rowCount: Math.max(1, page.sheet.rowCount - deleteCount),
              rowHeights: deleteSizes(
                page.sheet.rowHeights,
                deleteStart,
                deleteStart,
                Math.max(1, page.sheet.rowCount - deleteCount),
                page.sheet.defaultRowHeight,
              ),
            },
            cells: shiftCellsForDeletedRows(page.cells, deleteStart, deleteCount),
            mergedCells: shiftMergedRangesForDeletedRows(page.mergedCells, deleteStart, deleteCount),
            nodes: reconcileSubTableRegionTemplates(nodesWithoutHeader),
          };
        }),
        selectedRange: collapsedRange,
        selectedCell: { row: collapsedRange.t, col: collapsedRange.l },
        selectedNodeId: state.selectedNodeId,
        activeCanvasRail: 'config',
        isCanvasSidebarVisible: true,
      });
    }

    const insertAt = primaryRange.t;
    const insertCount = 1;
    const expandedRange = normalizeRange({
      ...primaryRange,
      b: primaryRange.b + insertCount,
    });

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => {
        const rowOffset = insertCount * page.sheet.defaultRowHeight;
        const shiftedNodes = shiftCanvasNodesForInsertedRows(page.nodes, insertAt, insertCount, rowOffset);
        const nodesWithHeader = mapNodes(shiftedNodes, state.selectedNodeId!, (node) => (
          expandSelectedSubTableForHeaderRow(node, insertAt, rowOffset)
        ));

        return {
          ...page,
          sheet: {
            ...page.sheet,
            rowCount: page.sheet.rowCount + insertCount,
            rowHeights: [
              ...page.sheet.rowHeights.slice(0, insertAt - 1),
              ...Array.from({ length: insertCount }, () => page.sheet.defaultRowHeight),
              ...page.sheet.rowHeights.slice(insertAt - 1),
            ],
          },
          cells: shiftCellsForInsertedRows(page.cells, insertAt, insertCount),
          mergedCells: shiftMergedRangesForInsertedRows(page.mergedCells, insertAt, insertCount),
          nodes: reconcileSubTableRegionTemplates(nodesWithHeader),
        };
      }),
      selectedRange: expandedRange,
      selectedCell: { row: expandedRange.t, col: expandedRange.l },
      selectedNodeId: state.selectedNodeId,
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    });
  }),
  updateNodeProps: (nodeId, patch) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: mapNodes(page.nodes, nodeId, (node) => ({
            ...node,
            props: { ...node.props, ...patch },
          })),
        }))
      : state.document,
  })),
  updateNodeStyle: (nodeId, patch) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: mapNodes(page.nodes, nodeId, (node) => ({
            ...node,
            style: { ...node.style, ...patch },
          })),
        }))
      : state.document,
  })),
  moveNode: (nodeId, direction) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: moveNodeInTree(page.nodes, nodeId, direction),
        }))
      : state.document,
  })),
  removeNode: (nodeId) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          nodes: reconcileSubTableRegionTemplates(removeNodeAndSubTableFieldsFromTree(page.nodes, nodeId)),
        }))
      : state.document,
    selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
  })),
  updateCurrentPage: (patch) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({ ...page, ...patch }))
      : state.document,
  })),
  updateCurrentPageSheet: (patch) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          sheet: { ...page.sheet, ...patch },
        }))
      : state.document,
  })),
  replaceCurrentPageFromImport: (importedPage) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: {
        ...state.document,
        canvas: {
          ...state.document.canvas,
          pages: state.document.canvas.pages.map((page) => (
            page.id === state.document?.canvas.currentPageId
              ? {
                  ...page,
                  ...importedPage,
                  id: page.id,
                  name: page.name,
                }
              : page
          )),
          currentPageId: state.document.canvas.currentPageId,
        },
      },
      selectedCell: null,
      selectedRange: null,
      selectedNodeId: null,
    });
  }),
  setCanvasMode: (mode) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? updateCanvasPage(state.document, (page) => ({
          ...page,
          sheet: { ...page.sheet, canvasMode: mode },
        }))
      : state.document,
  })),
  insertSheetColumns: (insertAt, count = 1) => set((state) => {
    if (!state.document || count <= 0) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        sheet: {
          ...page.sheet,
          columnCount: page.sheet.columnCount + count,
          columnWidths: [
            ...page.sheet.columnWidths.slice(0, insertAt - 1),
            ...Array.from({ length: count }, () => page.sheet.defaultColumnWidth),
            ...page.sheet.columnWidths.slice(insertAt - 1),
          ],
        },
        cells: shiftCellsForInsertedColumns(page.cells, insertAt, count),
        mergedCells: shiftMergedRangesForInsertedColumns(page.mergedCells, insertAt, count),
      })),
      selectedRange: state.selectedRange
        ? normalizeRange({
            t: state.selectedRange.t,
            l: insertAt,
            b: state.selectedRange.b,
            r: insertAt + count - 1,
          })
        : state.selectedRange,
      selectedCell: { row: 1, col: insertAt },
    });
  }),
  insertSheetRows: (insertAt, count = 1) => set((state) => {
    if (!state.document || count <= 0) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => {
        const rowOffset = count * page.sheet.defaultRowHeight;

        return {
          ...page,
          sheet: {
            ...page.sheet,
            rowCount: page.sheet.rowCount + count,
            rowHeights: [
              ...page.sheet.rowHeights.slice(0, insertAt - 1),
              ...Array.from({ length: count }, () => page.sheet.defaultRowHeight),
              ...page.sheet.rowHeights.slice(insertAt - 1),
            ],
          },
          cells: shiftCellsForInsertedRows(page.cells, insertAt, count),
          mergedCells: shiftMergedRangesForInsertedRows(page.mergedCells, insertAt, count),
          nodes: reconcileSubTableRegionTemplates(shiftCanvasNodesForInsertedRows(page.nodes, insertAt, count, rowOffset)),
        };
      }),
      selectedRange: state.selectedRange
        ? normalizeRange({
            t: insertAt,
            l: state.selectedRange.l,
            b: insertAt + count - 1,
            r: state.selectedRange.r,
          })
        : state.selectedRange,
      selectedCell: { row: insertAt, col: 1 },
    });
  }),
  deleteSheetColumns: (colStart, colEnd = colStart) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    if (!currentPage) {
      return { document: state.document };
    }

    const deleteRange = getDeleteRange(colStart, colEnd, currentPage.sheet.columnCount);
    if (!deleteRange) {
      return { document: state.document };
    }

    const nextColumnCount = currentPage.sheet.columnCount - deleteRange.count;
    const nextSelectedCol = Math.min(deleteRange.start, nextColumnCount);

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => {
        const columnOffset = sumSizes(
          page.sheet.columnWidths,
          deleteRange.start,
          deleteRange.end,
          page.sheet.defaultColumnWidth,
        );

        return {
          ...page,
          sheet: {
            ...page.sheet,
            columnCount: nextColumnCount,
            columnWidths: deleteSizes(
              page.sheet.columnWidths,
              deleteRange.start,
              deleteRange.end,
              nextColumnCount,
              page.sheet.defaultColumnWidth,
            ),
          },
          cells: shiftCellsForDeletedColumns(page.cells, deleteRange.start, deleteRange.count),
          mergedCells: shiftMergedRangesForDeletedColumns(page.mergedCells, deleteRange.start, deleteRange.count),
          nodes: reconcileSubTableRegionTemplates(
            shiftCanvasNodesForDeletedColumns(page.nodes, deleteRange.start, deleteRange.count, columnOffset),
          ),
        };
      }),
      selectedRange: {
        t: 1,
        l: nextSelectedCol,
        b: currentPage.sheet.rowCount,
        r: nextSelectedCol,
      },
      selectedCell: { row: 1, col: nextSelectedCol },
    });
  }),
  deleteSheetRows: (rowStart, rowEnd = rowStart) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    if (!currentPage) {
      return { document: state.document };
    }

    const deleteRange = getDeleteRange(rowStart, rowEnd, currentPage.sheet.rowCount);
    if (!deleteRange) {
      return { document: state.document };
    }

    const nextRowCount = currentPage.sheet.rowCount - deleteRange.count;
    const nextSelectedRow = Math.min(deleteRange.start, nextRowCount);

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => {
        const rowOffset = sumSizes(
          page.sheet.rowHeights,
          deleteRange.start,
          deleteRange.end,
          page.sheet.defaultRowHeight,
        );

        return {
          ...page,
          sheet: {
            ...page.sheet,
            rowCount: nextRowCount,
            rowHeights: deleteSizes(
              page.sheet.rowHeights,
              deleteRange.start,
              deleteRange.end,
              nextRowCount,
              page.sheet.defaultRowHeight,
            ),
          },
          cells: shiftCellsForDeletedRows(page.cells, deleteRange.start, deleteRange.count),
          mergedCells: shiftMergedRangesForDeletedRows(page.mergedCells, deleteRange.start, deleteRange.count),
          nodes: reconcileSubTableRegionTemplates(
            shiftCanvasNodesForDeletedRows(page.nodes, deleteRange.start, deleteRange.count, rowOffset),
          ),
        };
      }),
      selectedRange: {
        t: nextSelectedRow,
        l: 1,
        b: nextSelectedRow,
        r: currentPage.sheet.columnCount,
      },
      selectedCell: { row: nextSelectedRow, col: 1 },
    });
  }),
  setSheetColumnWidth: (colStart, colEnd, width) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const nextWidth = Math.max(36, Math.round(width));

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        sheet: {
          ...page.sheet,
          columnWidths: page.sheet.columnWidths.map((columnWidth, index) => {
            const col = index + 1;
            return col >= colStart && col <= colEnd ? nextWidth : columnWidth;
          }),
        },
      })),
    });
  }),
  setSheetRowHeight: (rowStart, rowEnd, height) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    const nextHeight = Math.max(24, Math.round(height));

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        sheet: {
          ...page.sheet,
          rowHeights: page.sheet.rowHeights.map((rowHeight, index) => {
            const row = index + 1;
            return row >= rowStart && row <= rowEnd ? nextHeight : rowHeight;
          }),
        },
      })),
    });
  }),
  updateSheetCellValue: (row, col, value) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => updatePageCellValue(page, row, col, value)),
    });
  }),
  updateSelectedCellValue: (value) => set((state) => {
    if (!state.document || !state.selectedCell) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(
        state.document,
        (page) => updatePageCellValue(page, state.selectedCell!.row, state.selectedCell!.col, value),
      ),
    });
  }),
  clearSelectedCells: () => set((state) => {
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    if (!state.document || !selectedRange) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    const selectedNode = state.selectedNodeId && currentPage ? findNode(currentPage.nodes, state.selectedNodeId) : null;

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...clearPageCellsInRange(page, selectedRange),
        nodes: state.selectedNodeId
          ? selectedNode?.type === 'sub-table' ? page.nodes : reconcileSubTableRegionTemplates(removeCellNodesInRange(page.nodes, selectedRange))
          : reconcileSubTableRegionTemplates(removeCellNodesInRange(page.nodes, selectedRange)),
      })),
      selectedNodeId: selectedNode?.type === 'sub-table' ? state.selectedNodeId : null,
    });
  }),
  copySelectedCellsText: () => {
    const state = get();
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    const currentPage = state.document?.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    if (!currentPage || !selectedRange) {
      return '';
    }

    return serializePageCellsInRange(currentPage, selectedRange);
  },
  pasteCellsFromText: (startRow, startCol, text) => set((state) => {
    if (!state.document || text.length === 0) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    const pastedRange = currentPage ? getPastedCellsRange(currentPage, startRow, startCol, text) : null;
    if (!pastedRange) {
      return { document: state.document };
    }

    const nextDocument = updateCanvasPage(state.document, (page) => {
      const pasted = pastePageCellsFromText(page, startRow, startCol, text);
      return pasted.page;
    });

    return pushDocumentHistory(state, {
      document: nextDocument,
      selectedRange: pastedRange,
      selectedCell: { row: pastedRange.t, col: pastedRange.l },
      selectedNodeId: null,
    });
  }),
  cutSelectedFieldNode: () => {
    const state = get();
    const currentPage = state.document?.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    const selectedNode = state.selectedNodeId && currentPage ? findNode(currentPage.nodes, state.selectedNodeId) : null;
    if (!state.document || !selectedNode || !isCuttableCellFieldNode(selectedNode)) {
      return null;
    }

    const clippedNode = cloneCanvasNode(selectedNode);
    set((currentState) => pushDocumentHistory(currentState, {
      document: currentState.document
        ? updateCanvasPage(currentState.document, (page) => ({
            ...page,
            nodes: reconcileSubTableRegionTemplates(removeNodeAndSubTableFieldsFromTree(page.nodes, selectedNode.id)),
          }))
        : currentState.document,
      selectedNodeId: null,
      selectedSubTableGroupNodeId: null,
    }));

    return clippedNode;
  },
  pasteFieldNodeToCell: (node, layout) => set((state) => {
    if (!state.document || !isCuttableCellFieldNode(node)) {
      return { document: state.document };
    }

    const targetRange = normalizeRange(layout.range ?? createSingleCellRange());
    const pastedNode = cloneFieldNodeForCellPaste(node, {
      ...layout,
      range: targetRange,
    });

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => {
        const nodesWithoutSource = removeNodeAndSubTableFieldsFromTree(page.nodes, node.id);
        const nodesWithoutTarget = node.bindings?.subTableId && node.bindings.subTableFieldId
          ? removeSubTableFieldNodesFromTree(nodesWithoutSource, node.bindings.subTableId, targetRange)
          : removeCellFieldNodesFromTree(nodesWithoutSource, targetRange);

        return {
          ...page,
          nodes: reconcileSubTableRegionTemplates([
            ...nodesWithoutTarget,
            pastedNode,
          ]),
        };
      }),
      selectedRange: targetRange,
      selectedCell: { row: targetRange.t, col: targetRange.l },
      selectedNodeId: pastedNode.id,
      selectedSubTableGroupNodeId: null,
      activeCanvasRail: 'config',
      isCanvasSidebarVisible: true,
    });
  }),
  mergeSelectedCells: () => set((state) => {
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    if (!state.document || !selectedRange) {
      return { document: state.document };
    }

    const normalizedSelection = normalizeRange(selectedRange);
    if (!isMultiCellRange(normalizedSelection)) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    if (!currentPage || selectionCrossesSubTableBoundary(currentPage.nodes, normalizedSelection)) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...mergePageCellValuesInRange(page, normalizedSelection),
        nodes: reconcileSubTableRegionTemplates(mergeCellFieldNodesForRange(page.nodes, normalizedSelection)),
        mergedCells: [
          ...removeMergedRangesInSelection(page.mergedCells, normalizedSelection),
          normalizedSelection,
        ],
      })),
      selectedRange: normalizedSelection,
      selectedCell: { row: normalizedSelection.t, col: normalizedSelection.l },
      selectedNodeId: null,
    });
  }),
  splitSelectedCells: () => set((state) => {
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    if (!state.document || !selectedRange) {
      return { document: state.document };
    }

    const currentPage = state.document.canvas.pages.find((page) => page.id === state.document?.canvas.currentPageId);
    if (!currentPage) {
      return { document: state.document };
    }

    const normalizedSelection = normalizeRange(selectedRange);
    const removedMergedRanges = currentPage.mergedCells
      .filter((range) => rangesIntersect(range, normalizedSelection))
      .map(normalizeRange);
    const nextMergedCells = removeMergedRangesInSelection(currentPage.mergedCells, normalizedSelection);
    if (nextMergedCells.length === currentPage.mergedCells.length) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...page,
        nodes: reconcileSubTableRegionTemplates(collapseSplitCellFieldNodesToFirstCells(page.nodes, removedMergedRanges)),
        mergedCells: nextMergedCells,
      })),
      selectedRange: normalizedSelection,
      selectedCell: { row: normalizedSelection.t, col: normalizedSelection.l },
      selectedNodeId: null,
    });
  }),
  updateCellStyleInRange: (range, patch) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => updatePageCellStyleInRange(page, range, patch)),
    });
  }),
  updateSelectedCellStyle: (patch) => {
    const { selectedCell, selectedRange: currentSelectedRange } = get();
    const selectedRange = currentSelectedRange ?? (selectedCell
      ? createSingleCellRange(selectedCell.row, selectedCell.col)
      : null);
    if (!selectedRange) return;
    get().updateCellStyleInRange(selectedRange, patch);
  },
  updateSelectedCellBorder: (border) => set((state) => {
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    if (!state.document || !selectedRange) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => updatePageCellBorderInRange(page, selectedRange, border)),
    });
  }),
  undoCanvasChange: () => set((state) => {
    if (!state.document || state.undoStack.length === 0) {
      return {};
    }

    const previousDocument = state.undoStack[state.undoStack.length - 1];
    return {
      document: previousDocument,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, state.document].slice(-DOCUMENT_HISTORY_LIMIT),
      selectedNodeId: null,
    };
  }),
  redoCanvasChange: () => set((state) => {
    if (!state.document || state.redoStack.length === 0) {
      return {};
    }

    const nextDocument = state.redoStack[state.redoStack.length - 1];
    return {
      document: nextDocument,
      undoStack: [...state.undoStack, state.document].slice(-DOCUMENT_HISTORY_LIMIT),
      redoStack: state.redoStack.slice(0, -1),
      selectedNodeId: null,
    };
  }),
  canUndoCanvasChange: () => get().undoStack.length > 0,
  canRedoCanvasChange: () => get().redoStack.length > 0,
  setPagePreviewCount: (pageId, count) => set((state) => ({
    pagePreviewCounts: state.pagePreviewCounts[pageId] === count
      ? state.pagePreviewCounts
      : {
          ...state.pagePreviewCounts,
          [pageId]: Math.max(1, count),
        },
  })),
  setActivePagePreviewIndex: (pageId, previewIndex) => set((state) => ({
    activePagePreviewIndexes: state.activePagePreviewIndexes[pageId] === previewIndex
      ? state.activePagePreviewIndexes
      : {
          ...state.activePagePreviewIndexes,
          [pageId]: Math.max(0, previewIndex),
        },
  })),
  requestPagePreviewScroll: (pageId, previewIndex) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          canvas: {
            ...state.document.canvas,
            currentPageId: pageId,
          },
        }
      : state.document,
    activePagePreviewIndexes: {
      ...state.activePagePreviewIndexes,
      [pageId]: Math.max(0, previewIndex),
    },
    pagePreviewScrollTarget: {
      pageId,
      previewIndex: Math.max(0, previewIndex),
      requestId: Date.now(),
    },
    selectedCell: null,
    selectedRange: null,
    selectedNodeId: null,
  })),
  clearPagePreviewScrollTarget: (requestId) => set((state) => ({
    pagePreviewScrollTarget: state.pagePreviewScrollTarget?.requestId === requestId
      ? null
      : state.pagePreviewScrollTarget,
  })),
  getSelectedCellState: () => {
    const page = get().getCurrentPage();
    const selectedCell = get().selectedCell;
    if (!page || !selectedCell) return null;
    return page.cells[getCellKey(selectedCell.row, selectedCell.col)] ?? null;
  },
  getCurrentPage: () => {
    const document = get().document;
    if (!document) return null;
    return document.canvas.pages.find((page) => page.id === document.canvas.currentPageId) ?? null;
  },
  getSelectedNode: () => {
    const page = get().getCurrentPage();
    const selectedNodeId = get().selectedNodeId;
    if (!page || !selectedNodeId) return null;
    return findNode(page.nodes, selectedNodeId);
  },
  getSelectedSubTableRegionNode: () => {
    const selectedNode = get().getSelectedNode();
    return selectedNode?.type === 'sub-table' && selectedNode.bindings?.subTableRegion ? selectedNode : null;
  },
  getFieldById: (fieldId) => {
    const document = get().document;
    if (!document) return null;
    return document.model.fields.find((field) => field.id === fieldId) ?? null;
  },
  getUsedFieldIdsForCurrentVersion: () => {
    const page = get().getCurrentPage();
    if (!page) return [];
    return Array.from(collectBoundFieldIds(page.nodes));
  },
  getSubTableFieldForSelectedRange: () => {
    const page = get().getCurrentPage();
    const selectedRange = get().selectedRange;
    if (!page || !selectedRange) return null;
    const selectedSubTableNode = findSubTableNodeInRange(page.nodes, selectedRange);
    const subTableFieldId = selectedSubTableNode?.bindings?.fieldId;
    if (!subTableFieldId) return null;
    return get().getFieldById(subTableFieldId);
  },
  subTableFieldIdsUsedOnCanvas: (subTableId) => {
    const page = get().getCurrentPage();
    if (!page) return [];
    return Array.from(collectBoundSubTableFieldIds(page.nodes, subTableId));
  },
  getAvailableFieldsForCurrentVersion: (nodeId = null) => {
    const document = get().document;
    const page = get().getCurrentPage();
    if (!document || !page) return [];
    const selectedNode = nodeId ? findNode(page.nodes, nodeId) : null;
    const currentFieldId = selectedNode?.bindings?.fieldId ?? null;
    const usedFieldIds = collectBoundFieldIds(page.nodes);

    return document.model.fields.filter((field) => {
      if (field.status !== 'enabled') return false;
      return field.id === currentFieldId || !usedFieldIds.has(field.id);
    });
  },
  addWorkflowNode: () => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            nodes: [
              ...state.document.workflow.nodes,
              {
                id: createId('workflow-node'),
                position: {
                  x: 80 + state.document.workflow.nodes.length * 40,
                  y: 80 + state.document.workflow.nodes.length * 24,
                },
                data: {
                  label: `节点 ${state.document.workflow.nodes.length + 1}`,
                },
              },
            ],
          },
        }
      : state.document,
  })),
  setWorkflowNodes: (nodes) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            nodes,
          },
        }
      : state.document,
  })),
  setWorkflowEdges: (edges) => set((state) => pushDocumentHistory(state, {
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            edges,
          },
        }
      : state.document,
  })),
  markSaved: () => {
    const document = get().document;
    set({ savedSnapshot: document ? JSON.stringify(document) : '' });
  },
  isDirty: () => {
    const { document, savedSnapshot } = get();
    if (!document) return false;
    return JSON.stringify(document) !== savedSnapshot;
  },
}));
