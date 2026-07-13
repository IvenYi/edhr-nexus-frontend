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
  TemplateDesignerCanvasRailKey,
  TemplateDesignerDocument,
  TemplateDesignerTabKey,
} from '../types';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';

type MoveDirection = 'up' | 'down';

interface FieldCellLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  range?: CanvasSelectionRange;
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

function removeCellFieldNodesFromTree(nodes: CanvasNode[], targetRange: CanvasSelectionRange): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);

  return nodes
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
}

function compareCellRangesByStart(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  const normalizedFirst = normalizeRange(first);
  const normalizedSecond = normalizeRange(second);
  return normalizedFirst.t - normalizedSecond.t
    || normalizedFirst.l - normalizedSecond.l
    || normalizedFirst.b - normalizedSecond.b
    || normalizedFirst.r - normalizedSecond.r;
}

function findFirstCellFieldNodeIdInRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange) {
  type CellFieldCandidate = { id: string; range: CanvasSelectionRange; order: number };
  const normalizedTarget = normalizeRange(targetRange);
  let firstField: CellFieldCandidate | null = null;
  let order = 0;

  const visit = (items: CanvasNode[]) => {
    items.forEach((node) => {
      const cellRange = readNodeCellRange(node);
      if (node.bindings?.fieldId && cellRange && rangesIntersect(cellRange, normalizedTarget)) {
        const current = { id: node.id, range: cellRange, order };
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
  return selectedField?.id ?? null;
}

function mergeCellFieldNodesForRange(nodes: CanvasNode[], targetRange: CanvasSelectionRange): CanvasNode[] {
  const normalizedTarget = normalizeRange(targetRange);
  const keptFieldNodeId = findFirstCellFieldNodeIdInRange(nodes, normalizedTarget);
  if (!keptFieldNodeId) return nodes;

  const reconcile = (items: CanvasNode[]): CanvasNode[] => items.flatMap((node) => {
    const cellRange = readNodeCellRange(node);
    const isFieldInRange = Boolean(node.bindings?.fieldId && cellRange && rangesIntersect(cellRange, normalizedTarget));

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
    const splitRange = node.bindings?.fieldId && cellRange
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
  selectedCell: CanvasSelectedCell | null;
  selectedRange: CanvasSelectionRange | null;
  setDocument: (document: TemplateDesignerDocument) => void;
  setActiveTab: (tab: TemplateDesignerTabKey) => void;
  setActiveCanvasRail: (rail: TemplateDesignerCanvasRailKey) => void;
  setCanvasSidebarVisible: (visible: boolean) => void;
  setCurrentPageId: (pageId: string) => void;
  setSelectedFieldId: (fieldId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedCell: (cell: CanvasSelectedCell | null) => void;
  setSelectedRange: (range: CanvasSelectionRange | null, activeCell?: CanvasSelectedCell | null) => void;
  selectAllCells: () => void;
  selectColumnRange: (colStart: number, colEnd?: number) => void;
  selectRowRange: (rowStart: number, rowEnd?: number) => void;
  addField: (type: FieldType, name?: string) => ModelField;
  updateField: (fieldId: string, patch: Partial<ModelField>) => void;
  setFieldStatus: (fieldId: string, status: ModelFieldStatus) => void;
  setModelFieldReportColumnWidth: (scopeKey: string, columnKey: string, width: number) => void;
  insertNode: (parentId: string | null, node: CanvasNode) => void;
  addNodeFromField: (fieldId: string, parentId?: string | null) => void;
  addNodeFromFieldToCell: (fieldId: string, layout: FieldCellLayout) => void;
  bindFieldToNode: (nodeId: string, fieldId: string) => void;
  updateNodeBindings: (nodeId: string, patch: Record<string, unknown>) => void;
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
  mergeSelectedCells: () => void;
  splitSelectedCells: () => void;
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
  getFieldById: (fieldId: string) => ModelField | null;
  getUsedFieldIdsForCurrentVersion: () => string[];
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
    activeCanvasRail: 'thumbnails',
    isCanvasSidebarVisible: true,
  })),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setSelectedCell: (selectedCell) => set({
    selectedCell,
    selectedRange: selectedCell ? createSingleCellRange(selectedCell.row, selectedCell.col) : null,
    selectedNodeId: null,
    activeCanvasRail: selectedCell ? 'fields' : 'thumbnails',
    isCanvasSidebarVisible: true,
  }),
  setSelectedRange: (selectedRange, activeCell = null) => set((state) => {
    const normalizedSelection = selectedRange ? normalizeRange(selectedRange) : null;
    return {
      selectedRange: normalizedSelection,
      selectedCell: activeCell ?? (normalizedSelection ? {
        row: normalizedSelection.t,
        col: normalizedSelection.l,
      } : null),
      selectedNodeId: null,
      activeCanvasRail: selectedRange ? 'fields' : 'thumbnails',
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
          nodes: removeNodeFromTree(page.nodes, nodeId),
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
      document: updateCanvasPage(state.document, (page) => ({
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
      })),
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
      document: updateCanvasPage(state.document, (page) => ({
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
      })),
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
      document: updateCanvasPage(state.document, (page) => ({
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
      })),
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

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...clearPageCellsInRange(page, selectedRange),
        nodes: state.selectedNodeId ? removeNodeFromTree(page.nodes, state.selectedNodeId) : page.nodes,
      })),
      selectedNodeId: null,
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

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => ({
        ...mergePageCellValuesInRange(page, normalizedSelection),
        nodes: mergeCellFieldNodesForRange(page.nodes, normalizedSelection),
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
        nodes: collapseSplitCellFieldNodesToFirstCells(page.nodes, removedMergedRanges),
        mergedCells: nextMergedCells,
      })),
      selectedRange: normalizedSelection,
      selectedCell: { row: normalizedSelection.t, col: normalizedSelection.l },
      selectedNodeId: null,
    });
  }),
  updateSelectedCellStyle: (patch) => set((state) => {
    const selectedRange = state.selectedRange ?? (state.selectedCell
      ? createSingleCellRange(state.selectedCell.row, state.selectedCell.col)
      : null);
    if (!state.document || !selectedRange) {
      return { document: state.document };
    }

    return pushDocumentHistory(state, {
      document: updateCanvasPage(state.document, (page) => updatePageCellStyleInRange(page, selectedRange, patch)),
    });
  }),
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
