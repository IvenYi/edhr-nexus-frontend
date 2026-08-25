import type { DragEvent as ReactDragEvent, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState } from 'react';
import { flushSync } from 'react-dom';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import AppDialog from '@/components/AppDialog';
import CanvasDropZone from './CanvasDropZone';
import CanvasNodeRenderer from './CanvasNodeRenderer';
import type { CanvasCellBorder, CanvasNode, CanvasPage, CanvasSelectedCell, CanvasSelectionRange, CanvasSheetCell, CanvasWordDocument, CanvasWordTableBlock, FieldType, ModelField } from '../../types';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import { fieldRegistry } from '../../registry/fieldRegistry';
import { buildSubTableGroupRepeatRanges, buildSubTableRepeatedGroupSheetLayout } from '../../utils/subTableRegion';
import { createCommonWordTableBlock, type CommonCanvasComponentId } from '../../registry/commonComponentRegistry';
import {
  deleteWordTableColumns,
  deleteWordTableRows,
  insertWordTableColumns,
  insertWordTableRows,
  isMergeableWordTableRange,
  mergeWordTableCells,
  splitWordTableCell,
  type WordTableRange,
} from '../../utils/wordTableOperations';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useWordTableCellStyle } from './WordTableCellStyleContext';

const columnLabels = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const scrollbarWidth = 18;
const MM_TO_PX = 96 / 25.4;
const A4_PAPER_WIDTH_MM = 210;
const A4_PAPER_HEIGHT_MM = 297;
const PAGE_BREAK_MARKER_Z_INDEX = 20;
const SUB_TABLE_OVERLAY_Z_INDEX = 24;
const PAPER_RULER_Z_INDEX = 220;
const SUB_TABLE_GROUP_REPEAT_INSET = 5;
const DEFAULT_SHEET_FONT_SIZE = 14;
const DEFAULT_SHEET_LINE_HEIGHT = 1.35;
const AUTO_FIT_EXTRA_WIDTH = 18;
const AUTO_FIT_EXTRA_HEIGHT = 4;
const SHEET_ROW_RENDER_OVERSCAN_PX = 1440;
const SPECIAL_WRAP_CELL_VALUE_PATTERN = /[□☐☑☒■▪●○◆◇★☆※√×]/;
const FIELD_POINTER_DROP_EVENT = 'template-designer-field-pointer-drop';
const FIELD_POINTER_HOVER_EVENT = 'template-designer-field-pointer-hover';
const COMMON_COMPONENT_MIME = 'application/x-template-designer-common-component';
const COMMON_COMPONENT_INSERT_EVENT = 'template-designer-common-component-insert';
const WORD_TABLE_DRAG_THRESHOLD = 3;
const WORD_TABLE_MIN_COLUMN_WIDTH = 32;
const WORD_TABLE_MIN_ROW_HEIGHT = 20;

interface WordTableLayoutPreview {
  blockId: string;
  left: number;
  top: number;
}

interface WordTableSizePreview {
  blockId: string;
  columnWidths: number[];
  rowHeights: number[];
}

interface WordTableCellRange {
  blockId: string;
  anchor: { row: number; col: number };
  focus: { row: number; col: number };
}

interface WordTableContextMenu {
  blockId: string;
  cellId: string;
  table: CanvasWordTableBlock;
  cell: CanvasWordTableBlock['cells'][number];
  mouseX: number;
  mouseY: number;
}

function getWordTableRangeBounds(range: WordTableCellRange): WordTableRange {
  return {
    top: Math.min(range.anchor.row, range.focus.row),
    left: Math.min(range.anchor.col, range.focus.col),
    bottom: Math.max(range.anchor.row, range.focus.row),
    right: Math.max(range.anchor.col, range.focus.col),
  };
}

function isWordTableCellInRange(cell: CanvasWordTableBlock['cells'][number], range: WordTableCellRange | null) {
  if (!range) return false;
  const firstRow = Math.min(range.anchor.row, range.focus.row);
  const lastRow = Math.max(range.anchor.row, range.focus.row);
  const firstColumn = Math.min(range.anchor.col, range.focus.col);
  const lastColumn = Math.max(range.anchor.col, range.focus.col);
  const cellLastRow = cell.row + cell.rowSpan - 1;
  const cellLastColumn = cell.col + cell.colSpan - 1;
  return cell.row <= lastRow
    && cellLastRow >= firstRow
    && cell.col <= lastColumn
    && cellLastColumn >= firstColumn;
}

const quickAddFieldTypeOptions = fieldRegistry.filter((field) => field.type !== 'subTable');

function normalizeQuickAddSubTableFields(columns: unknown): ModelField[] {
  if (typeof columns === 'string') {
    return columns
      .split(/[\n,，]/)
      .map<ModelField | null>((name, index) => {
        const trimmedName = name.trim();
        if (!trimmedName) return null;
        return {
          id: `sub-field-${index + 1}`,
          code: `sub_field_${index + 1}`,
          name: trimmedName,
          type: 'text',
          sortOrder: index + 1,
          status: 'enabled',
          description: '',
          typeConfig: {},
        };
      })
      .filter((field): field is ModelField => Boolean(field));
  }
  if (!Array.isArray(columns)) return [];
  return columns
    .map<ModelField | null>((column, index) => {
      if (!column || typeof column !== 'object') return null;
      const source = column as Partial<ModelField>;
      const name = typeof source.name === 'string' ? source.name.trim() : '';
      if (!name) return null;
      const fieldType: FieldType = source.type && source.type !== 'subTable' ? source.type : 'text';
      return {
        id: typeof source.id === 'string' && source.id ? source.id : `sub-field-${index + 1}`,
        code: typeof source.code === 'string' && source.code ? source.code : `sub_field_${index + 1}`,
        name,
        type: fieldType,
        sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : index + 1,
        status: source.status === 'disabled' ? 'disabled' : 'enabled',
        description: typeof source.description === 'string' ? source.description : '',
        typeConfig: typeof source.typeConfig === 'object' && source.typeConfig ? source.typeConfig : {},
      };
    })
    .filter((field): field is ModelField => Boolean(field))
    .filter((field) => field.type !== 'subTable');
}

function resolveQuickAddUniqueFieldName(usedNames: Set<string>, preferredName: string) {
  const baseName = preferredName.trim();
  if (!usedNames.has(baseName)) {
    usedNames.add(baseName);
    return baseName;
  }

  let index = 1;
  while (usedNames.has(`${baseName}_${index}`)) {
    index += 1;
  }
  const uniqueName = `${baseName}_${index}`;
  usedNames.add(uniqueName);
  return uniqueName;
}

type DragState =
  | { type: 'cell'; startRow: number; startCol: number; startRange: CanvasSelectionRange }
  | { type: 'column'; startCol: number }
  | { type: 'row'; startRow: number }
  | { type: 'resize-column'; startCol: number; startWidth: number; startX: number }
  | { type: 'resize-row'; startRow: number; startHeight: number; startY: number }
  | null;

type CellDragState = Extract<NonNullable<DragState>, { type: 'cell' }>;
type SheetResizeDragUpdate =
  | { type: 'column'; col: number; width: number }
  | { type: 'row'; row: number; height: number };
type ResizeRowDragPreview = { row: number; height: number; top: number } | null;

type MenuAxis = 'column' | 'row' | 'cell';
type InsertMenuAction =
  | 'insert-before'
  | 'insert-after'
  | 'insert-column-before'
  | 'insert-column-after'
  | 'insert-row-before'
  | 'insert-row-after';
type SheetMenuAction =
  | InsertMenuAction
  | 'delete'
  | 'delete-column'
  | 'delete-row'
  | 'resize'
  | 'auto-size'
  | 'merge-cells'
  | 'split-cells'
  | 'quick-add-fields';

interface SheetMenuState {
  axis: MenuAxis;
  mouseX: number;
  mouseY: number;
}

interface DeleteMenuItemConfig {
  action: SheetMenuAction;
  label: string;
  disabled?: boolean;
}

type CanvasSettingsPanel = 'paper-mode' | 'paper-orientation' | 'paper-spacing';
type CanvasCellBorderEdge = 'top' | 'right' | 'bottom' | 'left';

interface CanvasSettingsPopoverState {
  key: CanvasSettingsPanel;
  left: number;
  width: number;
  center: number;
}

interface EditingCellState {
  row: number;
  col: number;
  draft: string;
}

interface FieldPointerDropDetail {
  fieldId: string;
  subTableId?: string;
  subTableField?: ModelField;
  row: number;
  col: number;
}

interface SubTableFieldDragData {
  subTableId: string;
  field: ModelField;
}

type QuickAddFieldTarget = 'main' | 'subTable';

interface QuickAddFieldDraft {
  id: string;
  row: number;
  col: number;
  sourceName: string;
  name: string;
  type: FieldType;
  description: string;
}

interface FieldPointerHoverDetail {
  row: number;
  col: number;
}

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function getColumnLabel(col: number) {
  let value = col;
  let label = '';

  while (value > 0) {
    const index = (value - 1) % columnLabels.length;
    label = `${columnLabels[index]}${label}`;
    value = Math.floor((value - 1) / columnLabels.length);
  }

  return label;
}

function normalizeRange(range: CanvasSelectionRange): CanvasSelectionRange {
  return {
    t: Math.min(range.t, range.b),
    l: Math.min(range.l, range.r),
    b: Math.max(range.t, range.b),
    r: Math.max(range.l, range.r),
  };
}

function createSingleCellRange(row: number, col: number): CanvasSelectionRange {
  return { t: row, l: col, b: row, r: col };
}

function isInRange(range: CanvasSelectionRange | null, row: number, col: number) {
  if (!range) return false;
  return row >= range.t && row <= range.b && col >= range.l && col <= range.r;
}

function isMultiCellRange(range: CanvasSelectionRange | null) {
  return Boolean(range && (range.t !== range.b || range.l !== range.r));
}

function rangesEqual(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  return first.t === second.t && first.l === second.l && first.b === second.b && first.r === second.r;
}

function rangeKey(range: CanvasSelectionRange) {
  const normalized = normalizeRange(range);
  return `${normalized.t}:${normalized.l}:${normalized.b}:${normalized.r}`;
}

function rangesIntersect(first: CanvasSelectionRange, second: CanvasSelectionRange) {
  return first.l <= second.r
    && first.r >= second.l
    && first.t <= second.b
    && first.b >= second.t;
}

function rangeContainsRange(outer: CanvasSelectionRange, inner: CanvasSelectionRange) {
  return outer.t <= inner.t && outer.l <= inner.l && outer.b >= inner.b && outer.r >= inner.r;
}

function rangesFormContinuousRectangle(ranges: CanvasSelectionRange[]) {
  if (ranges.length <= 1) return true;

  const normalizedRanges = ranges.map(normalizeRange);
  const boundary = normalizedRanges.reduce<CanvasSelectionRange>(
    (current, range) => ({
      t: Math.min(current.t, range.t),
      l: Math.min(current.l, range.l),
      b: Math.max(current.b, range.b),
      r: Math.max(current.r, range.r),
    }),
    normalizedRanges[0],
  );
  const selectedCellCount = normalizedRanges.reduce((total, range) => (
    total + (range.b - range.t + 1) * (range.r - range.l + 1)
  ), 0);
  const rectangleCellCount = (boundary.b - boundary.t + 1) * (boundary.r - boundary.l + 1);

  return selectedCellCount === rectangleCellCount;
}

function readNodeCellRange(node: { style?: Record<string, unknown> }): CanvasSelectionRange | null {
  const value = node.style?.cellRange;
  if (!value || typeof value !== 'object') return null;

  const range = value as Partial<CanvasSelectionRange>;
  const { t, l, b, r } = range;
  if (typeof t !== 'number' || typeof l !== 'number' || typeof b !== 'number' || typeof r !== 'number') {
    return null;
  }
  return normalizeRange({ t, l, b, r });
}

function findSubTableNodeRange(page: CanvasPage, subTableId: string): CanvasSelectionRange | null {
  const visit = (nodes: CanvasPage['nodes']): CanvasSelectionRange | null => {
    for (const node of nodes) {
      if (node.type === 'sub-table' && node.bindings?.fieldId === subTableId) {
        return readNodeCellRange(node);
      }
      if (node.children?.length) {
        const nested = visit(node.children);
        if (nested) return nested;
      }
    }
    return null;
  };

  return visit(page.nodes);
}

function findSubTableNode(page: CanvasPage, subTableId: string): CanvasNode | null {
  const visit = (nodes: CanvasPage['nodes']): CanvasNode | null => {
    for (const node of nodes) {
      if (node.type === 'sub-table' && node.bindings?.fieldId === subTableId) {
        return node;
      }
      if (node.children?.length) {
        const nested = visit(node.children);
        if (nested) return nested;
      }
    }
    return null;
  };

  return visit(page.nodes);
}

function resolveSubTableFieldDropMessage(page: CanvasPage, subTableId: string, targetRange: CanvasSelectionRange) {
  const subTableNode = findSubTableNode(page, subTableId);
  const region = subTableNode?.bindings?.subTableRegion;
  if (!region || region.repeat.type !== 'fixed') return null;

  const subTableRange = readNodeCellRange(subTableNode) ?? region.ranges[0]?.range ?? null;
  const normalizedSelection = normalizeRange(targetRange);
  if (!subTableRange || !rangeContainsRange(normalizeRange(subTableRange), normalizedSelection)) return null;

  const groupRange = region.recordTemplate.groupRange
    ? normalizeRange(region.recordTemplate.groupRange)
    : null;
  if (!groupRange) return '请先框选范围右键创建分组';
  if (!rangeContainsRange(groupRange, normalizedSelection)) return '字段只能拖入分组中';

  return null;
}

function getSubTableNodes(nodes: CanvasNode[]): CanvasNode[] {
  return nodes.flatMap((node) => {
    const nestedNodes = node.children?.length ? getSubTableNodes(node.children) : [];
    return node.type === 'sub-table' && node.bindings?.subTableRegion
      ? [node, ...nestedNodes]
      : nestedNodes;
  });
}

function parseSubTableFieldDragData(rawValue: string): SubTableFieldDragData | null {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue) as Partial<SubTableFieldDragData>;
    if (!parsed.subTableId || !parsed.field?.id) return null;
    return parsed as SubTableFieldDragData;
  } catch {
    return null;
  }
}

function buildOffsets(sizes: number[]) {
  const offsets = [0];
  sizes.forEach((size) => {
    offsets.push(offsets[offsets.length - 1] + size);
  });
  return offsets;
}

function buildTemplate(sizes: number[]) {
  return sizes.map((size) => `${size}px`).join(' ');
}

function buildRulerUnits(length: number, unit: number) {
  return Array.from({ length: Math.max(1, Math.ceil(length / unit)) }, (_, index) => index + 1);
}

function buildRulerTicks(length: number, step: number) {
  return Array.from({ length: Math.floor(length / step) + 1 }, (_, index) => Math.min(length, index * step));
}

function findFirstRowEndingAfter(rowOffsets: number[], offset: number) {
  let low = 1;
  let high = Math.max(1, rowOffsets.length - 1);
  let result = high;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if ((rowOffsets[middle] ?? 0) >= offset) {
      result = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return result;
}

function findLastRowStartingBefore(rowOffsets: number[], offset: number) {
  let low = 1;
  let high = Math.max(1, rowOffsets.length - 1);
  let result = 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if ((rowOffsets[middle - 1] ?? 0) <= offset) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return result;
}

function findIndexByOffset(offsets: number[], offset: number) {
  const count = offsets.length - 1;
  if (count <= 0 || offset < 0 || offset > (offsets[count] ?? 0)) {
    return null;
  }

  let low = 1;
  let high = count;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const start = offsets[middle - 1] ?? 0;
    const end = offsets[middle] ?? 0;

    if (offset >= start && offset < end) return middle;
    if (offset < start) {
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return offset === offsets[count] ? count : null;
}

function resolveVisibleRowRange(rowOffsets: number[], scrollTop: number, viewportHeight: number, contentOffsetTop: number) {
  const rowCount = Math.max(1, rowOffsets.length - 1);
  if (rowCount <= 80 || viewportHeight <= 0) {
    return { start: 1, end: rowCount };
  }

  const visibleTop = Math.max(0, scrollTop - contentOffsetTop - SHEET_ROW_RENDER_OVERSCAN_PX);
  const visibleBottom = visibleTop + viewportHeight + SHEET_ROW_RENDER_OVERSCAN_PX * 2;

  return {
    start: Math.max(1, findFirstRowEndingAfter(rowOffsets, visibleTop)),
    end: Math.min(rowCount, findLastRowStartingBefore(rowOffsets, visibleBottom)),
  };
}

function getRulerTickLevel(index: number) {
  if (index % 4 === 0) return 'major';
  if (index % 2 === 0) return 'mid';
  return 'minor';
}

function fitColumnWidths(widths: number[], maxWidth: number) {
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= maxWidth) {
    return widths;
  }

  let remainingWidth = maxWidth;

  return widths.map((width, index) => {
    if (index === widths.length - 1) {
      return Math.max(16, remainingWidth);
    }

    const scaledWidth = Math.max(16, Math.round((width / totalWidth) * maxWidth));
    remainingWidth -= scaledWidth;
    return scaledWidth;
  });
}

function redistributeWordTableColumnWidths(columnWidths: number[], boundaryIndex: number, delta: number) {
  const leftIndex = boundaryIndex - 1;
  if (leftIndex < 0 || boundaryIndex >= columnWidths.length) return [...columnWidths];

  const nextWidths = [...columnWidths];
  const minimumDelta = WORD_TABLE_MIN_COLUMN_WIDTH - nextWidths[leftIndex];
  const maximumDelta = nextWidths
    .slice(boundaryIndex)
    .reduce((sum, width) => sum + Math.max(0, width - WORD_TABLE_MIN_COLUMN_WIDTH), 0);
  const boundedDelta = Math.max(minimumDelta, Math.min(Math.round(delta), maximumDelta));

  if (boundedDelta === 0) return nextWidths;

  nextWidths[leftIndex] += boundedDelta;

  if (boundedDelta < 0) {
    nextWidths[boundaryIndex] -= boundedDelta;
    return nextWidths;
  }

  let remainingDelta = boundedDelta;
  for (let index = boundaryIndex; index < nextWidths.length && remainingDelta > 0; index += 1) {
    const availableWidth = Math.max(0, nextWidths[index] - WORD_TABLE_MIN_COLUMN_WIDTH);
    const consumedWidth = Math.min(availableWidth, remainingDelta);
    nextWidths[index] -= consumedWidth;
    remainingDelta -= consumedWidth;
  }

  return nextWidths;
}

function buildSingleCellRange(cell: CanvasSelectedCell | null): CanvasSelectionRange | null {
  if (!cell) return null;
  return { t: cell.row, l: cell.col, b: cell.row, r: cell.col };
}

function getMergedAwareCellRange(row: number, col: number, mergedRange?: CanvasSelectionRange): CanvasSelectionRange {
  return mergedRange ?? { t: row, l: col, b: row, r: col };
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

function findMergedRangeContaining(page: CanvasPage, row: number, col: number) {
  return page.mergedCells.find((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function getRenderedAdjacentCellBorder(page: CanvasPage, row: number, col: number, edge: 'top' | 'left'): CanvasCellBorder | undefined {
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

function shouldRenderCellBorderEdge(page: CanvasPage, range: CanvasSelectionRange, edge: CanvasCellBorderEdge) {
  const cellBorder = page.cells[getCellKey(range.t, range.l)]?.border;
  if (edge === 'right') return Boolean(cellBorder?.right && !isAdjacentCellBorderCovered(page, range, 'right'));
  if (edge === 'bottom') return Boolean(cellBorder?.bottom && !isAdjacentCellBorderCovered(page, range, 'bottom'));
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

function parsePromptNumber(title: string, defaultValue: number) {
  const value = window.prompt(title, String(defaultValue));
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function normalizeInsertMenuCountInput(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, '');
  if (!digitsOnly) return '';
  const withoutLeadingZeros = digitsOnly.replace(/^0+/, '');
  return withoutLeadingZeros || '1';
}

function parseInsertMenuCount(value: string) {
  const parsed = Number(normalizeInsertMenuCountInput(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function sumSizes(sizes: number[], start: number, end: number) {
  return sizes.slice(start - 1, end).reduce((sum, size) => sum + size, 0);
}

function estimateSheetTextPixelWidth(text: string, fontSize = DEFAULT_SHEET_FONT_SIZE) {
  return text
    .split(/\r?\n/)
    .reduce((maxWidth, line) => {
      const lineWidth = Array.from(line).reduce((total, char) => {
        if (/\s/.test(char)) return total + fontSize * 0.33;
        return total + (((char.codePointAt(0) ?? 0) > 0xff) ? fontSize : fontSize * 0.56);
      }, 0);
      return Math.max(maxWidth, lineWidth);
    }, 0);
}

function resolveCellLineHeightPx(cell: CanvasSheetCell | undefined, fontSize: number) {
  const rawLineHeight = cell?.style?.lineHeight;
  if (typeof rawLineHeight === 'number' && Number.isFinite(rawLineHeight)) {
    return rawLineHeight <= 4 ? fontSize * rawLineHeight : rawLineHeight;
  }
  if (typeof rawLineHeight === 'string') {
    const parsed = Number.parseFloat(rawLineHeight);
    if (Number.isFinite(parsed)) {
      return rawLineHeight.includes('px') || parsed > 4 ? parsed : fontSize * parsed;
    }
  }
  return fontSize * DEFAULT_SHEET_LINE_HEIGHT;
}

function getCellHorizontalPadding(cell: CanvasSheetCell | undefined) {
  const paddingLeft = resolveNumericStyle(cell?.style?.paddingLeft, 8);
  const paddingRight = resolveNumericStyle(cell?.style?.paddingRight, paddingLeft);
  return paddingLeft + paddingRight;
}

function getCellVerticalPadding(cell: CanvasSheetCell | undefined) {
  const paddingTop = resolveNumericStyle(cell?.style?.paddingTop, 4);
  const paddingBottom = resolveNumericStyle(cell?.style?.paddingBottom, paddingTop);
  return paddingTop + paddingBottom;
}

function hasVisibleSheetCell(cell?: CanvasSheetCell) {
  return Boolean(
    String(cell?.value ?? '').trim()
    || cell?.style?.backgroundColor
    || cell?.border?.top
    || cell?.border?.right
    || cell?.border?.bottom
    || cell?.border?.left
  );
}

function findMergedRangeForCell(page: CanvasPage, row: number, col: number) {
  return page.mergedCells.find((range) => (
    row >= range.t && row <= range.b && col >= range.l && col <= range.r
  ));
}

function getSheetContentBottom(page: CanvasPage, rowOffsets: number[]) {
  let bottom = 0;
  const importedGridTop = page.sheet.canvasMode === 'paper' ? Number(page.sheet.importedGridTop ?? 0) || 0 : 0;

  Object.entries(page.cells).forEach(([cellKey, cell]) => {
    if (!hasVisibleSheetCell(cell)) return;

    const [rowText, colText] = cellKey.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    if (!Number.isFinite(row) || !Number.isFinite(col)) return;

    const range = findMergedRangeForCell(page, row, col) ?? { t: row, l: col, b: row, r: col };
    const rowOffsetIndex = Math.min(range.b, rowOffsets.length - 1);
    bottom = Math.max(bottom, importedGridTop + (rowOffsets[rowOffsetIndex] ?? bottom));
  });

  page.images.forEach((image) => {
    bottom = Math.max(bottom, importedGridTop + image.layout.top + image.layout.height);
  });

  bottom = Math.max(bottom, getCanvasNodeContentBottom(page.nodes, rowOffsets));
  bottom = Math.max(bottom, getCanvasWordDocumentBottom(page.wordDocument));

  return bottom;
}

function getCanvasWordDocumentBottom(wordDocument?: CanvasWordDocument) {
  if (!wordDocument) return 0;
  return Math.max(
    wordDocument.contentHeight,
    ...wordDocument.blocks.map((block) => block.layout.top + block.layout.height),
  );
}

function getCanvasNodeContentBottom(nodes: CanvasPage['nodes'], rowOffsets: number[]): number {
  return nodes.reduce((bottom, node) => {
    const nodeRange = readNodeCellRange(node);
    const rangeBottom = nodeRange ? rowOffsets[Math.min(nodeRange.b, rowOffsets.length - 1)] ?? 0 : 0;
    const absoluteBottom = node.style.position === 'absolute'
      ? Number(node.style.compTop ?? 0) + Number(node.style.compHeight ?? 0)
      : 0;
    const childBottom = node.children?.length ? getCanvasNodeContentBottom(node.children, rowOffsets) : 0;
    return Math.max(bottom, rangeBottom, absoluteBottom, childBottom);
  }, 0);
}

function getAutoFitCell(page: CanvasPage, row: number, col: number) {
  const mergedRange = findMergedRangeForCell(page, row, col);
  const range = mergedRange ?? { t: row, l: col, b: row, r: col };
  const cell = page.cells[getCellKey(range.t, range.l)];
  return { cell, range };
}

function estimateSheetTextLineCount(text: string, width: number, fontSize: number, shouldWrap: boolean) {
  return text.split(/\r?\n/).reduce((lineCount, line) => {
    if (!shouldWrap) return lineCount + 1;
    const lineWidth = Math.max(1, estimateSheetTextPixelWidth(line, fontSize));
    return lineCount + Math.max(1, Math.ceil(lineWidth / Math.max(1, width)));
  }, 0);
}

function autoFitSheetColumnWidth(page: CanvasPage, col: number) {
  let nextWidth = 36;
  let hasText = false;

  for (let row = 1; row <= page.sheet.rowCount; row += 1) {
    const { cell, range } = getAutoFitCell(page, row, col);
    const text = String(cell?.value ?? '');
    if (!text.trim()) continue;

    hasText = true;
    const fontSize = resolveNumericStyle(cell?.style?.fontSize, DEFAULT_SHEET_FONT_SIZE);
    const spanCols = Math.max(1, range.r - range.l + 1);
    const textWidth = estimateSheetTextPixelWidth(text, fontSize);
    nextWidth = Math.max(nextWidth, Math.ceil((textWidth + getCellHorizontalPadding(cell) + AUTO_FIT_EXTRA_WIDTH) / spanCols));
  }

  return hasText ? nextWidth : page.sheet.defaultColumnWidth;
}

function autoFitSheetRowHeight(page: CanvasPage, row: number, columnWidths: number[]) {
  let nextHeight = 24;
  let hasText = false;

  for (let col = 1; col <= page.sheet.columnCount; col += 1) {
    const { cell, range } = getAutoFitCell(page, row, col);
    const text = String(cell?.value ?? '');
    if (!text.trim()) continue;

    hasText = true;
    const fontSize = resolveNumericStyle(cell?.style?.fontSize, DEFAULT_SHEET_FONT_SIZE);
    const lineHeightPx = resolveCellLineHeightPx(cell, fontSize);
    const contentWidth = sumSizes(columnWidths, range.l, range.r) - getCellHorizontalPadding(cell);
    const shouldWrap = cell?.style?.whiteSpace === 'normal' || hasPlainOverflowCellValue(text, contentWidth, fontSize);
    const lineCount = estimateSheetTextLineCount(text, contentWidth, fontSize, shouldWrap);
    const spanRows = Math.max(1, range.b - range.t + 1);
    nextHeight = Math.max(
      nextHeight,
      Math.ceil((lineCount * lineHeightPx + getCellVerticalPadding(cell) + AUTO_FIT_EXTRA_HEIGHT) / spanRows),
    );
  }

  return hasText ? nextHeight : page.sheet.defaultRowHeight;
}

function measureSheetRowHeightFromDom(page: CanvasPage, row: number, root: HTMLElement | null) {
  let nextHeight = 24;
  let hasText = false;

  for (let col = 1; col <= page.sheet.columnCount; col += 1) {
    const { cell, range } = getAutoFitCell(page, row, col);
    const text = String(cell?.value ?? '');
    if (!text.trim()) continue;

    const contentElement = root?.querySelector<HTMLElement>(
      `[data-sheet-cell-row="${range.t}"][data-sheet-cell-col="${range.l}"] [data-sheet-cell-content="true"]`,
    );
    const measuredContentHeight = contentElement
      ? Math.max(contentElement.getBoundingClientRect().height, contentElement.scrollHeight)
      : 0;
    if (measuredContentHeight <= 0) continue;

    hasText = true;
    const spanRows = Math.max(1, range.b - range.t + 1);
    nextHeight = Math.max(
      nextHeight,
      Math.ceil((measuredContentHeight + getCellVerticalPadding(cell) + AUTO_FIT_EXTRA_HEIGHT) / spanRows),
    );
  }

  return hasText ? nextHeight : null;
}

function clampMarginMm(value: number) {
  return Math.min(40, Math.max(0, Math.round(value)));
}

function parseMarginInput(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, '');
  if (!digitsOnly) {
    return 0;
  }
  return clampMarginMm(Number(digitsOnly));
}

function isPrintableCellInput(key: string) {
  return key.length === 1 && !/[\r\n\t]/.test(key);
}

function hasMultilineCellValue(value: unknown) {
  return typeof value === 'string' && /\r?\n/.test(value);
}

function hasSpecialWrapCellValue(value: unknown) {
  return typeof value === 'string' && SPECIAL_WRAP_CELL_VALUE_PATTERN.test(value);
}

function hasPlainOverflowCellValue(value: unknown, contentWidth: number, fontSize: number) {
  const text = String(value ?? '');
  if (!text.trim() || hasMultilineCellValue(text) || hasSpecialWrapCellValue(text)) {
    return false;
  }
  return estimateSheetTextPixelWidth(text, fontSize) > Math.max(1, contentWidth);
}

function resolveWordTextSx(style?: Record<string, unknown>) {
  return {
    color: String(style?.color ?? '#1f2937'),
    fontSize: resolveNumericStyle(style?.fontSize, DEFAULT_SHEET_FONT_SIZE),
    fontWeight: style?.fontWeight as string | number | undefined,
    fontStyle: style?.fontStyle as string | undefined,
    fontFamily: style?.fontFamily as string | undefined,
    lineHeight: style?.lineHeight as string | number | undefined,
    textAlign: (style?.textAlign as string | undefined) ?? 'left',
    textDecoration: style?.textDecoration as string | undefined,
    whiteSpace: style?.whiteSpace === 'nowrap' ? 'nowrap' : 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };
}

function serializeContentEditableLineBreaks(root: HTMLElement) {
  const chunks: string[] = [];
  const appendLineBreak = () => {
    if (chunks[chunks.length - 1] !== '\n') {
      chunks.push('\n');
    }
  };
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      chunks.push(node.textContent ?? '');
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === 'BR') {
      appendLineBreak();
      return;
    }

    const isBlock = node !== root && ['DIV', 'P', 'LI'].includes(node.tagName);
    if (isBlock && chunks.length > 0) appendLineBreak();
    node.childNodes.forEach(visit);
    if (isBlock && node.nextSibling) appendLineBreak();
  };

  root.childNodes.forEach(visit);
  return chunks.join('');
}

function isPointerOnWordTableText(target: EventTarget | null, clientX: number, clientY: number) {
  const element = target instanceof Element ? target : null;
  const editable = element?.closest<HTMLElement>('[data-word-table-cell-content="true"]');
  if (!editable) return false;

  const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();
  while (textNode) {
    if (textNode.textContent?.trim()) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const isWithinTextBounds = Array.from(range.getClientRects()).some((rect) => (
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
      ));
      range.detach?.();
      if (isWithinTextBounds) return true;
    }
    textNode = walker.nextNode();
  }

  return false;
}

function insertContentEditableLineBreak(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;

  range.deleteContents();
  const lineBreak = document.createElement('br');
  range.insertNode(lineBreak);
  range.setStartAfter(lineBreak);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function resolveWordTableBorder(
  edge: keyof CanvasCellBorder,
  border: CanvasCellBorder | undefined,
  usesLegacyWordTableBorders: boolean,
) {
  const color = String(border?.color ?? '#111827');
  return !usesLegacyWordTableBorders && border?.[edge] === false ? 'none' : `1px solid ${color}`;
}

function shouldRenderWordTableOuterBorder(
  edge: 'right' | 'bottom',
  cell: CanvasWordTableBlock['cells'][number],
  usesLegacyWordTableBorders: boolean,
) {
  return usesLegacyWordTableBorders || cell.border?.[edge] !== false;
}

function getWordTableSpanSize(sizes: number[], start: number, span: number) {
  return sizes.slice(start - 1, start - 1 + span).reduce((sum, size) => sum + size, 0);
}

function isWordTableIntervalCovered(intervals: Array<[number, number]>, start: number, end: number) {
  let cursor = start;
  intervals
    .sort((first, second) => first[0] - second[0])
    .forEach(([intervalStart, intervalEnd]) => {
      if (intervalEnd < cursor || intervalStart > cursor) return;
      cursor = Math.max(cursor, intervalEnd + 1);
    });
  return cursor > end;
}

function isWordTableCellEdgeCovered(
  table: CanvasWordTableBlock,
  cell: CanvasWordTableBlock['cells'][number],
  edge: 'right' | 'bottom',
  usesLegacyWordTableBorders: boolean,
) {
  const rowEnd = cell.row + cell.rowSpan - 1;
  const colEnd = cell.col + cell.colSpan - 1;
  if (edge === 'right') {
    const adjacentColumn = colEnd + 1;
    return isWordTableIntervalCovered(
      table.cells
        .filter((candidate) => (
          candidate.col === adjacentColumn
          && (usesLegacyWordTableBorders || candidate.border?.left !== false)
          && candidate.row <= rowEnd
          && candidate.row + candidate.rowSpan - 1 >= cell.row
        ))
        .map((candidate) => [candidate.row, candidate.row + candidate.rowSpan - 1]),
      cell.row,
      rowEnd,
    );
  }

  const adjacentRow = rowEnd + 1;
  return isWordTableIntervalCovered(
    table.cells
      .filter((candidate) => (
        candidate.row === adjacentRow
        && (usesLegacyWordTableBorders || candidate.border?.top !== false)
        && candidate.col <= colEnd
        && candidate.col + candidate.colSpan - 1 >= cell.col
      ))
      .map((candidate) => [candidate.col, candidate.col + candidate.colSpan - 1]),
    cell.col,
    colEnd,
  );
}

function shouldRenderWordTableCellBorder(
  table: CanvasWordTableBlock,
  edge: keyof CanvasCellBorder,
  cell: CanvasWordTableBlock['cells'][number],
  usesLegacyWordTableBorders: boolean,
) {
  if (!usesLegacyWordTableBorders && cell.border?.[edge] === false) return false;
  if (edge === 'top' || edge === 'left') return true;
  if (edge === 'right') {
    if (cell.col + cell.colSpan - 1 >= table.columnWidths.length) return false;
    return !isWordTableCellEdgeCovered(table, cell, edge, usesLegacyWordTableBorders);
  }
  if (edge === 'bottom') {
    if (cell.row + cell.rowSpan - 1 >= table.rowHeights.length) return false;
    return !isWordTableCellEdgeCovered(table, cell, edge, usesLegacyWordTableBorders);
  }
  return false;
}

function mergeWordTableBoundarySegments(segments: Array<[number, number]>) {
  return [...segments]
    .sort((first, second) => first[0] - second[0])
    .reduce<Array<[number, number]>>((merged, [start, end]) => {
      const previous = merged[merged.length - 1];
      if (!previous || start > previous[1] + 1) {
        merged.push([start, end]);
        return merged;
      }
      previous[1] = Math.max(previous[1], end);
      return merged;
    }, []);
}

function getWordTableColumnResizeSegments(
  table: CanvasWordTableBlock,
  boundaryIndex: number,
  usesLegacyWordTableBorders: boolean,
) {
  return mergeWordTableBoundarySegments(
    table.cells.flatMap((cell) => {
      const hasVisibleBoundary = (
        (cell.col + cell.colSpan - 1 === boundaryIndex
          && shouldRenderWordTableCellBorder(table, 'right', cell, usesLegacyWordTableBorders))
        || (cell.col === boundaryIndex + 1
          && shouldRenderWordTableCellBorder(table, 'left', cell, usesLegacyWordTableBorders))
      );
      return hasVisibleBoundary
        ? [[cell.row, cell.row + cell.rowSpan - 1] as [number, number]]
        : [];
    }),
  );
}

function getWordTableRowResizeSegments(
  table: CanvasWordTableBlock,
  boundaryIndex: number,
  usesLegacyWordTableBorders: boolean,
) {
  return mergeWordTableBoundarySegments(
    table.cells.flatMap((cell) => {
      const hasVisibleBoundary = (
        (cell.row + cell.rowSpan - 1 === boundaryIndex
          && shouldRenderWordTableCellBorder(table, 'bottom', cell, usesLegacyWordTableBorders))
        || (cell.row === boundaryIndex + 1
          && shouldRenderWordTableCellBorder(table, 'top', cell, usesLegacyWordTableBorders))
      );
      return hasVisibleBoundary
        ? [[cell.col, cell.col + cell.colSpan - 1] as [number, number]]
        : [];
    }),
  );
}

function resolveWordTableCellBorder(
  table: CanvasWordTableBlock,
  edge: keyof CanvasCellBorder,
  cell: CanvasWordTableBlock['cells'][number],
  usesLegacyWordTableBorders: boolean,
) {
  return shouldRenderWordTableCellBorder(table, edge, cell, usesLegacyWordTableBorders)
    ? resolveWordTableBorder(edge, cell.border, usesLegacyWordTableBorders)
    : 'none';
}

function resolveWordTableCellDiagonalBackground(cell: CanvasWordTableBlock['cells'][number]) {
  const color = String(cell.border?.color ?? '#111827');
  const lines = [
    cell.diagonalTopLeftToBottomRight
      ? `linear-gradient(to bottom left, transparent calc(50% - 0.5px), ${color} 50%, transparent calc(50% + 0.5px))`
      : null,
    cell.diagonalTopRightToBottomLeft
      ? `linear-gradient(to bottom right, transparent calc(50% - 0.5px), ${color} 50%, transparent calc(50% + 0.5px))`
      : null,
  ].filter(Boolean);
  return lines.join(', ');
}

function fitWordTableColumnWidths(table: CanvasWordTableBlock) {
  return fitColumnWidths(table.columnWidths, table.layout.width);
}

export default function CanvasSheetWorkspace() {
  const { showMessage } = useSnackbar();
  const { setWordTableCellStyleTarget } = useWordTableCellStyle();
  const designerDocument = useTemplateDesignerStore((state) => state.document);
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedNodeId = useTemplateDesignerStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useTemplateDesignerStore((state) => state.setSelectedNodeId);
  const removeNode = useTemplateDesignerStore((state) => state.removeNode);
  const addFreeCanvasComponent = useTemplateDesignerStore((state) => state.addFreeCanvasComponent);
  const setActiveCanvasRail = useTemplateDesignerStore((state) => state.setActiveCanvasRail);
  const selectedCell = useTemplateDesignerStore((state) => state.selectedCell);
  const selectedRange = useTemplateDesignerStore((state) => state.selectedRange);
  const setSelectedRange = useTemplateDesignerStore((state) => state.setSelectedRange);
  const getFieldById = useTemplateDesignerStore((state) => state.getFieldById);
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const updateCurrentPageSheet = useTemplateDesignerStore((state) => state.updateCurrentPageSheet);
  const selectAllCells = useTemplateDesignerStore((state) => state.selectAllCells);
  const selectColumnRange = useTemplateDesignerStore((state) => state.selectColumnRange);
  const selectRowRange = useTemplateDesignerStore((state) => state.selectRowRange);
  const insertSheetColumns = useTemplateDesignerStore((state) => state.insertSheetColumns);
  const insertSheetRows = useTemplateDesignerStore((state) => state.insertSheetRows);
  const deleteSheetColumns = useTemplateDesignerStore((state) => state.deleteSheetColumns);
  const deleteSheetRows = useTemplateDesignerStore((state) => state.deleteSheetRows);
  const setSheetColumnWidth = useTemplateDesignerStore((state) => state.setSheetColumnWidth);
  const setSheetRowHeight = useTemplateDesignerStore((state) => state.setSheetRowHeight);
  const updateSheetCellValue = useTemplateDesignerStore((state) => state.updateSheetCellValue);
  const clearSelectedCells = useTemplateDesignerStore((state) => state.clearSelectedCells);
  const copySelectedCellsText = useTemplateDesignerStore((state) => state.copySelectedCellsText);
  const pasteCellsFromText = useTemplateDesignerStore((state) => state.pasteCellsFromText);
  const cutSelectedFieldNode = useTemplateDesignerStore((state) => state.cutSelectedFieldNode);
  const pasteFieldNodeToCell = useTemplateDesignerStore((state) => state.pasteFieldNodeToCell);
  const mergeSelectedCells = useTemplateDesignerStore((state) => state.mergeSelectedCells);
  const splitSelectedCells = useTemplateDesignerStore((state) => state.splitSelectedCells);
  const addFields = useTemplateDesignerStore((state) => state.addFields);
  const addSubTableFields = useTemplateDesignerStore((state) => state.addSubTableFields);
  const addNodeFromFieldToCell = useTemplateDesignerStore((state) => state.addNodeFromFieldToCell);
  const addNodeFromSubTableFieldToCell = useTemplateDesignerStore((state) => state.addNodeFromSubTableFieldToCell);
  const addNodeFromFieldToRange = useTemplateDesignerStore((state) => state.addNodeFromFieldToRange);
  const setSubTableRecordTemplateFromRange = useTemplateDesignerStore((state) => state.setSubTableRecordTemplateFromRange);
  const selectSubTableGroup = useTemplateDesignerStore((state) => state.selectSubTableGroup);
  const availableSubTableFields = useTemplateDesignerStore((state) => (
    state.getAvailableFieldsForCurrentVersion()
      .filter((field) => field.type === 'subTable')
      .sort((first, second) => first.sortOrder - second.sortOrder)
  ));
  const quickAddSubTableTargetFields = useTemplateDesignerStore((state) => (
    (state.document?.model.fields ?? [])
      .filter((field) => field.status === 'enabled' && field.type === 'subTable')
      .sort((first, second) => first.sortOrder - second.sortOrder)
  ));
  const setPagePreviewCount = useTemplateDesignerStore((state) => state.setPagePreviewCount);
  const setActivePagePreviewIndex = useTemplateDesignerStore((state) => state.setActivePagePreviewIndex);
  const activePagePreviewIndexes = useTemplateDesignerStore((state) => state.activePagePreviewIndexes);
  const pagePreviewScrollTarget = useTemplateDesignerStore((state) => state.pagePreviewScrollTarget);
  const clearPagePreviewScrollTarget = useTemplateDesignerStore((state) => state.clearPagePreviewScrollTarget);

  const [dragState, setDragState] = useState<DragState>(null);
  const [multiSelectedRanges, setMultiSelectedRanges] = useState<CanvasSelectionRange[]>([]);
  const [menuState, setMenuState] = useState<SheetMenuState | null>(null);
  const [paperSettingsOpen, setPaperSettingsOpen] = useState(false);
  const [settingsPopover, setSettingsPopover] = useState<CanvasSettingsPopoverState | null>(null);
  const [editingCell, setEditingCell] = useState<EditingCellState | null>(null);
  const [fieldDropGuideRange, setFieldDropGuideRange] = useState<CanvasSelectionRange | null>(null);
  const [hoveredSubTableNodeId, setHoveredSubTableNodeId] = useState<string | null>(null);
  const [insertMenuCount, setInsertMenuCount] = useState('1');
  const [subTableMenuAnchorEl, setSubTableMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [quickAddFieldDialogOpen, setQuickAddFieldDialogOpen] = useState(false);
  const [quickAddFieldTarget, setQuickAddFieldTarget] = useState<QuickAddFieldTarget>('main');
  const [quickAddFieldSubTableId, setQuickAddFieldSubTableId] = useState('');
  const [quickAddFieldDrafts, setQuickAddFieldDrafts] = useState<QuickAddFieldDraft[]>([]);
  const [workspaceViewport, setWorkspaceViewport] = useState({ scrollTop: 0, height: 0 });
  const [resizeRowDragPreview, setResizeRowDragPreview] = useState<ResizeRowDragPreview>(null);
  const [selectedWordTableBlockId, setSelectedWordTableBlockId] = useState<string | null>(null);
  const [wordTableCellRange, setWordTableCellRange] = useState<WordTableCellRange | null>(null);
  const [wordTableContextMenu, setWordTableContextMenu] = useState<WordTableContextMenu | null>(null);
  const [wordTableInsertCount, setWordTableInsertCount] = useState('1');

  useEffect(() => {
    if (!selectedWordTableBlockId || !wordTableCellRange || wordTableCellRange.blockId !== selectedWordTableBlockId) {
      setWordTableCellStyleTarget(null);
    }
  }, [selectedWordTableBlockId, setWordTableCellStyleTarget, wordTableCellRange]);
  const [wordTableLayoutPreview, setWordTableLayoutPreview] = useState<WordTableLayoutPreview | null>(null);
  const [wordTableSizePreview, setWordTableSizePreview] = useState<WordTableSizePreview | null>(null);
  const canvasSettingsRef = useRef<HTMLDivElement | null>(null);
  const freeCanvasBodyRef = useRef<HTMLDivElement | null>(null);
  const workspaceScrollRef = useRef<HTMLDivElement | null>(null);
  const workspaceScrollFrameRef = useRef<number | null>(null);
  const activePagePreviewIndexRef = useRef(0);
  const cellDragFrameRef = useRef<number | null>(null);
  const pendingCellDragRef = useRef<{ cellSelectionRange: CanvasSelectionRange; state: CellDragState } | null>(null);
  const sheetResizeDragFrameRef = useRef<number | null>(null);
  const pendingSheetResizeDragRef = useRef<SheetResizeDragUpdate | null>(null);
  const rowResizeDragFrameRef = useRef<number | null>(null);
  const pendingRowResizeDragRef = useRef<{ row: number; height: number } | null>(null);
  const wordTablePointerCleanupRef = useRef<(() => void) | null>(null);
  const wordTableCellSelectionCleanupRef = useRef<(() => void) | null>(null);
  const wordTableLayoutPreviewRef = useRef<WordTableLayoutPreview | null>(null);
  const wordTableSizePreviewRef = useRef<WordTableSizePreview | null>(null);
  const wordTableContextMenuRef = useRef<HTMLDivElement | null>(null);
  const hoveredSubTableFrameRef = useRef<number | null>(null);
  const pendingHoveredSubTableRangeRef = useRef<CanvasSelectionRange | null>(null);
  const sheetInteractionRef = useRef<HTMLDivElement | null>(null);
  const fieldNodeClipboardRef = useRef<CanvasNode | null>(null);
  const skipNextBlurCommitRef = useRef(false);
  const [freeCanvasMeasuredHeight, setFreeCanvasMeasuredHeight] = useState(480);
  const quickAddMainTargetName = designerDocument?.meta.templateName?.trim() || '当前模板';
  const quickAddMainTargetLabel = `主表-${quickAddMainTargetName}`;
  const quickAddTargetValue = quickAddFieldTarget === 'subTable' ? `subTable:${quickAddFieldSubTableId}` : 'main';
  const quickAddTargetOptions = [
    { value: 'main', label: quickAddMainTargetLabel },
    ...quickAddSubTableTargetFields.map((field) => ({
      value: `subTable:${field.id}`,
      label: `子表-${field.name || field.code || '未命名子表'}`,
    })),
  ];
  const getQuickAddTargetFields = (target: QuickAddFieldTarget, subTableId: string) => {
    if (target === 'main') return designerDocument?.model.fields ?? [];
    const subTableField = designerDocument?.model.fields.find((field) => field.id === subTableId && field.type === 'subTable');
    return normalizeQuickAddSubTableFields(subTableField?.typeConfig.columns);
  };
  const resolveQuickAddFieldDraftNames = (drafts: QuickAddFieldDraft[], target: QuickAddFieldTarget, subTableId: string) => {
    const usedNames = new Set(getQuickAddTargetFields(target, subTableId).map((field) => field.name.trim()).filter(Boolean));
    return drafts.map((draft) => {
      const sourceName = draft.sourceName.trim() || draft.name.trim();
      if (!sourceName) return draft;
      return {
        ...draft,
        name: resolveQuickAddUniqueFieldName(usedNames, sourceName),
      };
    });
  };
  const columns = useMemo(
    () => Array.from({ length: currentPage?.sheet.columnCount ?? 0 }, (_, index) => index + 1),
    [currentPage?.sheet.columnCount],
  );
  const rows = useMemo(
    () => Array.from({ length: currentPage?.sheet.rowCount ?? 0 }, (_, index) => index + 1),
    [currentPage?.sheet.rowCount],
  );
  const rawColumnWidths = useMemo(
    () => columns.map((_, index) => currentPage?.sheet.columnWidths[index] ?? currentPage?.sheet.defaultColumnWidth ?? 98),
    [columns, currentPage?.sheet.columnWidths, currentPage?.sheet.defaultColumnWidth],
  );
  const rowHeights = useMemo(
    () => rows.map((_, index) => currentPage?.sheet.rowHeights[index] ?? currentPage?.sheet.defaultRowHeight ?? 36),
    [currentPage?.sheet.defaultRowHeight, currentPage?.sheet.rowHeights, rows],
  );
  const paperOrientation = currentPage?.sheet.paperOrientation ?? 'portrait';
  const paperMode = currentPage?.sheet.canvasMode === 'paper' ? 'free' : 'table';
  const isFreeCanvas = currentPage?.sheet.canvasMode === 'paper';
  const paperMarginTopMm = currentPage?.sheet.paperMarginTopMm ?? 5;
  const paperMarginRightMm = currentPage?.sheet.paperMarginRightMm ?? 6;
  const paperMarginBottomMm = currentPage?.sheet.paperMarginBottomMm ?? 6;
  const paperMarginLeftMm = currentPage?.sheet.paperMarginLeftMm ?? 6;
  const a4PaperWidthPx = Math.round((paperOrientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM) * MM_TO_PX);
  const a4PaperHeightPx = Math.round((paperOrientation === 'landscape' ? A4_PAPER_WIDTH_MM : A4_PAPER_HEIGHT_MM) * MM_TO_PX);
  const paperViewportGapTop = 30;
  const paperViewportGapBottom = 50;
  const paperViewportGapLeft = 40;
  const paperViewportGapRight = 40;
  const paperInsetLeft = Math.round(paperMarginLeftMm * MM_TO_PX);
  const paperInsetRight = Math.round(paperMarginRightMm * MM_TO_PX);
  const paperInsetTop = Math.round(paperMarginTopMm * MM_TO_PX);
  const paperInsetBottom = Math.round(paperMarginBottomMm * MM_TO_PX);
  const paperHeaderHeight = currentPage?.sheet.showHeader ? 46 : 0;
  const paperFooterHeight = currentPage?.sheet.showFooter ? 46 : 0;
  const paperContentWidth = a4PaperWidthPx - paperInsetLeft - paperInsetRight;
  const paperRulerUnit = 40;
  const paperRulerMinorStep = paperRulerUnit / 4;
  const displayColumnWidths = useMemo(() => fitColumnWidths(rawColumnWidths, paperContentWidth), [paperContentWidth, rawColumnWidths]);
  const columnOffsets = useMemo(() => buildOffsets(displayColumnWidths), [displayColumnWidths]);
  const rowOffsets = useMemo(() => buildOffsets(rowHeights), [rowHeights]);
  const repeatedGroupSheetLayout = useMemo(() => (
    currentPage
      ? buildSubTableRepeatedGroupSheetLayout({
          cells: currentPage.cells,
          mergedCells: currentPage.mergedCells,
          nodes: currentPage.nodes,
        })
      : null
  ), [currentPage?.cells, currentPage?.mergedCells, currentPage?.nodes]);
  const displayPage = useMemo(() => (
    currentPage && repeatedGroupSheetLayout
      ? {
          ...currentPage,
          cells: repeatedGroupSheetLayout.cells,
          mergedCells: repeatedGroupSheetLayout.mergedCells,
        }
      : currentPage
  ), [currentPage, repeatedGroupSheetLayout]);
  const sheetWidth = columnOffsets[columnOffsets.length - 1];
  const sheetHeight = rowOffsets[rowOffsets.length - 1];
  const rowHeaderWidth = 42;
  const columnHeaderHeight = 36;
  const sheetPaperWidth = a4PaperWidthPx;
  const freeCanvasBodyHeight = Math.max(freeCanvasMeasuredHeight, 480);
  const sheetContentBottom = currentPage ? getSheetContentBottom(currentPage, rowOffsets) : 0;
  const wordDocumentContentBottom = getCanvasWordDocumentBottom(currentPage?.wordDocument);
  const paperPaginationBodyHeight = isFreeCanvas ? freeCanvasBodyHeight : Math.max(sheetContentBottom, 1);
  const rawPaperHeight = paperInsetTop + paperHeaderHeight + paperPaginationBodyHeight + paperFooterHeight;
  const pageMarkerCount = Math.max(1, Math.ceil(rawPaperHeight / a4PaperHeightPx));
  const sheetPaperHeight = pageMarkerCount * a4PaperHeightPx;
  const paperContentHeight = sheetPaperHeight - paperInsetTop - paperInsetBottom;
  const importedGridTop = Math.max(0, Number(currentPage?.sheet.importedGridTop ?? 0) || 0);
  const gridOffsetTop = isFreeCanvas ? importedGridTop : 0;
  const showPaperRuler = currentPage?.sheet.showRuler ?? true;
  const paperRowHeaderWidth = showPaperRuler ? rowHeaderWidth : 0;
  const paperColumnHeaderHeight = showPaperRuler ? columnHeaderHeight : 0;
  const showSheetRuler = currentPage?.sheet.showRuler ?? true;
  const sheetRowHeaderWidth = showSheetRuler ? rowHeaderWidth : 0;
  const sheetColumnHeaderHeight = showSheetRuler ? columnHeaderHeight : 0;
  const paperRulerColumns = useMemo(() => buildRulerUnits(paperContentWidth, paperRulerUnit), [paperContentWidth]);
  const paperRulerRows = useMemo(() => buildRulerUnits(paperContentHeight, paperRulerUnit), [paperContentHeight]);
  const paperRulerXTicks = useMemo(() => buildRulerTicks(paperContentWidth, paperRulerMinorStep), [paperContentWidth, paperRulerMinorStep]);
  const paperRulerYTicks = useMemo(() => buildRulerTicks(paperContentHeight, paperRulerMinorStep), [paperContentHeight, paperRulerMinorStep]);
  const rowHeaderOffsetTop = paperViewportGapTop + paperInsetTop + paperHeaderHeight;
  const visibleRowRange = useMemo(() => resolveVisibleRowRange(
    rowOffsets,
    workspaceViewport.scrollTop,
    workspaceViewport.height,
    rowHeaderOffsetTop,
  ), [rowHeaderOffsetTop, rowOffsets, workspaceViewport.height, workspaceViewport.scrollTop]);
  const visibleRows = useMemo(() => {
    if (!displayPage) return rows;

    const rowSet = new Set<number>();
    rows.forEach((row) => {
      if (row >= visibleRowRange.start && row <= visibleRowRange.end) {
        rowSet.add(row);
      }
    });
    displayPage.mergedCells.forEach((range) => {
      if (range.b >= visibleRowRange.start && range.t <= visibleRowRange.end) {
        rowSet.add(range.t);
      }
    });
    return rows.filter((row) => rowSet.has(row));
  }, [displayPage, rows, visibleRowRange.end, visibleRowRange.start]);
  const columnTemplate = buildTemplate(displayColumnWidths);
  const rowTemplate = buildTemplate(rowHeights);
  const canvasStageMinWidth = rowHeaderWidth + sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight + scrollbarWidth;
  const floatingSettingsTop = (currentPage?.sheet.canvasMode === 'sheet' ? columnHeaderHeight : paperColumnHeaderHeight) + paperViewportGapTop;
  const paperWorkingWidth = isFreeCanvas ? paperContentWidth : sheetWidth;
  const absoluteNodeBottom = Math.max(
    0,
    ...(currentPage?.nodes ?? []).map((node) => (
      node.style.position === 'absolute'
        ? Number(node.style.compTop ?? 0) + Number(node.style.compHeight ?? 0)
        : 0
    )),
  );
  const paperWorkingHeight = isFreeCanvas ? Math.max(freeCanvasBodyHeight, absoluteNodeBottom, wordDocumentContentBottom, gridOffsetTop + sheetHeight) : Math.max(sheetHeight, 480);
  const effectiveRange = selectedRange ?? buildSingleCellRange(selectedCell);
  const normalizedRange = effectiveRange ? normalizeRange(effectiveRange) : null;
  const normalizedMultiSelectedRanges = useMemo(() => {
    const rangeMap = new Map<string, CanvasSelectionRange>();
    multiSelectedRanges.forEach((range) => {
      const normalized = normalizeRange(range);
      rangeMap.set(rangeKey(normalized), normalized);
    });
    if (normalizedRange) {
      rangeMap.set(rangeKey(normalizedRange), normalizedRange);
    }
    return Array.from(rangeMap.values());
  }, [multiSelectedRanges, normalizedRange]);
  const isAllSelected = normalizedRange
    && currentPage
    && normalizedRange.t === 1
    && normalizedRange.l === 1
    && normalizedRange.b === currentPage.sheet.rowCount
    && normalizedRange.r === currentPage.sheet.columnCount;
  const selectionOutline = normalizedRange
    ? {
        top: rowOffsets[normalizedRange.t - 1],
        left: columnOffsets[normalizedRange.l - 1],
        width: columnOffsets[normalizedRange.r] - columnOffsets[normalizedRange.l - 1],
        height: rowOffsets[normalizedRange.b] - rowOffsets[normalizedRange.t - 1],
      }
    : null;
  const multiSelectionOutlines = normalizedMultiSelectedRanges
    .filter((range) => !normalizedRange || !rangesEqual(range, normalizedRange))
    .map((range) => ({
      key: rangeKey(range),
      top: rowOffsets[range.t - 1],
      left: columnOffsets[range.l - 1],
      width: columnOffsets[range.r] - columnOffsets[range.l - 1],
      height: rowOffsets[range.b] - rowOffsets[range.t - 1],
    }));
  const renderSelectionOutline = (layer: 'grid' | 'overlay') => (
    <>
      {multiSelectionOutlines.map((outline) => (
        <Box
          key={`${layer}-multi-selection-${outline.key}`}
          data-sheet-multi-selection-outline="true"
          sx={{
            position: 'absolute',
            top: (layer === 'overlay' ? gridOffsetTop : 0) + outline.top,
            left: outline.left,
            width: outline.width,
            height: outline.height,
            border: '2px solid rgba(18, 116, 221, 0.72)',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            zIndex: layer === 'overlay' ? 19 : undefined,
          }}
        />
      ))}
      {selectionOutline ? (
        <Box
          data-selection-outline={layer === 'overlay' ? 'selectionOverlay' : 'selectionOutline'}
          sx={{
            position: 'absolute',
            top: (layer === 'overlay' ? gridOffsetTop : 0) + selectionOutline.top,
            left: selectionOutline.left,
            width: selectionOutline.width,
            height: selectionOutline.height,
            border: '2px solid #1274dd',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            zIndex: layer === 'overlay' ? 20 : undefined,
          }}
        />
      ) : null}
    </>
  );
  const normalizedFieldDropGuideRange = fieldDropGuideRange ? normalizeRange(fieldDropGuideRange) : null;
  const fieldDropGuideOutline = normalizedFieldDropGuideRange
    ? {
        top: rowOffsets[normalizedFieldDropGuideRange.t - 1],
        left: columnOffsets[normalizedFieldDropGuideRange.l - 1],
        width: columnOffsets[normalizedFieldDropGuideRange.r] - columnOffsets[normalizedFieldDropGuideRange.l - 1],
        height: rowOffsets[normalizedFieldDropGuideRange.b] - rowOffsets[normalizedFieldDropGuideRange.t - 1],
      }
    : null;
  const renderFieldDropGuide = (layer: 'grid' | 'overlay' = 'overlay') => fieldDropGuideOutline ? (
    <Box
      data-field-drop-guide="true"
      sx={{
        position: 'absolute',
        top: (layer === 'overlay' ? gridOffsetTop : 0) + fieldDropGuideOutline.top,
        left: fieldDropGuideOutline.left,
        width: fieldDropGuideOutline.width,
        height: fieldDropGuideOutline.height,
        border: '2px dashed #2990ff',
        bgcolor: 'rgba(41, 144, 255, 0.12)',
        boxShadow: 'inset 0 0 0 1px rgba(41, 144, 255, 0.35)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 24,
      }}
    />
  ) : null;
  const mergedCellMaps = useMemo(
    () => buildMergedCellMaps(displayPage?.mergedCells ?? []),
    [displayPage?.mergedCells],
  );
  const mediaSrcMap = useMemo(
    () => new Map((currentPage?.medias ?? []).map((media) => [media.id, media.src])),
    [currentPage?.medias],
  );
  const hasSheetOverlayContent = Boolean(
    displayPage && (
      Object.keys(displayPage.cells).length
      || displayPage.images.length
      || displayPage.mergedCells.length
    ),
  );
  const clearSelection = () => {
    setMultiSelectedRanges([]);
    setSelectedRange(null, null);
    setSelectedNodeId(null);
    setSelectedWordTableBlockId(null);
    setWordTableCellRange(null);
    setWordTableContextMenu(null);
  };
  const deleteSelectedWordTable = useCallback(() => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument || !selectedWordTableBlockId) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.filter((block) => block.id !== selectedWordTableBlockId),
      },
    });
    setSelectedWordTableBlockId(null);
    setWordTableCellRange(null);
    setWordTableContextMenu(null);
  }, [currentPage?.wordDocument, selectedWordTableBlockId, updateCurrentPage]);
  useEffect(() => {
    if (!isFreeCanvas) return undefined;

    const handleFreeCanvasDeleteKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target instanceof Element ? event.target : null;
      if (!target || !freeCanvasBodyRef.current?.contains(target)) return;
      if (target?.closest('[contenteditable="true"], input, textarea, select')) return;

      if (selectedWordTableBlockId) {
        event.preventDefault();
        deleteSelectedWordTable();
        return;
      }
      if (selectedNodeId) {
        event.preventDefault();
        removeNode(selectedNodeId);
      }
    };

    const ownerDocument = freeCanvasBodyRef.current?.ownerDocument ?? document;
    ownerDocument.addEventListener('keydown', handleFreeCanvasDeleteKeyDown);
    return () => ownerDocument.removeEventListener('keydown', handleFreeCanvasDeleteKeyDown);
  }, [deleteSelectedWordTable, isFreeCanvas, removeNode, selectedNodeId, selectedWordTableBlockId]);
  const insertCommonComponentAtClientPoint = useCallback((componentId: CommonCanvasComponentId, clientX?: number, clientY?: number) => {
    if (!isFreeCanvas) return;
    const canvasRect = freeCanvasBodyRef.current?.getBoundingClientRect();
    const fallbackOffset = 36 + (currentPage?.nodes.length ?? 0) * 12;
    const left = canvasRect && typeof clientX === 'number' ? clientX - canvasRect.left : fallbackOffset;
    const top = canvasRect && typeof clientY === 'number' ? clientY - canvasRect.top : fallbackOffset;

    if (componentId === 'table') {
      const table = createCommonWordTableBlock({ left, top });
      const wordDocument = currentPage?.wordDocument;
      updateCurrentPage({
        wordDocument: wordDocument
          ? { ...wordDocument, blocks: [...wordDocument.blocks, table] }
          : {
              source: 'docx',
              borderEncodingVersion: 2,
              contentWidth: paperContentWidth,
              contentHeight: paperWorkingHeight,
              blocks: [table],
            },
      });
      setMultiSelectedRanges([]);
      setSelectedRange(null, null);
      setSelectedNodeId(null);
      setSelectedWordTableBlockId(table.id);
      setWordTableCellRange(null);
      return;
    }

    addFreeCanvasComponent(componentId, { left, top });
  }, [addFreeCanvasComponent, currentPage?.nodes.length, currentPage?.wordDocument, isFreeCanvas, paperContentWidth, paperWorkingHeight, setSelectedNodeId, setSelectedRange, updateCurrentPage]);
  const updateWordParagraphText = (blockId: string, text: string) => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.map((block) => (
          block.id === blockId && block.type === 'paragraph'
            ? { ...block, text }
            : block
        )),
      },
    });
  };
  const updateWordTableCellText = (blockId: string, cellId: string, text: string) => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.map((block) => (
          block.id === blockId && block.type === 'table'
            ? {
                ...block,
                cells: block.cells.map((cell) => (
                  cell.id === cellId ? { ...cell, text } : cell
                )),
              }
            : block
        )),
      },
    });
  };
  const updateWordTableLayout = (blockId: string, left: number, top: number) => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.map((block) => (
          block.id === blockId && block.type === 'table'
            ? { ...block, layout: { ...block.layout, left, top } }
            : block
        )),
      },
    });
  };
  const updateWordTableSize = (blockId: string, columnWidths: number[], rowHeights: number[]) => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.map((block) => (
          block.id === blockId && block.type === 'table'
            ? {
                ...block,
                layout: { ...block.layout, width: columnWidths.reduce((sum, width) => sum + width, 0), height: rowHeights.reduce((sum, height) => sum + height, 0) },
                columnWidths,
                rowHeights,
              }
            : block
        )),
      },
    });
  };
  const updateWordTableStructure = (table: CanvasWordTableBlock) => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.map((block) => (
          block.id === table.id && block.type === 'table' ? table : block
        )),
      },
    });
  };
  const getWordTableContext = () => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordTableContextMenu) return null;

    const table = wordDocument?.blocks.find((block): block is CanvasWordTableBlock => (
      block.id === wordTableContextMenu.blockId && block.type === 'table'
    )) ?? wordTableContextMenu.table;
    const cell = table.cells.find((candidate) => candidate.id === wordTableContextMenu.cellId)
      ?? wordTableContextMenu.cell;

    const activeRange = wordTableCellRange?.blockId === table.id
      ? getWordTableRangeBounds(wordTableCellRange)
      : null;
    return {
      table,
      cell,
      range: activeRange ?? {
        top: cell.row,
        left: cell.col,
        bottom: cell.row + cell.rowSpan - 1,
        right: cell.col + cell.colSpan - 1,
      },
    };
  };
  const closeWordTableContextMenu = () => setWordTableContextMenu(null);
  const getWordTableInsertCount = () => Math.max(1, Math.min(100, Number.parseInt(wordTableInsertCount, 10) || 1));
  const handleWordTableContextMenu = (
    event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement> | MouseEvent,
    block: CanvasWordTableBlock,
    cell: CanvasWordTableBlock['cells'][number],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const activeRange = wordTableCellRange?.blockId === block.id ? wordTableCellRange : null;
    const rangeContainsCell = activeRange && isWordTableCellInRange(cell, activeRange);

    selectWordTable(block.id, true);
    if (!rangeContainsCell) {
      setWordTableCellRange({
        blockId: block.id,
        anchor: { row: cell.row, col: cell.col },
        focus: { row: cell.row + cell.rowSpan - 1, col: cell.col + cell.colSpan - 1 },
      });
    }

    flushSync(() => {
      setWordTableContextMenu({
        blockId: block.id,
        cellId: cell.id,
        table: block,
        cell,
        mouseX,
        mouseY,
      });
    });
  };
  useEffect(() => {
    const handleDocumentWordTableContextMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const cellElement = target.closest<HTMLElement>('[data-word-table-cell="true"]');
      if (!cellElement) return;

      const blockId = cellElement.dataset.wordTableBlockId;
      const cellId = cellElement.dataset.wordTableCellId;
      const table = currentPage?.wordDocument?.blocks.find((block): block is CanvasWordTableBlock => (
        block.id === blockId && block.type === 'table'
      ));
      const cell = table?.cells.find((candidate) => candidate.id === cellId);
      if (!table || !cell) return;

      // Native capture is required because contentEditable may consume the React
      // cell handler before it can cancel the browser context menu.
      handleWordTableContextMenu(event, table, cell);
    };

    document.addEventListener('contextmenu', handleDocumentWordTableContextMenu, true);
    return () => document.removeEventListener('contextmenu', handleDocumentWordTableContextMenu, true);
  }, [currentPage?.wordDocument, handleWordTableContextMenu]);
  useEffect(() => {
    if (!wordTableContextMenu) return undefined;

    wordTableContextMenuRef.current?.focus({ preventScroll: true });

    const closeWordTableContextMenuOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-word-table-context-menu="true"]')) return;
      setWordTableContextMenu(null);
    };
    const handleWordTableContextMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setWordTableContextMenu(null);
    };

    document.addEventListener('pointerdown', closeWordTableContextMenuOnOutsidePointerDown, true);
    document.addEventListener('keydown', handleWordTableContextMenuKeyDown);
    return () => {
      document.removeEventListener('pointerdown', closeWordTableContextMenuOnOutsidePointerDown, true);
      document.removeEventListener('keydown', handleWordTableContextMenuKeyDown);
    };
  }, [wordTableContextMenu]);
  const insertWordTableTracks = (axis: 'column' | 'row', position: 'before' | 'after') => {
    const context = getWordTableContext();
    if (!context) return;

    const count = getWordTableInsertCount();
    const insertAt = axis === 'column'
      ? position === 'before' ? context.range.left : context.range.right + 1
      : position === 'before' ? context.range.top : context.range.bottom + 1;
    const nextTable = axis === 'column'
      ? insertWordTableColumns(context.table, insertAt, count)
      : insertWordTableRows(context.table, insertAt, count);

    updateWordTableStructure(nextTable);
    setWordTableCellRange({
      blockId: context.table.id,
      anchor: axis === 'column'
        ? { row: context.range.top, col: insertAt }
        : { row: insertAt, col: context.range.left },
      focus: axis === 'column'
        ? { row: context.range.bottom, col: insertAt + count - 1 }
        : { row: insertAt + count - 1, col: context.range.right },
    });
    closeWordTableContextMenu();
  };
  const mergeSelectedWordTableCells = () => {
    const context = getWordTableContext();
    if (!context || !isMergeableWordTableRange(context.table, context.range)) return;
    updateWordTableStructure(mergeWordTableCells(context.table, context.range));
    setWordTableCellRange({
      blockId: context.table.id,
      anchor: { row: context.range.top, col: context.range.left },
      focus: { row: context.range.bottom, col: context.range.right },
    });
    closeWordTableContextMenu();
  };
  const splitSelectedWordTableCell = () => {
    const context = getWordTableContext();
    if (!context || (context.cell.rowSpan === 1 && context.cell.colSpan === 1)) return;
    updateWordTableStructure(splitWordTableCell(context.table, context.cell.row, context.cell.col));
    setWordTableCellRange({
      blockId: context.table.id,
      anchor: { row: context.cell.row, col: context.cell.col },
      focus: { row: context.cell.row, col: context.cell.col },
    });
    closeWordTableContextMenu();
  };
  const deleteSelectedWordTableTracks = (axis: 'column' | 'row') => {
    const context = getWordTableContext();
    if (!context) return;

    const start = axis === 'column' ? context.range.left : context.range.top;
    const count = axis === 'column'
      ? context.range.right - context.range.left + 1
      : context.range.bottom - context.range.top + 1;
    const sizes = axis === 'column' ? context.table.columnWidths : context.table.rowHeights;
    if (sizes.length <= 1) return;

    const nextTable = axis === 'column'
      ? deleteWordTableColumns(context.table, start, count)
      : deleteWordTableRows(context.table, start, count);
    updateWordTableStructure(nextTable);
    setWordTableCellRange(null);
    closeWordTableContextMenu();
  };
  const deleteWordTableFromContextMenu = () => {
    const context = getWordTableContext();
    const wordDocument = currentPage?.wordDocument;
    if (!context || !wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...wordDocument,
        blocks: wordDocument.blocks.filter((block) => block.id !== context.table.id),
      },
    });
    setSelectedWordTableBlockId(null);
    setWordTableCellRange(null);
    closeWordTableContextMenu();
  };
  const selectWordTable = (blockId: string, preserveCellRange = false) => {
    setMultiSelectedRanges([]);
    setSelectedRange(null, null);
    setSelectedNodeId(null);
    setSelectedWordTableBlockId(blockId);
    if (!preserveCellRange) {
      setWordTableCellRange(null);
      setWordTableCellStyleTarget(null);
    }
  };
  const beginWordTableCellSelection = (
    event: ReactPointerEvent<HTMLDivElement>,
    block: CanvasWordTableBlock,
    cell: CanvasWordTableBlock['cells'][number],
  ) => {
    if (event.button !== 0) return;

    const currentRange = wordTableCellRange?.blockId === block.id ? wordTableCellRange : null;
    const anchor = event.shiftKey && currentRange
      ? currentRange.anchor
      : { row: cell.row, col: cell.col };
    if (event.shiftKey) {
      event.preventDefault();
    }
    selectWordTable(block.id, true);
    setWordTableCellRange({
      blockId: block.id,
      anchor,
      focus: { row: cell.row, col: cell.col },
    });
    setWordTableCellStyleTarget({
      blockId: block.id,
      range: {
        top: Math.min(anchor.row, cell.row),
        left: Math.min(anchor.col, cell.col),
        bottom: Math.max(anchor.row, cell.row),
        right: Math.max(anchor.col, cell.col),
      },
    });
    wordTableCellSelectionCleanupRef.current?.();

    const selectionTarget = event.currentTarget;
    const ownerDocument = selectionTarget.ownerDocument;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let isRangeDragging = false;
    let suppressNativeSelection = event.shiftKey;

    const getCellAtPointer = (pointerEvent: PointerEvent) => {
      const target = ownerDocument.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
      const cellElement = target?.closest<HTMLElement>('[data-word-table-cell-id]');
      if (!cellElement || cellElement.dataset.wordTableBlockId !== block.id) return null;
      return block.cells.find((candidate) => candidate.id === cellElement.dataset.wordTableCellId) ?? null;
    };
    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const nextCell = getCellAtPointer(pointerEvent);
      if (!nextCell) return;
      if (!isRangeDragging && Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) < WORD_TABLE_DRAG_THRESHOLD) return;
      isRangeDragging = true;
      suppressNativeSelection = true;
      ownerDocument.getSelection()?.removeAllRanges();
      setWordTableCellRange((current) => (
        current?.blockId === block.id
          ? { ...current, focus: { row: nextCell.row, col: nextCell.col } }
          : current
      ));
      setWordTableCellStyleTarget({
        blockId: block.id,
        range: {
          top: Math.min(anchor.row, nextCell.row),
          left: Math.min(anchor.col, nextCell.col),
          bottom: Math.max(anchor.row, nextCell.row),
          right: Math.max(anchor.col, nextCell.col),
        },
      });
    };
    const handleSelectStart = (selectionEvent: Event) => {
      if (suppressNativeSelection) {
        selectionEvent.preventDefault();
      }
    };
    const finish = () => {
      ownerDocument.removeEventListener('pointermove', handlePointerMove, true);
      ownerDocument.removeEventListener('pointerup', finish, true);
      ownerDocument.removeEventListener('pointercancel', finish, true);
      ownerDocument.removeEventListener('selectstart', handleSelectStart, true);
      if (selectionTarget.hasPointerCapture(pointerId)) {
        selectionTarget.releasePointerCapture(pointerId);
      }
      wordTableCellSelectionCleanupRef.current = null;
    };

    selectionTarget.setPointerCapture(pointerId);
    ownerDocument.addEventListener('pointermove', handlePointerMove, true);
    ownerDocument.addEventListener('pointerup', finish, true);
    ownerDocument.addEventListener('pointercancel', finish, true);
    ownerDocument.addEventListener('selectstart', handleSelectStart, true);
    wordTableCellSelectionCleanupRef.current = finish;
  };
  const beginWordTableTextOrCellSelection = (
    event: ReactPointerEvent<HTMLDivElement>,
    block: CanvasWordTableBlock,
    cell: CanvasWordTableBlock['cells'][number],
  ) => {
    if (event.button !== 0) return;

    // Keep native character selection until the gesture crosses into another cell.
    selectWordTable(block.id);
    wordTableCellSelectionCleanupRef.current?.();

    const selectionTarget = event.currentTarget;
    const ownerDocument = selectionTarget.ownerDocument;
    const pointerId = event.pointerId;
    let hasCrossedCellBoundary = false;
    let suppressNativeSelection = false;

    const getCellAtPointer = (pointerEvent: PointerEvent) => {
      const target = ownerDocument.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
      const cellElement = target?.closest<HTMLElement>('[data-word-table-cell-id]');
      if (!cellElement || cellElement.dataset.wordTableBlockId !== block.id) return null;
      return block.cells.find((candidate) => candidate.id === cellElement.dataset.wordTableCellId) ?? null;
    };
    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const nextCell = getCellAtPointer(pointerEvent);
      if (!nextCell) return;

      if (!hasCrossedCellBoundary && nextCell.id === cell.id) return;
      if (!hasCrossedCellBoundary) {
        hasCrossedCellBoundary = true;
        suppressNativeSelection = true;
        ownerDocument.getSelection()?.removeAllRanges();
        selectWordTable(block.id, true);
        setWordTableCellRange({
          blockId: block.id,
          anchor: { row: cell.row, col: cell.col },
          focus: { row: nextCell.row, col: nextCell.col },
        });
        setWordTableCellStyleTarget({
          blockId: block.id,
          range: {
            top: Math.min(cell.row, nextCell.row),
            left: Math.min(cell.col, nextCell.col),
            bottom: Math.max(cell.row, nextCell.row),
            right: Math.max(cell.col, nextCell.col),
          },
        });
        return;
      }

      setWordTableCellRange((current) => (
        current?.blockId === block.id
          ? { ...current, focus: { row: nextCell.row, col: nextCell.col } }
          : current
      ));
      setWordTableCellStyleTarget({
        blockId: block.id,
        range: {
          top: Math.min(cell.row, nextCell.row),
          left: Math.min(cell.col, nextCell.col),
          bottom: Math.max(cell.row, nextCell.row),
          right: Math.max(cell.col, nextCell.col),
        },
      });
    };
    const handleSelectStart = (selectionEvent: Event) => {
      if (suppressNativeSelection) {
        selectionEvent.preventDefault();
      }
    };
    const finish = () => {
      ownerDocument.removeEventListener('pointermove', handlePointerMove, true);
      ownerDocument.removeEventListener('pointerup', finish, true);
      ownerDocument.removeEventListener('pointercancel', finish, true);
      ownerDocument.removeEventListener('selectstart', handleSelectStart, true);
      if (selectionTarget.hasPointerCapture(pointerId)) {
        selectionTarget.releasePointerCapture(pointerId);
      }
      wordTableCellSelectionCleanupRef.current = null;
    };

    selectionTarget.setPointerCapture(pointerId);
    ownerDocument.addEventListener('pointermove', handlePointerMove, true);
    ownerDocument.addEventListener('pointerup', finish, true);
    ownerDocument.addEventListener('pointercancel', finish, true);
    ownerDocument.addEventListener('selectstart', handleSelectStart, true);
    wordTableCellSelectionCleanupRef.current = finish;
  };
  const beginWordTableDrag = (event: ReactPointerEvent<HTMLElement>, block: CanvasWordTableBlock) => {
    if (event.button !== 0) return;

    selectWordTable(block.id);
    wordTablePointerCleanupRef.current?.();
    wordTableCellSelectionCleanupRef.current?.();

    const ownerDocument = event.currentTarget.ownerDocument;
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = block.layout.left;
    const startTop = block.layout.top;
    let didDrag = false;

    const clearPreview = () => {
      wordTableLayoutPreviewRef.current = null;
      setWordTableLayoutPreview((current) => current?.blockId === block.id ? null : current);
    };
    const finish = (shouldCommit: boolean) => {
      ownerDocument.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerEnd);
      ownerDocument.removeEventListener('pointercancel', handlePointerEnd);
      wordTablePointerCleanupRef.current = null;
      const preview = wordTableLayoutPreviewRef.current;
      clearPreview();
      if (shouldCommit && didDrag && preview?.blockId === block.id) {
        updateWordTableLayout(block.id, preview.left, preview.top);
      }
    };
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (!didDrag && Math.hypot(deltaX, deltaY) < WORD_TABLE_DRAG_THRESHOLD) return;
      didDrag = true;
      const preview = {
        blockId: block.id,
        left: Math.max(0, Math.round(startLeft + deltaX)),
        top: Math.max(0, Math.round(startTop + deltaY)),
      };
      wordTableLayoutPreviewRef.current = preview;
      setWordTableLayoutPreview(preview);
    };
    const handlePointerEnd = () => finish(true);
    ownerDocument.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerEnd);
    ownerDocument.addEventListener('pointercancel', handlePointerEnd);
    wordTablePointerCleanupRef.current = () => finish(false);
  };
  const beginWordTableResize = (
    event: ReactPointerEvent<HTMLElement>,
    block: CanvasWordTableBlock,
    axis: 'column' | 'row',
    boundaryIndex: number,
    currentColumnWidths: number[],
    currentRowHeights: number[],
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    selectWordTable(block.id);
    wordTablePointerCleanupRef.current?.();
    wordTableCellSelectionCleanupRef.current?.();

    const ownerDocument = event.currentTarget.ownerDocument;
    const resizeTarget = event.currentTarget;
    const pointerId = event.pointerId;
    resizeTarget.setPointerCapture(pointerId);
    const startPosition = axis === 'column' ? event.clientX : event.clientY;
    const startColumnWidths = [...currentColumnWidths];
    const startRowHeights = [...currentRowHeights];
    const minimumSize = axis === 'column' ? WORD_TABLE_MIN_COLUMN_WIDTH : WORD_TABLE_MIN_ROW_HEIGHT;

    const clearPreview = () => {
      wordTableSizePreviewRef.current = null;
      setWordTableSizePreview((current) => current?.blockId === block.id ? null : current);
    };
    const finish = (shouldCommit: boolean) => {
      resizeTarget.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerEnd, true);
      ownerDocument.removeEventListener('pointercancel', handlePointerEnd, true);
      if (resizeTarget.hasPointerCapture(pointerId)) resizeTarget.releasePointerCapture(pointerId);
      wordTablePointerCleanupRef.current = null;
      const preview = wordTableSizePreviewRef.current;
      clearPreview();
      if (shouldCommit && preview?.blockId === block.id) {
        updateWordTableSize(block.id, preview.columnWidths, preview.rowHeights);
      }
    };
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const delta = (axis === 'column' ? moveEvent.clientX : moveEvent.clientY) - startPosition;
      const sizes = axis === 'column' ? startColumnWidths : startRowHeights;
      const nextSizes = axis === 'column'
        ? redistributeWordTableColumnWidths(startColumnWidths, boundaryIndex, delta)
        : (() => {
          const previousSize = sizes[boundaryIndex - 1] ?? minimumSize;
          const nextSize = sizes[boundaryIndex] ?? minimumSize;
          const boundedDelta = Math.max(minimumSize - previousSize, Math.min(delta, nextSize - minimumSize));
          const nextRowSizes = [...sizes];
          nextRowSizes[boundaryIndex - 1] = Math.round(previousSize + boundedDelta);
          nextRowSizes[boundaryIndex] = Math.round(nextSize - boundedDelta);
          return nextRowSizes;
        })();
      const preview = {
        blockId: block.id,
        columnWidths: axis === 'column' ? nextSizes : startColumnWidths,
        rowHeights: axis === 'row' ? nextSizes : startRowHeights,
      };
      wordTableSizePreviewRef.current = preview;
      setWordTableSizePreview(preview);
    };
    const handlePointerEnd = () => finish(true);
    resizeTarget.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerEnd, true);
    ownerDocument.addEventListener('pointercancel', handlePointerEnd, true);
    wordTablePointerCleanupRef.current = () => finish(false);
  };
  const beginWordTableOuterColumnResize = (
    event: ReactPointerEvent<HTMLElement>,
    block: CanvasWordTableBlock,
    currentColumnWidths: number[],
    currentRowHeights: number[],
  ) => {
    if (event.button !== 0 || currentColumnWidths.length === 0) return;

    event.preventDefault();
    event.stopPropagation();
    selectWordTable(block.id);
    wordTablePointerCleanupRef.current?.();
    wordTableCellSelectionCleanupRef.current?.();

    const ownerDocument = event.currentTarget.ownerDocument;
    const resizeTarget = event.currentTarget;
    const pointerId = event.pointerId;
    resizeTarget.setPointerCapture(pointerId);
    const startX = event.clientX;
    const startColumnWidths = [...currentColumnWidths];
    const lastColumnIndex = startColumnWidths.length - 1;
    const startLastColumnWidth = startColumnWidths[lastColumnIndex];

    const clearPreview = () => {
      wordTableSizePreviewRef.current = null;
      setWordTableSizePreview((current) => current?.blockId === block.id ? null : current);
    };
    const finish = (shouldCommit: boolean) => {
      resizeTarget.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerEnd, true);
      ownerDocument.removeEventListener('pointercancel', handlePointerEnd, true);
      if (resizeTarget.hasPointerCapture(pointerId)) resizeTarget.releasePointerCapture(pointerId);
      wordTablePointerCleanupRef.current = null;
      const preview = wordTableSizePreviewRef.current;
      clearPreview();
      if (shouldCommit && preview?.blockId === block.id) {
        updateWordTableSize(block.id, preview.columnWidths, preview.rowHeights);
      }
    };
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const deltaX = moveEvent.clientX - startX;
      const nextColumnWidths = [...startColumnWidths];
      nextColumnWidths[lastColumnIndex] = Math.max(
        WORD_TABLE_MIN_COLUMN_WIDTH,
        Math.round(startLastColumnWidth + deltaX),
      );
      const preview = {
        blockId: block.id,
        columnWidths: nextColumnWidths,
        rowHeights: currentRowHeights,
      };
      wordTableSizePreviewRef.current = preview;
      setWordTableSizePreview(preview);
    };
    const handlePointerEnd = () => finish(true);
    resizeTarget.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerEnd, true);
    ownerDocument.addEventListener('pointercancel', handlePointerEnd, true);
    wordTablePointerCleanupRef.current = () => finish(false);
  };
  const beginWordTableOuterRowResize = (
    event: ReactPointerEvent<HTMLElement>,
    block: CanvasWordTableBlock,
    currentColumnWidths: number[],
    currentRowHeights: number[],
  ) => {
    if (event.button !== 0 || currentRowHeights.length === 0) return;

    event.preventDefault();
    event.stopPropagation();
    selectWordTable(block.id);
    wordTablePointerCleanupRef.current?.();
    wordTableCellSelectionCleanupRef.current?.();

    const ownerDocument = event.currentTarget.ownerDocument;
    const resizeTarget = event.currentTarget;
    const pointerId = event.pointerId;
    resizeTarget.setPointerCapture(pointerId);
    const startY = event.clientY;
    const startRowHeights = [...currentRowHeights];
    const lastRowIndex = startRowHeights.length - 1;
    const startLastRowHeight = startRowHeights[lastRowIndex];

    const clearPreview = () => {
      wordTableSizePreviewRef.current = null;
      setWordTableSizePreview((current) => current?.blockId === block.id ? null : current);
    };
    const finish = (shouldCommit: boolean) => {
      resizeTarget.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerEnd, true);
      ownerDocument.removeEventListener('pointercancel', handlePointerEnd, true);
      if (resizeTarget.hasPointerCapture(pointerId)) resizeTarget.releasePointerCapture(pointerId);
      wordTablePointerCleanupRef.current = null;
      const preview = wordTableSizePreviewRef.current;
      clearPreview();
      if (shouldCommit && preview?.blockId === block.id) {
        updateWordTableSize(block.id, preview.columnWidths, preview.rowHeights);
      }
    };
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const deltaY = moveEvent.clientY - startY;
      const nextRowHeights = [...startRowHeights];
      nextRowHeights[lastRowIndex] = Math.max(
        WORD_TABLE_MIN_ROW_HEIGHT,
        Math.round(startLastRowHeight + deltaY),
      );
      const preview = {
        blockId: block.id,
        columnWidths: currentColumnWidths,
        rowHeights: nextRowHeights,
      };
      wordTableSizePreviewRef.current = preview;
      setWordTableSizePreview(preview);
    };
    const handlePointerEnd = () => finish(true);
    resizeTarget.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerEnd, true);
    ownerDocument.addEventListener('pointercancel', handlePointerEnd, true);
    wordTablePointerCleanupRef.current = () => finish(false);
  };
  const selectedSubTableNode = currentPage && normalizedRange
    ? currentPage.nodes.find((node) => {
        if (node.type !== 'sub-table' || !node.bindings?.fieldId) return false;
        const subTableRange = findSubTableNodeRange(currentPage, node.bindings.fieldId);
        return Boolean(subTableRange && rangeContainsRange(subTableRange, normalizedRange));
      }) ?? null
    : null;
  const selectedSubTableRegion = selectedSubTableNode?.bindings?.subTableRegion ?? null;
  const isSubTableRangeSelection = Boolean(selectedSubTableNode);
  const selectionCrossesSubTableBoundary = Boolean(
    currentPage
      && normalizedRange
      && getSubTableNodes(currentPage.nodes).some((node) => {
        if (!node.bindings?.fieldId) return false;
        const subTableRange = findSubTableNodeRange(currentPage, node.bindings.fieldId);
        return Boolean(
          subTableRange
            && rangesIntersect(subTableRange, normalizedRange)
            && !rangeContainsRange(subTableRange, normalizedRange),
        );
      }),
  );
  const subTableHoverTargets = useMemo(() => (
    currentPage
      ? getSubTableNodes(currentPage.nodes)
          .map((node) => {
            const range = readNodeCellRange(node) ?? node.bindings?.subTableRegion?.ranges[0]?.range ?? null;
            return range ? { nodeId: node.id, range: normalizeRange(range) } : null;
          })
          .filter((item): item is { nodeId: string; range: CanvasSelectionRange } => Boolean(item))
      : []
  ), [currentPage]);
  const updateHoveredSubTableFromRange = (range: CanvasSelectionRange | null) => {
    if (!range) {
      setHoveredSubTableNodeId(null);
      return;
    }
    const normalizedSelection = normalizeRange(range);
    const nextHoveredNodeId = subTableHoverTargets.find((item) => rangeContainsRange(item.range, normalizedSelection))?.nodeId ?? null;
    setHoveredSubTableNodeId((current) => (current === nextHoveredNodeId ? current : nextHoveredNodeId));
  };
  const startEditingCell = (row: number, col: number, initialValue?: string) => {
    skipNextBlurCommitRef.current = false;
    const renderPage = displayPage ?? currentPage;
    const currentValue = renderPage?.cells[getCellKey(row, col)]?.value ?? '';
    setEditingCell({
      row,
      col,
      draft: initialValue ?? currentValue,
    });
  };
  const commitEditingCell = (cell: EditingCellState | null) => {
    if (!cell) return;
    skipNextBlurCommitRef.current = true;
    updateSheetCellValue(cell.row, cell.col, cell.draft);
    setEditingCell(null);
    sheetInteractionRef.current?.focus();
  };
  const cancelEditingCell = () => {
    skipNextBlurCommitRef.current = true;
    setEditingCell(null);
    sheetInteractionRef.current?.focus();
  };
  const handleCopySelectedCells = async () => {
    if (!selectedCell && !selectedRange) return;
    const text = copySelectedCellsText();
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };
  const handleCutSelectedCells = async () => {
    if (!selectedCell && !selectedRange) return;
    const text = copySelectedCellsText();
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    clearSelectedCells();
  };
  const handleCutSelectedFieldNode = () => {
    const clippedNode = cutSelectedFieldNode();
    if (!clippedNode) return false;
    fieldNodeClipboardRef.current = clippedNode;
    return true;
  };
  const handlePasteSelectedFieldNode = () => {
    const clippedNode = fieldNodeClipboardRef.current;
    const target = buildSingleCellRange(selectedCell) ?? (selectedRange
      ? { t: selectedRange.t, l: selectedRange.l, b: selectedRange.t, r: selectedRange.l }
      : null);
    if (!clippedNode || !target) return false;

    if (clippedNode.bindings?.subTableId && currentPage) {
      const subTableRange = findSubTableNodeRange(currentPage, clippedNode.bindings.subTableId);
      if (!subTableRange || !rangeContainsRange(subTableRange, target)) return false;
      const dropMessage = resolveSubTableFieldDropMessage(currentPage, clippedNode.bindings.subTableId, target);
      if (dropMessage) {
        showMessage(dropMessage, 'error');
        return false;
      }
    }

    pasteFieldNodeToCell(clippedNode, getFieldDropCellLayout(target));
    fieldNodeClipboardRef.current = null;
    return true;
  };
  const handlePasteSelectedCells = async () => {
    const target = selectedRange ?? buildSingleCellRange(selectedCell);
    if (!target || !navigator.clipboard) return;
    const text = await navigator.clipboard.readText();
    pasteCellsFromText(target.t, target.l, text);
  };
  const getGridOffsetCellLayout = (range: CanvasSelectionRange) => {
    const normalizedSelection = normalizeRange(range);
    const left = columnOffsets[normalizedSelection.l - 1] ?? 0;
    const rowTop = rowOffsets[normalizedSelection.t - 1] ?? 0;
    return {
      left,
      top: gridOffsetTop + rowTop,
      width: (columnOffsets[normalizedSelection.r] ?? left) - left,
      height: (rowOffsets[normalizedSelection.b] ?? rowTop) - rowTop,
      range: normalizedSelection,
    };
  };
  const getFieldDropCellLayout = (range: CanvasSelectionRange) => getGridOffsetCellLayout(range);
  const renderSubTableOverlays = () => {
    if (!currentPage) return null;

    return getSubTableNodes(currentPage.nodes).map((node) => {
      const region = node.bindings?.subTableRegion;
      const boundField = node.bindings?.fieldId ? getFieldById(node.bindings.fieldId) : null;
      const subTableLabel = String(boundField?.name || boundField?.code || node.props.title || node.props.label || '子表');
      const nodeRange = readNodeCellRange(node);
      const range = nodeRange ?? region?.ranges[0]?.range ?? null;
      if (!region || !range) return null;

      const normalizedRegionRange = normalizeRange(range);
      const regionLayout = getFieldDropCellLayout(normalizedRegionRange);
      const groupRange = region.recordTemplate.groupRange
        ? normalizeRange(region.recordTemplate.groupRange)
        : null;
      const shouldRenderGroup = Boolean(groupRange && rangeContainsRange(normalizedRegionRange, groupRange!));
      const groupLayout = shouldRenderGroup ? getFieldDropCellLayout(groupRange!) : null;
      const repeatedGroupRanges = shouldRenderGroup && groupRange && region.repeat.type === 'fixed'
        ? buildSubTableGroupRepeatRanges(normalizedRegionRange, groupRange, region.recordTemplate.direction)
        : [];
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredSubTableNodeId === node.id;
      const isSubTableFocused = Boolean(isSelected && normalizedRange && rangesEqual(normalizedRange, normalizedRegionRange));
      const shouldShowSubTableLabel = isHovered || isSubTableFocused;
      const subTableLabelHeight = Math.max(0, Math.min(24, regionLayout.height - 4));
      const subTableLabelTopOffset = Math.min(6, Math.max(0, regionLayout.height - subTableLabelHeight));

      return (
        <Box key={`sub-table-overlay-${node.id}`} sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: SUB_TABLE_OVERLAY_Z_INDEX }}>
          <Box
            data-canvas-sub-table-region-overlay="true"
            sx={{
              position: 'absolute',
              top: regionLayout.top,
              left: regionLayout.left,
              width: regionLayout.width,
              height: regionLayout.height,
              border: `${isSelected ? 2 : 1}px dashed #7c3aed`,
              boxShadow: '0 0 0 1px rgba(124, 58, 237, 0.22)',
              boxSizing: 'border-box',
            }}
          />
          <Box
            data-canvas-sub-table-hover-label="true"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedRange(normalizedRegionRange, { row: normalizedRegionRange.t, col: normalizedRegionRange.l });
              setSelectedNodeId(node.id);
              setActiveCanvasRail('config');
            }}
            sx={{
              position: 'absolute',
              top: regionLayout.top + subTableLabelTopOffset,
              left: regionLayout.left + regionLayout.width - 8,
              transform: 'translateX(-100%)',
              minWidth: 44,
              maxWidth: 112,
              height: subTableLabelHeight,
              px: 1,
              py: 0,
              borderRadius: 1,
              bgcolor: '#8b5cf6',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: shouldShowSubTableLabel ? 1 : 0,
              pointerEvents: shouldShowSubTableLabel ? 'auto' : 'none',
              transition: 'opacity 120ms ease',
              boxShadow: '0 6px 16px rgba(139, 92, 246, 0.22)',
            }}
          >
            <Box
              component="span"
              data-canvas-sub-table-hover-label-text="true"
              sx={{
                display: 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: `${subTableLabelHeight}px`,
              }}
            >
              {subTableLabel}
            </Box>
          </Box>
          {repeatedGroupRanges.map((repeatRange, index) => {
            const repeatLayout = getFieldDropCellLayout(repeatRange);
            return (
              <Box
                key={`sub-table-group-repeat-${node.id}-${index}`}
                data-canvas-sub-table-group-repeat-overlay="true"
                sx={{
                  position: 'absolute',
                  top: repeatLayout.top,
                  left: repeatLayout.left,
                  width: repeatLayout.width,
                  height: repeatLayout.height,
                  minHeight: 24,
                  boxSizing: 'border-box',
                }}
              >
                <Box
                  data-canvas-sub-table-group-repeat-fill="true"
                  sx={{
                    position: 'absolute',
                    inset: SUB_TABLE_GROUP_REPEAT_INSET,
                    bgcolor: 'rgba(148, 163, 184, 0.14)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    data-canvas-sub-table-group-repeat-index="true"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 4,
                      color: 'rgba(100, 116, 139, 0.24)',
                      fontSize: 28,
                      lineHeight: '32px',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                </Box>
              </Box>
            );
          })}
          {groupLayout ? (
            <Box
              data-canvas-sub-table-group-overlay="true"
              sx={{
                position: 'absolute',
                top: groupLayout.top,
                left: groupLayout.left,
                width: groupLayout.width,
                height: groupLayout.height,
                minHeight: 24,
                border: '2px dashed #f59e0b',
                bgcolor: 'rgba(245, 158, 11, 0.08)',
                boxSizing: 'border-box',
              }}
            >
              <Box
                component="button"
                type="button"
                data-canvas-sub-table-group-label="true"
                onClick={(event) => {
                  event.stopPropagation();
                  selectSubTableGroup(node.id);
                }}
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  height: 24,
                  border: 0,
                  px: 0.75,
                  lineHeight: '24px',
                  bgcolor: '#f59e0b',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                {'分组'}
              </Box>
            </Box>
          ) : null}
        </Box>
      );
    });
  };
  const findCellRangeAtClientPoint = (clientX: number, clientY: number) => {
    const renderPage = displayPage ?? currentPage;
    if (!renderPage) return null;

    const paperElement = workspaceScrollRef.current?.querySelector<HTMLElement>('[data-sheet-paper="true"]');
    const paperRect = paperElement?.getBoundingClientRect();
    if (!paperRect) return null;

    const x = clientX - paperRect.left - paperInsetLeft;
    const y = clientY - paperRect.top - paperInsetTop - paperHeaderHeight - gridOffsetTop;
    const col = findIndexByOffset(columnOffsets, x);
    const row = findIndexByOffset(rowOffsets, y);
    if (!row || !col) return null;

    const mergedRange = findMergedRangeForCell(renderPage, row, col);
    return getMergedAwareCellRange(row, col, mergedRange);
  };

  const applyCellRangeDrag = (cellSelectionRange: CanvasSelectionRange, state: CellDragState) => {
    setSelectedRange(
      {
        t: Math.min(state.startRange.t, cellSelectionRange.t),
        l: Math.min(state.startRange.l, cellSelectionRange.l),
        b: Math.max(state.startRange.b, cellSelectionRange.b),
        r: Math.max(state.startRange.r, cellSelectionRange.r),
      },
      { row: state.startRow, col: state.startCol },
    );
  };
  const commitPendingCellRangeDrag = () => {
    const pending = pendingCellDragRef.current;
    pendingCellDragRef.current = null;
    if (!pending) return;
    applyCellRangeDrag(pending.cellSelectionRange, pending.state);
  };
  const scheduleCellRangeDrag = (cellSelectionRange: CanvasSelectionRange, state: CellDragState) => {
    pendingCellDragRef.current = { cellSelectionRange, state };
    if (cellDragFrameRef.current !== null) return;
    cellDragFrameRef.current = window.requestAnimationFrame(() => {
      cellDragFrameRef.current = null;
      commitPendingCellRangeDrag();
    });
  };
  const extendCellRangeDrag = scheduleCellRangeDrag;

  const commitPendingSheetResizeDrag = () => {
    const pending = pendingSheetResizeDragRef.current;
    pendingSheetResizeDragRef.current = null;
    if (!pending) return;
    if (pending.type === 'column') {
      setSheetColumnWidth(pending.col, pending.col, pending.width);
      return;
    }
    setSheetRowHeight(pending.row, pending.row, pending.height);
  };
  const scheduleSheetResizeDrag = (update: SheetResizeDragUpdate) => {
    pendingSheetResizeDragRef.current = update;
    if (sheetResizeDragFrameRef.current !== null) return;
    sheetResizeDragFrameRef.current = window.requestAnimationFrame(() => {
      sheetResizeDragFrameRef.current = null;
      commitPendingSheetResizeDrag();
    });
  };

  const getResizeRowDragPreview = (row: number, height: number): ResizeRowDragPreview => {
    const nextHeight = Math.max(24, Math.round(height));
    return {
      row,
      height: nextHeight,
      top: rowHeaderOffsetTop + (rowOffsets[row - 1] ?? 0) + nextHeight,
    };
  };
  const commitPendingRowResizeDrag = () => {
    const pending = pendingRowResizeDragRef.current;
    pendingRowResizeDragRef.current = null;
    setResizeRowDragPreview(null);
    if (!pending) return;
    setSheetRowHeight(pending.row, pending.row, pending.height);
  };
  const scheduleRowResizeDragPreview = (row: number, height: number) => {
    pendingRowResizeDragRef.current = { row, height };
    if (rowResizeDragFrameRef.current !== null) return;
    rowResizeDragFrameRef.current = window.requestAnimationFrame(() => {
      rowResizeDragFrameRef.current = null;
      const pending = pendingRowResizeDragRef.current;
      if (!pending) return;
      setResizeRowDragPreview(getResizeRowDragPreview(pending.row, pending.height));
    });
  };
  const cancelPendingRowResizeDrag = () => {
    if (rowResizeDragFrameRef.current !== null) {
      window.cancelAnimationFrame(rowResizeDragFrameRef.current);
      rowResizeDragFrameRef.current = null;
    }
    pendingRowResizeDragRef.current = null;
    setResizeRowDragPreview(null);
  };

  const commitPendingHoveredSubTableUpdate = () => {
    updateHoveredSubTableFromRange(pendingHoveredSubTableRangeRef.current);
    pendingHoveredSubTableRangeRef.current = null;
  };
  const scheduleHoveredSubTableUpdate = (range: CanvasSelectionRange | null) => {
    pendingHoveredSubTableRangeRef.current = range;
    if (hoveredSubTableFrameRef.current !== null) return;
    hoveredSubTableFrameRef.current = window.requestAnimationFrame(() => {
      hoveredSubTableFrameRef.current = null;
      commitPendingHoveredSubTableUpdate();
    });
  };
  const cancelHoveredSubTableUpdate = () => {
    if (hoveredSubTableFrameRef.current !== null) {
      window.cancelAnimationFrame(hoveredSubTableFrameRef.current);
      hoveredSubTableFrameRef.current = null;
    }
    pendingHoveredSubTableRangeRef.current = null;
  };
  const handleCommandCellSelection = (cellSelectionRange: CanvasSelectionRange) => {
    const normalizedSelection = normalizeRange(cellSelectionRange);
    const selectionKey = rangeKey(normalizedSelection);
    const baseRanges = normalizedMultiSelectedRanges.length
      ? normalizedMultiSelectedRanges
      : normalizedRange
        ? [normalizedRange]
        : [];
    const rangeMap = new Map<string, CanvasSelectionRange>();
    baseRanges.forEach((range) => {
      const normalized = normalizeRange(range);
      rangeMap.set(rangeKey(normalized), normalized);
    });

    if (rangeMap.has(selectionKey)) {
      rangeMap.delete(selectionKey);
    } else {
      rangeMap.set(selectionKey, normalizedSelection);
    }

    const nextRanges = Array.from(rangeMap.values());
    const nextSelectedRange = nextRanges.length > 0 ? nextRanges[nextRanges.length - 1] : null;
    setMultiSelectedRanges(nextRanges);
    setSelectedRange(nextSelectedRange, nextSelectedRange ? { row: nextSelectedRange.t, col: nextSelectedRange.l } : null);
    setDragState(null);
  };
  const startCellRangeDrag = (cellSelectionRange: CanvasSelectionRange) => {
    setMultiSelectedRanges([]);
    setSelectedRange(cellSelectionRange, { row: cellSelectionRange.t, col: cellSelectionRange.l });
    setDragState({
      type: 'cell',
      startRow: cellSelectionRange.t,
      startCol: cellSelectionRange.l,
      startRange: cellSelectionRange,
    });
  };
  const handleCellFieldMouseDown = (cellSelectionRange: CanvasSelectionRange, event: ReactMouseEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    sheetInteractionRef.current?.focus();
    startCellRangeDrag(cellSelectionRange);
  };
  const addDroppedFieldToCell = (
    fieldId: string,
    cellSelectionRange: CanvasSelectionRange,
    layout: ReturnType<typeof getFieldDropCellLayout>,
    subTableFieldData?: SubTableFieldDragData | null,
  ) => {
    if (subTableFieldData && currentPage) {
      const subTableRange = findSubTableNodeRange(currentPage, subTableFieldData.subTableId);
      const normalizedSelection = normalizeRange(cellSelectionRange);
      if (!subTableRange || !rangeContainsRange(subTableRange, normalizedSelection)) return;
      const dropMessage = resolveSubTableFieldDropMessage(currentPage, subTableFieldData.subTableId, normalizedSelection);
      if (dropMessage) {
        showMessage(dropMessage, 'error');
        return;
      }
      addNodeFromSubTableFieldToCell(subTableFieldData.subTableId, subTableFieldData.field, layout);
      return;
    }

    addNodeFromFieldToCell(fieldId, layout);
  };
  const handleFieldDropOnCell = (event: ReactDragEvent<HTMLDivElement>, cellSelectionRange: CanvasSelectionRange) => {
    const fieldId = event.dataTransfer.getData('application/x-template-designer-field');
    const subTableFieldData = parseSubTableFieldDragData(
      event.dataTransfer.getData('application/x-template-designer-sub-table-field'),
    );
    if (!fieldId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setMultiSelectedRanges([]);
    setSelectedRange(cellSelectionRange, { row: cellSelectionRange.t, col: cellSelectionRange.l });
    addDroppedFieldToCell(fieldId, cellSelectionRange, getFieldDropCellLayout(cellSelectionRange), subTableFieldData);
    setFieldDropGuideRange(null);
  };
  useEffect(() => {
    if (!currentPage) return undefined;

    const renderPage = displayPage ?? currentPage;
    const ownerDocument = sheetInteractionRef.current?.ownerDocument ?? document;
    const resolveHoverRange = (row: number, col: number) => {
      if (row < 1 || col < 1 || row > renderPage.sheet.rowCount || col > renderPage.sheet.columnCount) {
        return null;
      }
      const mergedRange = findMergedRangeForCell(renderPage, row, col);
      return getMergedAwareCellRange(row, col, mergedRange);
    };
    const handlePointerFieldDrop = (event: Event) => {
      const detail = (event as CustomEvent<FieldPointerDropDetail>).detail;
      const row = Number(detail?.row);
      const col = Number(detail?.col);
      if (!detail?.fieldId || !Number.isInteger(row) || !Number.isInteger(col)) return;
      if (row < 1 || col < 1 || row > renderPage.sheet.rowCount || col > renderPage.sheet.columnCount) return;

      const mergedRange = findMergedRangeForCell(renderPage, row, col);
      const cellSelectionRange = getMergedAwareCellRange(row, col, mergedRange);
      const cellLayout = getGridOffsetCellLayout(cellSelectionRange);

      setSelectedRange(cellSelectionRange, { row: cellSelectionRange.t, col: cellSelectionRange.l });
      setFieldDropGuideRange(null);
      const subTableFieldData: SubTableFieldDragData | null = detail.subTableId && detail.subTableField
        ? {
            subTableId: detail.subTableId,
            field: detail.subTableField,
          }
        : null;
      addDroppedFieldToCell(detail.fieldId, cellSelectionRange, cellLayout, subTableFieldData);
    };
    const handlePointerFieldHover = (event: Event) => {
      const detail = (event as CustomEvent<FieldPointerHoverDetail | null>).detail;
      const row = Number(detail?.row);
      const col = Number(detail?.col);

      if (!detail || !Number.isInteger(row) || !Number.isInteger(col)) {
        setFieldDropGuideRange(null);
        return;
      }

      setFieldDropGuideRange(resolveHoverRange(row, col));
    };

    ownerDocument.addEventListener(FIELD_POINTER_DROP_EVENT, handlePointerFieldDrop as EventListener);
    ownerDocument.addEventListener(FIELD_POINTER_HOVER_EVENT, handlePointerFieldHover as EventListener);
    return () => {
      ownerDocument.removeEventListener(FIELD_POINTER_DROP_EVENT, handlePointerFieldDrop as EventListener);
      ownerDocument.removeEventListener(FIELD_POINTER_HOVER_EVENT, handlePointerFieldHover as EventListener);
    };
  }, [addNodeFromFieldToCell, addNodeFromSubTableFieldToCell, columnOffsets, currentPage, displayPage, rowOffsets, setSelectedRange, showMessage]);
  useEffect(() => {
    cancelHoveredSubTableUpdate();
    setHoveredSubTableNodeId(null);
    setMultiSelectedRanges([]);
  }, [currentPage?.id]);
  const handleSheetKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (currentPage?.sheet.canvasMode !== 'sheet' || editingCell) {
      return;
    }
    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        void handleCopySelectedCells();
        return;
      }
      if (event.key.toLowerCase() === 'x') {
        event.preventDefault();
        if (selectedNodeId) {
          if (handleCutSelectedFieldNode()) {
            return;
          }
          return;
        }
        void handleCutSelectedCells();
        return;
      }
      if (event.key.toLowerCase() === 'v') {
        event.preventDefault();
        if (fieldNodeClipboardRef.current) {
          if (handlePasteSelectedFieldNode()) {
            return;
          }
          return;
        }
        void handlePasteSelectedCells();
        return;
      }
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && (selectedCell || selectedRange)) {
      event.preventDefault();
      clearSelectedCells();
      return;
    }
    if (!selectedCell) {
      return;
    }
    if (isPrintableCellInput(event.key)) {
      event.preventDefault();
      startEditingCell(selectedCell.row, selectedCell.col, event.key);
      return;
    }
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      startEditingCell(selectedCell.row, selectedCell.col);
    }
  };
  const syncWorkspaceViewportFromScroll = useCallback(() => {
    const element = workspaceScrollRef.current;
    const scrollTop = element?.scrollTop ?? 0;
    const height = element?.clientHeight ?? 0;
    const currentPageId = currentPage?.id;

    if (currentPageId) {
      const rawPreviewIndex = Math.floor(Math.max(0, scrollTop - paperViewportGapTop) / a4PaperHeightPx);
      const previewIndex = Math.min(pageMarkerCount - 1, Math.max(0, rawPreviewIndex));
      if (activePagePreviewIndexRef.current !== previewIndex) {
        activePagePreviewIndexRef.current = previewIndex;
        setActivePagePreviewIndex(currentPageId, previewIndex);
      }
    }

    setWorkspaceViewport((current) => (
      current.scrollTop === scrollTop && current.height === height
        ? current
        : { scrollTop, height }
    ));
  }, [a4PaperHeightPx, currentPage?.id, pageMarkerCount, paperViewportGapTop, setActivePagePreviewIndex]);

  const handleWorkspaceScroll = () => {
    if (workspaceScrollFrameRef.current !== null) return;
    workspaceScrollFrameRef.current = window.requestAnimationFrame(() => {
      workspaceScrollFrameRef.current = null;
      syncWorkspaceViewportFromScroll();
    });
  };
  const paperSettingItems = [
    { key: 'paper-mode', label: '画布模式' },
    { key: 'paper-orientation', label: '画布方向' },
    { key: 'paper-spacing', label: '画布间距' },
  ] as const;
  const orientationOptions = [
    { key: 'portrait', label: '纵向', width: 34, height: 48 },
    { key: 'landscape', label: '横向', width: 48, height: 34 },
  ] as const;
  const paperToggleItems = [
    { key: 'showGridLines', label: '网格线', active: currentPage?.sheet.showGridLines ?? true },
    { key: 'showRuler', label: '标尺', active: currentPage?.sheet.showRuler ?? true },
    { key: 'showHeader', label: '页眉', active: currentPage?.sheet.showHeader ?? false },
    { key: 'showFooter', label: '页脚', active: currentPage?.sheet.showFooter ?? false },
  ] as const;
  const spacingPopoverWidth = 292;
  const defaultPopoverWidth = 260;
  const getPopoverWidth = (key: CanvasSettingsPanel) => (key === 'paper-spacing' ? spacingPopoverWidth : defaultPopoverWidth);
  const handleOpenSettingsPanel = (key: CanvasSettingsPanel, event: ReactMouseEvent<HTMLButtonElement>) => {
    const containerRect = canvasSettingsRef.current?.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();
    if (!containerRect) return;
    const popoverWidth = getPopoverWidth(key);
    const center = targetRect.left - containerRect.left + targetRect.width / 2;
    const left = Math.min(
      Math.max(0, center - popoverWidth / 2),
      Math.max(0, containerRect.width - popoverWidth),
    );
    setSettingsPopover((current) => (current?.key === key
      ? null
      : {
          key,
          left,
          width: popoverWidth,
          center,
        }));
  };
  const canvasSettingsFloating = (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        height: 0,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <Box
        ref={canvasSettingsRef}
        data-canvas-settings-floating="true"
        data-paper-settings-floating="true"
        sx={{
          position: 'absolute',
          top: floatingSettingsTop,
          right: 16,
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          flexDirection: 'row',
          px: 0.75,
          py: 0.75,
          borderRadius: 2.5,
          border: '1px solid rgba(226, 232, 240, 0.95)',
          bgcolor: '#fff',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.10)',
          overflow: 'visible',
        }}
      >
        {paperSettingsOpen ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#fff',
            }}
          >
            <Stack direction="row" spacing={0.75}>
              {paperSettingItems.map((item) => (
                <Button
                  key={item.key}
                  onClick={(event) => handleOpenSettingsPanel(item.key, event)}
                  sx={{
                    minWidth: 0,
                    height: 28,
                    px: 0.875,
                    borderRadius: 1.5,
                    border: settingsPopover?.key === item.key ? '1px solid #6f78ff' : '1px solid #dbe3ee',
                    color: settingsPopover?.key === item.key ? '#4f46e5' : '#475569',
                    bgcolor: settingsPopover?.key === item.key ? 'rgba(111, 120, 255, 0.10)' : '#fff',
                    fontSize: 12,
                    fontWeight: settingsPopover?.key === item.key ? 700 : 500,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: settingsPopover?.key === item.key ? 'rgba(111, 120, 255, 0.14)' : '#f8fafc',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
            <Box
              sx={{
                alignSelf: 'center',
                width: '1px',
                height: 12,
                mx: '6px',
                bgcolor: '#e2e8f0',
              }}
            />
            <Stack direction="row" spacing={0.75}>
              {paperToggleItems.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  data-paper-toggle-key={item.key}
                  data-paper-toggle-active={item.active ? 'true' : 'false'}
                  onClick={() => updateCurrentPageSheet({ [item.key]: !item.active })}
                  sx={{
                    minWidth: 0,
                    height: 28,
                    px: 0.875,
                    borderRadius: 1.5,
                    border: item.active ? '1px solid #6f78ff' : '1px solid #dbe3ee',
                    color: item.active ? '#4f46e5' : '#475569',
                    bgcolor: item.active ? 'rgba(111, 120, 255, 0.10)' : '#fff',
                    fontSize: 12,
                    fontWeight: item.active ? 700 : 500,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: item.active ? 'rgba(111, 120, 255, 0.14)' : '#f8fafc',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
            <Box
              sx={{
                alignSelf: 'center',
                width: '1px',
                height: 12,
                mx: '6px',
                bgcolor: '#e2e8f0',
              }}
            />
          </Box>
        ) : null}
        <Button
          data-paper-settings-toggle="true"
          onClick={() => {
            setPaperSettingsOpen((value) => {
              const nextValue = !value;
              if (!nextValue) {
                setSettingsPopover(null);
              }
              return nextValue;
            });
          }}
          startIcon={<SettingsOutlined fontSize="small" />}
          sx={{
            minWidth: 0,
            minHeight: 30,
            px: 1,
            borderRadius: 1.5,
            color: '#334155',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            bgcolor: paperSettingsOpen ? '#eef2f7' : '#fff',
            '&:hover': {
              bgcolor: paperSettingsOpen ? '#eef2f7' : '#f8fafc',
            },
            '& .MuiButton-startIcon': {
              mr: 0.5,
            },
          }}
        >
          画布设置
        </Button>
        {paperSettingsOpen && settingsPopover ? (
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: settingsPopover.left,
              width: settingsPopover.width,
              p: 2,
              borderRadius: 3,
              border: '1px solid rgba(226, 232, 240, 0.95)',
              bgcolor: '#fff',
              boxShadow: '0 18px 42px rgba(15, 23, 42, 0.16)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -8,
                left: Math.max(12, Math.min(settingsPopover.width - 28, settingsPopover.center - settingsPopover.left - 8)),
                width: 16,
                height: 16,
                bgcolor: '#fff',
                borderTop: '1px solid rgba(226, 232, 240, 0.95)',
                borderLeft: '1px solid rgba(226, 232, 240, 0.95)',
                transform: 'rotate(45deg)',
              },
            }}
          >
            {settingsPopover.key === 'paper-mode' ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25}>
                  <Button
                    onClick={() => {
                      updateCurrentPageSheet({ paperMode: 'table', canvasMode: 'sheet' });
                      setSettingsPopover(null);
                    }}
                    sx={{
                      flex: 1,
                      height: 40,
                      borderRadius: 2,
                      border: paperMode === 'table' ? '1px solid #6f78ff' : '1px solid #dbe3ee',
                      bgcolor: paperMode === 'table' ? 'rgba(111, 120, 255, 0.10)' : '#fff',
                      color: paperMode === 'table' ? '#4f46e5' : '#475569',
                      fontWeight: paperMode === 'table' ? 700 : 500,
                    }}
                  >
                    表格模式
                  </Button>
                  <Button
                    onClick={() => {
                      updateCurrentPageSheet({ paperMode: 'free', canvasMode: 'paper' });
                      setSettingsPopover(null);
                    }}
                    sx={{
                      flex: 1,
                      height: 40,
                      borderRadius: 2,
                      border: paperMode === 'free' ? '1px solid #6f78ff' : '1px solid #dbe3ee',
                      bgcolor: paperMode === 'free' ? 'rgba(111, 120, 255, 0.10)' : '#fff',
                      color: paperMode === 'free' ? '#4f46e5' : '#475569',
                      fontWeight: paperMode === 'free' ? 700 : 500,
                    }}
                  >
                    自由模式
                  </Button>
                </Stack>
              </Stack>
            ) : null}
            {settingsPopover.key === 'paper-orientation' ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  {orientationOptions.map((item) => {
                    const active = paperOrientation === item.key;
                    return (
                      <Box key={item.key} sx={{ flex: 1, textAlign: 'center' }}>
                        <Button
                          onClick={() => {
                            updateCurrentPageSheet({ paperOrientation: item.key });
                            setSettingsPopover(null);
                          }}
                          sx={{
                            width: '100%',
                            height: 74,
                            borderRadius: 1.5,
                            border: active ? '1px solid #6f78ff' : '1px solid #dbe3ee',
                            bgcolor: active ? 'rgba(111, 120, 255, 0.10)' : '#fff',
                          }}
                        >
                          <Box
                            sx={{
                              width: item.width,
                              height: item.height,
                              border: active ? '2px solid #6f78ff' : '2px solid #cfd6df',
                              borderRadius: 0.75,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: active ? '#4f46e5' : '#94a3b8',
                              fontSize: 22,
                              fontWeight: 700,
                            }}
                          >
                            A
                          </Box>
                        </Button>
                        <Box sx={{ mt: 1, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#4f46e5' : '#475569' }}>
                          {item.label}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            ) : null}
            {settingsPopover.key === 'paper-spacing' ? (
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 164,
                    borderRadius: 2,
                    bgcolor: '#f7f9fc',
                  }}
                >
                  <TextField
                    type="text"
                    size="small"
                    value={paperMarginTopMm}
                    onChange={(event) => updateCurrentPageSheet({ paperMarginTopMm: parseMarginInput(event.target.value) })}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 78,
                      '& .MuiInputBase-root': {
                        height: 30,
                        bgcolor: '#fff',
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                      '& input': {
                        py: 0.5,
                        textAlign: 'center',
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ mr: 0, '& .MuiTypography-root': { fontSize: 12, color: '#64748b' } }}>mm</InputAdornment>,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                  <TextField
                    type="text"
                    size="small"
                    value={paperMarginRightMm}
                    onChange={(event) => updateCurrentPageSheet({ paperMarginRightMm: parseMarginInput(event.target.value) })}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: 10,
                      transform: 'translateY(-50%)',
                      width: 78,
                      '& .MuiInputBase-root': {
                        height: 30,
                        bgcolor: '#fff',
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                      '& input': {
                        py: 0.5,
                        textAlign: 'center',
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ mr: 0, '& .MuiTypography-root': { fontSize: 12, color: '#64748b' } }}>mm</InputAdornment>,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                  <TextField
                    type="text"
                    size="small"
                    value={paperMarginBottomMm}
                    onChange={(event) => updateCurrentPageSheet({ paperMarginBottomMm: parseMarginInput(event.target.value) })}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 78,
                      '& .MuiInputBase-root': {
                        height: 30,
                        bgcolor: '#fff',
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                      '& input': {
                        py: 0.5,
                        textAlign: 'center',
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ mr: 0, '& .MuiTypography-root': { fontSize: 12, color: '#64748b' } }}>mm</InputAdornment>,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                  <TextField
                    type="text"
                    size="small"
                    value={paperMarginLeftMm}
                    onChange={(event) => updateCurrentPageSheet({ paperMarginLeftMm: parseMarginInput(event.target.value) })}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 10,
                      transform: 'translateY(-50%)',
                      width: 78,
                      '& .MuiInputBase-root': {
                        height: 30,
                        bgcolor: '#fff',
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                      '& input': {
                        py: 0.5,
                        textAlign: 'center',
                      },
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ mr: 0, '& .MuiTypography-root': { fontSize: 12, color: '#64748b' } }}>mm</InputAdornment>,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 42,
                      right: 92,
                      bottom: 42,
                      left: 92,
                      border: '1px solid #dbe3ee',
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.65)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: `${54 + paperMarginTopMm}px`,
                      right: `${100 + paperMarginRightMm}px`,
                      bottom: `${54 + paperMarginBottomMm}px`,
                      left: `${100 + paperMarginLeftMm}px`,
                      border: '1px dashed #d5dbea',
                      borderRadius: 1,
                      bgcolor: '#fff',
                    }}
                  />
                </Box>
              </Stack>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handleMouseUp = () => {
      if (cellDragFrameRef.current !== null) {
        window.cancelAnimationFrame(cellDragFrameRef.current);
        cellDragFrameRef.current = null;
      }
      if (sheetResizeDragFrameRef.current !== null) {
        window.cancelAnimationFrame(sheetResizeDragFrameRef.current);
        sheetResizeDragFrameRef.current = null;
      }
      if (rowResizeDragFrameRef.current !== null) {
        window.cancelAnimationFrame(rowResizeDragFrameRef.current);
        rowResizeDragFrameRef.current = null;
      }
      commitPendingCellRangeDrag();
      commitPendingSheetResizeDrag();
      commitPendingRowResizeDrag();
      setDragState(null);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.type === 'cell') {
        const cellSelectionRange = findCellRangeAtClientPoint(event.clientX, event.clientY);
        if (cellSelectionRange) {
          scheduleCellRangeDrag(cellSelectionRange, dragState);
        }
      }

      if (dragState.type === 'resize-column') {
        const nextWidth = dragState.startWidth + event.clientX - dragState.startX;
        scheduleSheetResizeDrag({ type: 'column', col: dragState.startCol, width: nextWidth });
      }

      if (dragState.type === 'resize-row') {
        const nextHeight = dragState.startHeight + event.clientY - dragState.startY;
        scheduleRowResizeDragPreview(dragState.startRow, nextHeight);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);

    if (dragState.type === 'cell' || dragState.type === 'resize-column' || dragState.type === 'resize-row') {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragState, currentPage, setSelectedRange, setSheetColumnWidth, setSheetRowHeight]);

  useEffect(() => () => {
    wordTablePointerCleanupRef.current?.();
    wordTableCellSelectionCleanupRef.current?.();
    if (workspaceScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workspaceScrollFrameRef.current);
    }
    if (cellDragFrameRef.current !== null) {
      window.cancelAnimationFrame(cellDragFrameRef.current);
    }
    if (sheetResizeDragFrameRef.current !== null) {
      window.cancelAnimationFrame(sheetResizeDragFrameRef.current);
    }
    if (rowResizeDragFrameRef.current !== null) {
      window.cancelAnimationFrame(rowResizeDragFrameRef.current);
    }
    if (hoveredSubTableFrameRef.current !== null) {
      window.cancelAnimationFrame(hoveredSubTableFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isFreeCanvas) {
      setFreeCanvasMeasuredHeight(480);
      return undefined;
    }

    const element = freeCanvasBodyRef.current;
    if (!element) {
      return undefined;
    }

    const syncHeight = () => {
      setFreeCanvasMeasuredHeight(Math.max(480, Math.ceil(element.scrollHeight)));
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [currentPage?.id, currentPage?.nodes, isFreeCanvas]);

  useEffect(() => {
    const handleCommonComponentInsert = (event: Event) => {
      const componentId = (event as CustomEvent<{ componentId?: CommonCanvasComponentId }>).detail?.componentId;
      if (componentId) insertCommonComponentAtClientPoint(componentId);
    };

    document.addEventListener(COMMON_COMPONENT_INSERT_EVENT, handleCommonComponentInsert);
    return () => document.removeEventListener(COMMON_COMPONENT_INSERT_EVENT, handleCommonComponentInsert);
  }, [insertCommonComponentAtClientPoint]);

  useEffect(() => {
    activePagePreviewIndexRef.current = currentPage ? activePagePreviewIndexes[currentPage.id] ?? 0 : 0;
  }, [activePagePreviewIndexes, currentPage?.id]);

  useEffect(() => () => {
    if (workspaceScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workspaceScrollFrameRef.current);
      workspaceScrollFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentPage) {
      return;
    }
    setPagePreviewCount(currentPage.id, pageMarkerCount);
    syncWorkspaceViewportFromScroll();
  }, [currentPage, pageMarkerCount, setPagePreviewCount, syncWorkspaceViewportFromScroll]);

  useEffect(() => {
    if (!currentPage || pagePreviewScrollTarget?.pageId !== currentPage.id) {
      return;
    }

    const requestId = pagePreviewScrollTarget.requestId;
    const previewIndex = Math.min(pageMarkerCount - 1, Math.max(0, pagePreviewScrollTarget.previewIndex));
    workspaceScrollRef.current?.scrollTo({
      top: paperViewportGapTop + previewIndex * a4PaperHeightPx,
      behavior: 'auto',
    });
    activePagePreviewIndexRef.current = previewIndex;
    setActivePagePreviewIndex(currentPage.id, previewIndex);
    syncWorkspaceViewportFromScroll();
    clearPagePreviewScrollTarget(requestId);
  }, [
    a4PaperHeightPx,
    clearPagePreviewScrollTarget,
    currentPage,
    pageMarkerCount,
    pagePreviewScrollTarget,
    paperViewportGapTop,
    setActivePagePreviewIndex,
    syncWorkspaceViewportFromScroll,
  ]);

  useEffect(() => {
    setEditingCell(null);
  }, [currentPage?.id, currentPage?.sheet.canvasMode]);

  useEffect(() => {
    if (!paperSettingsOpen) {
      setSettingsPopover(null);
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (canvasSettingsRef.current?.contains(event.target as Node)) {
        return;
      }
      setPaperSettingsOpen(false);
      setSettingsPopover(null);
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [paperSettingsOpen]);

  const openContextMenu = (axis: MenuAxis, event: ReactMouseEvent) => {
    event.preventDefault();
    setInsertMenuCount('1');
    setSubTableMenuAnchorEl(null);
    setMenuState({
      axis,
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };
  const getColumnContextMenuRange = (col: number) => {
    if (!normalizedRange || col < normalizedRange.l || col > normalizedRange.r) {
      return { l: col, r: col };
    }

    return { l: normalizedRange.l, r: normalizedRange.r };
  };
  const getRowContextMenuRange = (row: number) => {
    if (!normalizedRange || row < normalizedRange.t || row > normalizedRange.b) {
      return { t: row, b: row };
    }

    return { t: normalizedRange.t, b: normalizedRange.b };
  };
  const openColumnContextMenu = (col: number, event: ReactMouseEvent) => {
    const columnMenuRange = getColumnContextMenuRange(col);
    selectColumnRange(columnMenuRange.l, columnMenuRange.r);
    openContextMenu('column', event);
  };
  const openRowContextMenu = (row: number, event: ReactMouseEvent) => {
    const rowMenuRange = getRowContextMenuRange(row);
    selectRowRange(rowMenuRange.t, rowMenuRange.b);
    openContextMenu('row', event);
  };
  const openCellContextMenu = (cellSelectionRange: CanvasSelectionRange, event: ReactMouseEvent) => {
    const keepSelectedRange = Boolean(
      normalizedRange
      && rangeContainsRange(normalizedRange, cellSelectionRange),
    );
    const keepMultiSelectedRanges = normalizedMultiSelectedRanges.some((range) => rangeContainsRange(range, cellSelectionRange));
    if (!keepSelectedRange) {
      if (!keepMultiSelectedRanges) {
        setMultiSelectedRanges([]);
      }
      setSelectedRange(cellSelectionRange, { row: cellSelectionRange.t, col: cellSelectionRange.l });
    }
    openContextMenu('cell', event);
  };
  const handleCellFieldContextMenu = (cellSelectionRange: CanvasSelectionRange, event: ReactMouseEvent<HTMLElement>) => {
    sheetInteractionRef.current?.focus();
    openCellContextMenu(cellSelectionRange, event);
  };
  const getShiftColumnSelectionAnchor = () => {
    if (!normalizedRange || !currentPage) return null;
    return normalizedRange.t === 1 && normalizedRange.b === currentPage.sheet.rowCount
      ? normalizedRange.l
      : null;
  };
  const getShiftRowSelectionAnchor = () => {
    if (!normalizedRange || !currentPage) return null;
    return normalizedRange.l === 1 && normalizedRange.r === currentPage.sheet.columnCount
      ? normalizedRange.t
      : null;
  };
  const handleColumnHeaderMouseDown = (col: number, event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    setMultiSelectedRanges([]);
    const startCol = event.shiftKey ? (getShiftColumnSelectionAnchor() ?? col) : col;
    selectColumnRange(startCol, col);
    setDragState({ type: 'column', startCol });
  };
  const handleRowHeaderMouseDown = (row: number, event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    setMultiSelectedRanges([]);
    const startRow = event.shiftKey ? (getShiftRowSelectionAnchor() ?? row) : row;
    selectRowRange(startRow, row);
    setDragState({ type: 'row', startRow });
  };

  const closeContextMenu = () => {
    setSubTableMenuAnchorEl(null);
    setMenuState(null);
  };
  const handleSetSubTableField = (field: ModelField) => {
    if (!normalizedRange) return;
    addNodeFromFieldToRange(field.id, normalizedRange, getFieldDropCellLayout(normalizedRange));
    closeContextMenu();
  };
  const handleSubTableDataGroup = () => {
    if (!selectedSubTableNode || !normalizedRange) return;
    setSubTableRecordTemplateFromRange(selectedSubTableNode.id, normalizedRange);
    closeContextMenu();
  };
  const getQuickAddFieldRanges = () => {
    const rangeMap = new Map<string, CanvasSelectionRange>();
    (normalizedMultiSelectedRanges.length ? normalizedMultiSelectedRanges : normalizedRange ? [normalizedRange] : [])
      .forEach((range) => {
        const normalized = normalizeRange(range);
        rangeMap.set(rangeKey(normalized), normalized);
      });
    return Array.from(rangeMap.values());
  };
  const inferQuickAddFieldType = (value: string): FieldType => {
    const text = value.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return 'number';
    if (/^\d{4}[-/年]\d{1,2}(?:[-/月]\d{1,2}日?)?(?:\s+\d{1,2}:\d{1,2}(?::\d{1,2})?)?$/.test(text)) return 'datetime';
    if (/图片|照片|图像|image|photo/i.test(text)) return 'image';
    if (/附件|文件|上传|attachment|file/i.test(text)) return 'attachment';
    if (/签名|签字|signature/i.test(text)) return 'signature';
    return 'text';
  };
  const getQuickAddFieldName = (row: number, col: number, index: number) => {
    const cellValue = currentPage?.cells[getCellKey(row, col)]?.value;
    const text = String(cellValue ?? '').trim().replace(/\s+/g, ' ');
    if (text) {
      return text.slice(0, 24);
    }
    const cellLabel = `${getColumnLabel(col)}${row}`;
    return index === 0 ? `字段${cellLabel}` : `字段${cellLabel}_${index + 1}`;
  };
  const getQuickAddFieldCells = () => {
    if (!currentPage) return [];

    const ranges = getQuickAddFieldRanges();
    const cellMap = new Map<string, { row: number; col: number }>();
    ranges.forEach((range) => {
      for (let row = range.t; row <= range.b; row += 1) {
        for (let col = range.l; col <= range.r; col += 1) {
          const mergedRange = findMergedRangeForCell(currentPage, row, col);
          if (mergedRange && (mergedRange.t !== row || mergedRange.l !== col)) continue;
          cellMap.set(getCellKey(row, col), { row, col });
        }
      }
    });
    return Array.from(cellMap.values())
      .sort((first, second) => first.row - second.row || first.col - second.col);
  };
  const getQuickAddFieldDrafts = () => (
    getQuickAddFieldCells()
      .map((cell, index) => {
        const name = getQuickAddFieldName(cell.row, cell.col, index);
        return {
          id: `${cell.row}:${cell.col}`,
          row: cell.row,
          col: cell.col,
          sourceName: name,
          name,
          type: inferQuickAddFieldType(name),
          description: '',
        };
      })
  );
  const getDefaultQuickAddTarget = (drafts: QuickAddFieldDraft[]): { target: QuickAddFieldTarget; subTableId: string } => {
    if (!currentPage || !drafts.length) {
      return { target: 'main', subTableId: quickAddSubTableTargetFields[0]?.id ?? '' };
    }
    const firstCellRange = createSingleCellRange(drafts[0].row, drafts[0].col);
    const containingSubTable = quickAddSubTableTargetFields.find((field) => {
      const subTableRange = findSubTableNodeRange(currentPage, field.id);
      return Boolean(subTableRange && rangeContainsRange(subTableRange, firstCellRange));
    });
    return {
      target: containingSubTable ? 'subTable' : 'main',
      subTableId: containingSubTable?.id ?? quickAddSubTableTargetFields[0]?.id ?? '',
    };
  };
  const handleOpenQuickAddFieldsDialog = () => {
    if (!currentPage) {
      closeContextMenu();
      return;
    }

    const drafts = getQuickAddFieldDrafts();
    if (!drafts.length) {
      closeContextMenu();
      return;
    }

    const defaultTarget = getDefaultQuickAddTarget(drafts);
    setQuickAddFieldDrafts(resolveQuickAddFieldDraftNames(drafts, defaultTarget.target, defaultTarget.subTableId));
    setQuickAddFieldTarget(defaultTarget.target);
    setQuickAddFieldSubTableId(defaultTarget.subTableId);
    setQuickAddFieldDialogOpen(true);
    closeContextMenu();
  };
  const closeQuickAddFieldDialog = () => {
    setQuickAddFieldDialogOpen(false);
    setQuickAddFieldDrafts([]);
  };
  const handleQuickAddTargetChange = (value: string) => {
    if (value === 'main') {
      setQuickAddFieldTarget('main');
      setQuickAddFieldDrafts((drafts) => resolveQuickAddFieldDraftNames(drafts, 'main', quickAddFieldSubTableId));
      return;
    }
    if (value.startsWith('subTable:')) {
      const subTableId = value.slice('subTable:'.length);
      setQuickAddFieldTarget('subTable');
      setQuickAddFieldSubTableId(subTableId);
      setQuickAddFieldDrafts((drafts) => resolveQuickAddFieldDraftNames(drafts, 'subTable', subTableId));
    }
  };
  const updateQuickAddFieldDraft = (id: string, patch: Partial<QuickAddFieldDraft>) => {
    setQuickAddFieldDrafts((drafts) => drafts.map((draft) => (
      draft.id === id ? { ...draft, ...patch, sourceName: patch.name ?? draft.sourceName } : draft
    )));
  };
  const removeQuickAddFieldDraft = (id: string) => {
    setQuickAddFieldDrafts((drafts) => drafts.filter((draft) => draft.id !== id));
  };
  const handleConfirmQuickAddFields = () => {
    const fields = quickAddFieldDrafts
      .map((draft) => ({
        name: draft.name.trim(),
        type: draft.type,
        description: draft.description.trim(),
      }))
      .filter((field) => field.name);
    if (!fields.length) return;

    const createdFields = quickAddFieldTarget === 'subTable'
      ? addSubTableFields(quickAddFieldSubTableId, fields)
      : addFields(fields);
    if (!createdFields.length) {
      showMessage(quickAddFieldTarget === 'subTable' ? '请选择可添加字段的子表' : '未添加字段', 'warning');
      return;
    }

    setActiveCanvasRail('fields');
    showMessage(`已快速添加 ${createdFields.length} 个字段`, 'success');
    closeQuickAddFieldDialog();
  };

  const clearSelectionAfterSheetStructureChange = () => {
    clearSelection();
  };
  const getCellStructureActionRange = () => {
    const fallbackRange = normalizedRange ?? { t: 1, l: 1, b: 1, r: 1 };
    const ranges = normalizedMultiSelectedRanges.length ? normalizedMultiSelectedRanges : [fallbackRange];
    if (ranges.length > 1 && !rangesFormContinuousRectangle(ranges)) {
      return fallbackRange;
    }

    return ranges.reduce<CanvasSelectionRange>((current, range) => ({
      t: Math.min(current.t, range.t),
      l: Math.min(current.l, range.l),
      b: Math.max(current.b, range.b),
      r: Math.max(current.r, range.r),
    }), normalizeRange(ranges[0]));
  };

  const handleMenuAction = (action: SheetMenuAction) => {
    if (!menuState || !normalizedRange || !currentPage) {
      closeContextMenu();
      return;
    }

    const insertCount = parseInsertMenuCount(insertMenuCount);
    const cellStructureActionRange = getCellStructureActionRange();
    let didChangeSheetStructure = false;

    if (menuState.axis === 'cell' && action === 'quick-add-fields') {
      handleOpenQuickAddFieldsDialog();
      return;
    }

    if (menuState.axis === 'column' || menuState.axis === 'cell') {
      if (action === 'insert-before') {
        insertSheetColumns(normalizedRange.l, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-after') {
        insertSheetColumns(normalizedRange.r + 1, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-column-before') {
        insertSheetColumns(normalizedRange.l, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-column-after') {
        insertSheetColumns(normalizedRange.r + 1, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'delete') {
        deleteSheetColumns(normalizedRange.l, normalizedRange.r);
        didChangeSheetStructure = true;
      }
      if (action === 'delete-column') {
        deleteSheetColumns(cellStructureActionRange.l, cellStructureActionRange.r);
        didChangeSheetStructure = true;
      }
      if (action === 'resize') {
        const nextWidth = parsePromptNumber('设置列宽', rawColumnWidths[normalizedRange.l - 1] ?? currentPage.sheet.defaultColumnWidth);
        if (nextWidth !== null) {
          setSheetColumnWidth(normalizedRange.l, normalizedRange.r, nextWidth);
        }
      }
      if (action === 'auto-size') {
        const nextColumnWidths = rawColumnWidths.map((width, index) => {
          const col = index + 1;
          return col >= normalizedRange.l && col <= normalizedRange.r
            ? autoFitSheetColumnWidth(currentPage, col)
            : width;
        });
        updateCurrentPageSheet({ columnWidths: nextColumnWidths });
      }
    }

    if (menuState.axis === 'row' || menuState.axis === 'cell') {
      if (action === 'insert-before') {
        insertSheetRows(normalizedRange.t, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-after') {
        insertSheetRows(normalizedRange.b + 1, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-row-before') {
        insertSheetRows(normalizedRange.t, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'insert-row-after') {
        insertSheetRows(normalizedRange.b + 1, insertCount);
        didChangeSheetStructure = true;
      }
      if (action === 'delete') {
        deleteSheetRows(normalizedRange.t, normalizedRange.b);
        didChangeSheetStructure = true;
      }
      if (action === 'delete-row') {
        deleteSheetRows(cellStructureActionRange.t, cellStructureActionRange.b);
        didChangeSheetStructure = true;
      }
      if (action === 'resize') {
        const nextHeight = parsePromptNumber('设置行高', rowHeights[normalizedRange.t - 1] ?? currentPage.sheet.defaultRowHeight);
        if (nextHeight !== null) {
          setSheetRowHeight(normalizedRange.t, normalizedRange.b, nextHeight);
        }
      }
      if (action === 'auto-size') {
        const nextRowHeights = rowHeights.map((height, index) => {
          const row = index + 1;
          return row >= normalizedRange.t && row <= normalizedRange.b
            ? measureSheetRowHeightFromDom(currentPage, row, sheetInteractionRef.current) ?? autoFitSheetRowHeight(currentPage, row, rawColumnWidths)
            : height;
        });
        updateCurrentPageSheet({ rowHeights: nextRowHeights });
      }
    }

    if (menuState.axis === 'cell') {
      if (action === 'merge-cells') {
        mergeSelectedCells();
      }
      if (action === 'split-cells') {
        splitSelectedCells();
      }
    }

    if (didChangeSheetStructure) {
      clearSelectionAfterSheetStructureChange();
    }

    closeContextMenu();
  };

  const renderInsertCountInput = (action: InsertMenuAction) => (
    <TextField
      data-sheet-menu-insert-count="true"
      data-sheet-menu-insert-action={action}
      size="small"
      variant="outlined"
      value={insertMenuCount}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          event.preventDefault();
          handleMenuAction(action);
        }
      }}
      onChange={(event) => {
        setInsertMenuCount(normalizeInsertMenuCountInput(event.target.value));
      }}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
      }}
      sx={{
        width: 48,
        height: 32,
        flexShrink: 0,
        '& .MuiOutlinedInput-root': {
          height: 30,
          minHeight: 0,
          borderRadius: '6px',
        },
        '& .MuiInputBase-input': {
          height: 30,
          p: 0,
          textAlign: 'center',
          fontSize: 12,
          lineHeight: '30px',
        },
      }}
    />
  );

  const renderDangerMenuItem = (item: DeleteMenuItemConfig, withDivider: boolean) => (
    <MenuItem
      key={item.action}
      data-sheet-menu-delete-group={withDivider ? 'true' : undefined}
      data-sheet-menu-action={item.action}
      disabled={item.disabled}
      onClick={() => handleMenuAction(item.action)}
      sx={{
        ...(withDivider ? {
          mt: 0.5,
          pt: 1,
          borderTop: '1px solid #e5e7eb',
        } : {}),
        color: '#d32f2f',
        '&.Mui-disabled': {
          color: 'rgba(211, 47, 47, 0.42)',
        },
        '&:hover': {
          bgcolor: '#fff5f5',
        },
      }}
    >
      {item.label}
    </MenuItem>
  );

  const renderDeleteMenuGroup = (items: DeleteMenuItemConfig[]) => (
    items.map((item, index) => renderDangerMenuItem(item, index === 0))
  );
  const renderSetSubTableMenu = () => {
    if (!canSetSubTableMenuSelection) return null;

    if (availableSubTableFields.length === 1) {
      return (
        <MenuItem
          data-sheet-menu-action="set-sub-table"
          onClick={() => handleSetSubTableField(availableSubTableFields[0])}
        >设为子表</MenuItem>
      );
    }

    return (
      <MenuItem
        data-sheet-menu-action="set-sub-table"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setSubTableMenuAnchorEl(event.currentTarget);
        }}
        onMouseEnter={(event) => setSubTableMenuAnchorEl(event.currentTarget)}
        sx={{
          minWidth: 168,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box component="span" sx={{ flex: 1 }}>设为子表</Box>
        <Box component="span" sx={{ color: '#8c96a6' }}>›</Box>
      </MenuItem>
    );
  };

  if (!currentPage) {
    return null;
  }

  const sheetRenderPage = displayPage ?? currentPage;
  const activeMenuAxis = menuState?.axis ?? null;
  const canDeleteMenuColumns = currentPage.sheet.columnCount > 1;
  const canDeleteMenuRows = currentPage.sheet.rowCount > 1;
  const isDiscontinuousCellMenuSelection = Boolean(
    activeMenuAxis === 'cell'
    && normalizedMultiSelectedRanges.length > 1
    && !rangesFormContinuousRectangle(normalizedMultiSelectedRanges),
  );
  const canShowCellStructureMenu = activeMenuAxis !== 'cell' || !isDiscontinuousCellMenuSelection;
  const canDeleteMenuSelection = activeMenuAxis === 'column'
    ? canDeleteMenuColumns
    : canDeleteMenuRows;
  const hasMergedCellsInSelection = Boolean(
    normalizedRange
    && displayPage?.mergedCells.some((range) => rangesIntersect(range, normalizedRange)),
  );
  const isSingleMergedCellSelection = Boolean(
    normalizedRange
    && displayPage?.mergedCells.some((range) => rangesEqual(range, normalizedRange)),
  );
  const canMergeMenuSelection = Boolean(
    activeMenuAxis === 'cell'
    && isMultiCellRange(normalizedRange)
    && !isSingleMergedCellSelection
    && !selectionCrossesSubTableBoundary
  );
  const canSplitMenuSelection = Boolean(
    activeMenuAxis === 'cell'
    && hasMergedCellsInSelection,
  );
  const canSetSubTableMenuSelection = Boolean(
    activeMenuAxis === 'cell'
    && isMultiCellRange(normalizedRange)
    && !isSubTableRangeSelection
    && availableSubTableFields.length,
  );
  const canGroupSubTableSelection = Boolean(
    activeMenuAxis === 'cell'
    && selectedSubTableRegion?.repeat.type === 'fixed'
    && !selectedSubTableRegion.recordTemplate.groupRange
    && isMultiCellRange(normalizedRange),
  );
  const shouldShowQuickAddFieldsDivider = Boolean(
    activeMenuAxis === 'cell'
    && (canShowCellStructureMenu || canMergeMenuSelection || canSplitMenuSelection),
  );
  const isColumnInSelectedRanges = (col: number) => (
    normalizedMultiSelectedRanges.some((range) => col >= range.l && col <= range.r)
  );
  const isRowInSelectedRanges = (row: number) => (
    normalizedMultiSelectedRanges.some((range) => row >= range.t && row <= range.b)
  );

  const renderImportedGrid = (mode: 'sheet' | 'paper') => (
    <Box
      sx={{
        position: mode === 'paper' ? 'absolute' : 'relative',
        top: mode === 'paper' ? gridOffsetTop : undefined,
        left: mode === 'paper' ? 0 : undefined,
        width: sheetWidth,
        display: 'grid',
        gridTemplateColumns: columnTemplate,
        gridTemplateRows: rowTemplate,
      }}
    >
      {visibleRows.flatMap((row) => columns.map((col) => {
        const key = getCellKey(row, col);
        if (mergedCellMaps.skipSet.has(key)) {
          return null;
        }

        const cell = sheetRenderPage.cells[key];
        const mergedRange = mergedCellMaps.startMap.get(key);
        const cellSelectionRange = getMergedAwareCellRange(row, col, mergedRange);
        const isSelected = selectedCell?.row === row && selectedCell?.col === col;
        const shouldShowSingleCellSelection = isSelected && !isMultiCellRange(normalizedRange);
        const isRangeActive = isInRange(normalizedRange, row, col) || normalizedMultiSelectedRanges.some((range) => isInRange(range, row, col));
        const isEditing = currentPage.sheet.canvasMode === 'sheet' && editingCell?.row === row && editingCell?.col === col;
        const verticalAlign = cell?.style?.verticalAlign;
        const textAlign = cell?.style?.textAlign;
        const hasMultilineValue = hasMultilineCellValue(cell?.value);
        const cellBorder = cell?.border;
        const spanCols = mergedRange ? (mergedRange.r - mergedRange.l + 1) : 1;
        const spanRows = mergedRange ? (mergedRange.b - mergedRange.t + 1) : 1;
        const cellFontSize = resolveNumericStyle(cell?.style?.fontSize, DEFAULT_SHEET_FONT_SIZE);
        const cellContentWidth = sumSizes(displayColumnWidths, col, col + spanCols - 1) - getCellHorizontalPadding(cell);
        const plainOverflowWrap = hasPlainOverflowCellValue(cell?.value, cellContentWidth, cellFontSize);
        const shouldWrapCellText = hasMultilineValue || cell?.style?.whiteSpace === 'normal' || plainOverflowWrap || Boolean(mergedRange && hasSpecialWrapCellValue(cell?.value));
        const borderColor = String(cellBorder?.color ?? '#000000');
        const gridColor = '#d9dee7';

        return (
          <Box
            key={key}
            data-canvas-field-drop-cell="true"
            data-sheet-cell-focus="true"
            data-sheet-cell-row={row}
            data-sheet-cell-col={col}
            tabIndex={-1}
            onMouseDown={(event) => {
              if (event.button !== 0) return;
              event.currentTarget.focus();
              if ((event.metaKey || event.ctrlKey) && !event.altKey) {
                event.preventDefault();
                handleCommandCellSelection(cellSelectionRange);
                return;
              }
              startCellRangeDrag(cellSelectionRange);
            }}
            onDoubleClick={(event) => {
              event.currentTarget.focus();
              setMultiSelectedRanges([]);
              setSelectedRange(cellSelectionRange, { row: cellSelectionRange.t, col: cellSelectionRange.l });
              startEditingCell(cellSelectionRange.t, cellSelectionRange.l);
            }}
            onContextMenu={(event) => {
              event.currentTarget.focus();
              openCellContextMenu(cellSelectionRange, event);
            }}
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes('application/x-template-designer-field')) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
              setFieldDropGuideRange(cellSelectionRange);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setFieldDropGuideRange(null);
            }}
            onDrop={(event) => handleFieldDropOnCell(event, cellSelectionRange)}
            onKeyDown={(event) => {
              event.stopPropagation();
              handleSheetKeyDown(event);
            }}
            onMouseEnter={() => {
              scheduleHoveredSubTableUpdate(cellSelectionRange);
              if (dragState?.type !== 'cell') return;
              extendCellRangeDrag(cellSelectionRange, dragState);
            }}
            sx={{
              gridColumn: `${col} / span ${spanCols}`,
              gridRow: `${row} / span ${spanRows}`,
              display: 'flex',
              alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
              justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : textAlign === 'justify' ? 'flex-start' : 'flex-start',
              px: `${resolveNumericStyle(cell?.style?.paddingLeft, 8)}px`,
              py: `${resolveNumericStyle(cell?.style?.paddingTop, 4)}px`,
              pr: `${resolveNumericStyle(cell?.style?.paddingRight, resolveNumericStyle(cell?.style?.paddingLeft, 8))}px`,
              pb: `${resolveNumericStyle(cell?.style?.paddingBottom, resolveNumericStyle(cell?.style?.paddingTop, 4))}px`,
              borderLeft: shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'left') ? `1px solid ${borderColor}` : col === 1 && sheetRenderPage.sheet.showGridLines ? `1px solid ${gridColor}` : 'none',
              borderTop: shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'top') ? `1px solid ${borderColor}` : row === 1 && sheetRenderPage.sheet.showGridLines ? `1px solid ${gridColor}` : 'none',
              borderRight: shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'right') ? `1px solid ${borderColor}` : sheetRenderPage.sheet.showGridLines ? `1px solid ${gridColor}` : '1px solid transparent',
              borderBottom: shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'bottom') ? `1px solid ${borderColor}` : sheetRenderPage.sheet.showGridLines ? `1px solid ${gridColor}` : '1px solid transparent',
              bgcolor: shouldShowSingleCellSelection ? '#dbeafe' : isRangeActive ? '#eef5ff' : (cell?.style?.backgroundColor ? String(cell.style.backgroundColor) : '#fff'),
              boxShadow: shouldShowSingleCellSelection ? 'inset 0 0 0 2px #1274dd' : 'none',
              overflow: 'hidden',
              cursor: 'cell',
              color: String(cell?.style?.color ?? '#303133'),
              fontSize: resolveNumericStyle(cell?.style?.fontSize) || undefined,
              fontWeight: cell?.style?.fontWeight as string | undefined,
              fontStyle: cell?.style?.fontStyle as string | undefined,
              textDecoration: cell?.style?.textDecoration as string | undefined,
              whiteSpace: hasMultilineValue ? 'pre-wrap' : shouldWrapCellText ? 'normal' : 'nowrap',
              lineHeight: cell?.style?.lineHeight as string | number | undefined,
              fontFamily: cell?.style?.fontFamily as string | undefined,
              overflowWrap: shouldWrapCellText ? 'anywhere' : 'normal',
              wordBreak: 'break-word',
              transition: 'background-color 120ms ease',
              '&:hover': {
                bgcolor: shouldShowSingleCellSelection ? '#dbeafe' : isRangeActive ? '#eef5ff' : '#f8fbff',
              },
            }}
          >
            {isEditing ? (
              <TextField
                data-sheet-cell-editor="true"
                autoFocus
                multiline
                minRows={1}
                maxRows={8}
                variant="standard"
                value={editingCell?.draft ?? ''}
                onChange={(event) => {
                  const draft = event.target.value;
                  setEditingCell((current) => (current ? { ...current, draft } : current));
                }}
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onBlur={() => {
                  if (skipNextBlurCommitRef.current) {
                    skipNextBlurCommitRef.current = false;
                    return;
                  }
                  commitEditingCell(editingCell);
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelEditingCell();
                  }
                }}
                onFocus={(event) => {
                  event.target.select();
                }}
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  '& .MuiInputBase-root': {
                    height: '100%',
                    font: 'inherit',
                    color: 'inherit',
                    alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
                  },
                  '& .MuiInputBase-root.MuiInputBase-multiline': {
                    height: '100%',
                    maxHeight: '100%',
                    p: 0,
                    alignItems: 'flex-start',
                    overflow: 'hidden',
                  },
                  '& .MuiInputBase-input': {
                    p: 0,
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: textAlign === 'right' ? 'right' : textAlign === 'center' ? 'center' : 'left',
                  },
                  '& .MuiInputBase-inputMultiline': {
                    height: '100% !important',
                    maxHeight: '100%',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto !important',
                    resize: 'none',
                  },
                }}
              />
            ) : (
              <Box
                component="span"
                data-sheet-cell-content="true"
                sx={{
                  display: 'block',
                  width: '100%',
                  minWidth: 0,
                  textAlign: textAlign === 'right' ? 'right' : textAlign === 'center' ? 'center' : 'left',
                }}
              >
                {cell?.value ?? ''}
              </Box>
            )}
          </Box>
        );
      }))}
      {sheetRenderPage.images.map((image) => {
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
              left: image.layout.left,
              top: image.layout.top,
              width: image.layout.width,
              height: image.layout.height,
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        );
      })}
      {renderSelectionOutline('grid')}
      {renderFieldDropGuide('grid')}
    </Box>
  );

  const renderWordDocumentLayer = () => {
    const wordDocument = currentPage?.wordDocument;
    if (!wordDocument || !isFreeCanvas) return null;

    return (
      <Box
        data-word-document-layer="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        {wordDocument.blocks.map((block) => {
          if (block.type === 'paragraph') {
            return (
              <Box
                key={block.id}
                data-word-block="paragraph"
                contentEditable
                suppressContentEditableWarning
                onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => {
                  event.stopPropagation();
                  clearSelection();
                }}
                onBlur={(event: ReactFocusEvent<HTMLDivElement>) => {
                  updateWordParagraphText(block.id, event.currentTarget.innerText);
                }}
                sx={{
                  position: 'absolute',
                  left: block.layout.left,
                  top: block.layout.top,
                  width: block.layout.width,
                  minHeight: block.layout.height,
                  outline: 'none',
                  px: 0.5,
                  py: 0.25,
                  boxSizing: 'border-box',
                  cursor: 'text',
                  ...resolveWordTextSx(block.style),
                  '&:focus': {
                    boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.55)',
                    bgcolor: 'rgba(255, 255, 255, 0.72)',
                  },
                } as SxProps<Theme>}
              >
                {block.text}
              </Box>
            );
          }

          if (block.type === 'table') {
            const usesLegacyWordTableBorders = (block.borderEncodingVersion ?? wordDocument.borderEncodingVersion) !== 2;
            const defaultColumnWidths = fitWordTableColumnWidths(block);
            const sizePreview = wordTableSizePreview?.blockId === block.id ? wordTableSizePreview : null;
            const tableColumnWidths = sizePreview?.columnWidths ?? defaultColumnWidths;
            const tableRowHeights = sizePreview?.rowHeights ?? block.rowHeights;
            const tableWidth = tableColumnWidths.reduce((sum, width) => sum + width, 0);
            const tableHeight = tableRowHeights.reduce((sum, height) => sum + height, 0);
            const columnOffsets = buildOffsets(tableColumnWidths);
            const rowOffsets = buildOffsets(tableRowHeights);
            const layoutPreview = wordTableLayoutPreview?.blockId === block.id ? wordTableLayoutPreview : null;
            const tableLeft = layoutPreview?.left ?? block.layout.left;
            const tableTop = layoutPreview?.top ?? block.layout.top;
            const selected = selectedWordTableBlockId === block.id;
            const selectedCellRange = wordTableCellRange?.blockId === block.id ? wordTableCellRange : null;
            const outerRightBorderCells = block.cells.filter((cell) => (
              cell.col + cell.colSpan - 1 >= tableColumnWidths.length
              && shouldRenderWordTableOuterBorder('right', cell, usesLegacyWordTableBorders)
            ));
            const outerBottomBorderCells = block.cells.filter((cell) => (
              cell.row + cell.rowSpan - 1 >= tableRowHeights.length
              && shouldRenderWordTableOuterBorder('bottom', cell, usesLegacyWordTableBorders)
            ));

            return (
              <Box
                key={block.id}
                data-word-block="table"
                data-word-table-draggable="true"
                sx={{
                  position: 'absolute',
                  left: tableLeft,
                  top: tableTop,
                  width: tableWidth,
                  minHeight: tableHeight,
                  display: 'grid',
                  gridTemplateColumns: buildTemplate(tableColumnWidths),
                  gridTemplateRows: buildTemplate(tableRowHeights),
                  bgcolor: '#fff',
                  boxSizing: 'border-box',
                  cursor: 'text',
                  zIndex: selected ? 10 : undefined,
                  outline: selected ? '1px solid #1677ff' : 'none',
                  outlineOffset: 2,
                }}
              >
                {selected ? tableColumnWidths.slice(0, -1).flatMap((_, index) => {
                  const boundaryIndex = index + 1;
                  return getWordTableColumnResizeSegments(block, boundaryIndex, usesLegacyWordTableBorders).map(([startRow, endRow]) => (
                    <Box
                      key={`column-resize-${boundaryIndex}-${startRow}-${endRow}`}
                      data-word-table-column-resize-handle="true"
                      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => beginWordTableResize(
                        event,
                        block,
                        'column',
                        boundaryIndex,
                        tableColumnWidths,
                        tableRowHeights,
                      )}
                      sx={{
                        position: 'absolute',
                        top: rowOffsets[startRow - 1],
                        height: getWordTableSpanSize(tableRowHeights, startRow, endRow - startRow + 1),
                        left: columnOffsets[boundaryIndex] - 1,
                        width: 2,
                        cursor: 'col-resize',
                        zIndex: 3,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: '1px',
                          bgcolor: 'transparent',
                        },
                        '&:active::after': { bgcolor: '#1677ff' },
                      }}
                    />
                  ));
                }) : null}
                {selected ? outerRightBorderCells.map((cell) => (
                  <Box
                    key={`outer-column-resize-${cell.id}`}
                    data-word-table-outer-column-resize-handle="true"
                    onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => beginWordTableOuterColumnResize(
                      event,
                      block,
                      tableColumnWidths,
                      tableRowHeights,
                    )}
                    sx={{
                      position: 'absolute',
                      top: rowOffsets[cell.row - 1],
                      height: getWordTableSpanSize(tableRowHeights, cell.row, cell.rowSpan),
                      right: -1,
                      width: 2,
                      cursor: 'col-resize',
                      zIndex: 5,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: '1px',
                        bgcolor: 'transparent',
                      },
                      '&:active::after': { bgcolor: '#1677ff' },
                    }}
                  />
                )) : null}
                {selected ? tableRowHeights.slice(0, -1).flatMap((_, index) => {
                  const boundaryIndex = index + 1;
                  return getWordTableRowResizeSegments(block, boundaryIndex, usesLegacyWordTableBorders).map(([startColumn, endColumn]) => (
                    <Box
                      key={`row-resize-${boundaryIndex}-${startColumn}-${endColumn}`}
                      data-word-table-row-resize-handle="true"
                      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => beginWordTableResize(
                        event,
                        block,
                        'row',
                        boundaryIndex,
                        tableColumnWidths,
                        tableRowHeights,
                      )}
                      sx={{
                        position: 'absolute',
                        left: columnOffsets[startColumn - 1],
                        width: getWordTableSpanSize(tableColumnWidths, startColumn, endColumn - startColumn + 1),
                        top: rowOffsets[boundaryIndex] - 1,
                        height: 2,
                        cursor: 'row-resize',
                        zIndex: 3,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          height: '1px',
                          bgcolor: 'transparent',
                        },
                        '&:active::after': { bgcolor: '#1677ff' },
                      }}
                    />
                  ));
                }) : null}
                {selected ? outerBottomBorderCells.map((cell) => (
                  <Box
                    key={`outer-row-resize-${cell.id}`}
                    data-word-table-outer-row-resize-handle="true"
                    onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => beginWordTableOuterRowResize(
                      event,
                      block,
                      tableColumnWidths,
                      tableRowHeights,
                    )}
                    sx={{
                      position: 'absolute',
                      left: columnOffsets[cell.col - 1],
                      width: getWordTableSpanSize(tableColumnWidths, cell.col, cell.colSpan),
                      bottom: -1,
                      height: 2,
                      cursor: 'row-resize',
                      zIndex: 5,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: '1px',
                        bgcolor: 'transparent',
                      },
                      '&:active::after': { bgcolor: '#1677ff' },
                    }}
                  />
                )) : null}
                {block.cells.map((cell) => {
                  const isRangeSelected = isWordTableCellInRange(cell, selectedCellRange);
                  return (
                    <Box
                      key={cell.id}
                      data-word-table-cell="true"
                      data-word-table-cell-id={cell.id}
                      data-word-table-block-id={block.id}
                      data-word-table-diagonal={cell.diagonalTopLeftToBottomRight || cell.diagonalTopRightToBottomLeft ? 'true' : undefined}
                      onPointerDownCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
                        // ContentEditable may consume a secondary pointer event before the bubbling
                        // handler runs. Capture it at the cell boundary so the custom menu is reliable.
                        if (event.button === 2) {
                          handleWordTableContextMenu(event, block, cell);
                        }
                      }}
                      onContextMenuCapture={(event: ReactMouseEvent<HTMLDivElement>) => {
                        handleWordTableContextMenu(event, block, cell);
                      }}
                      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
                        // Open the custom menu on the secondary press itself. Some browser/contenteditable
                        // combinations do not reliably dispatch the later contextmenu event.
                        if (event.button === 2) {
                          handleWordTableContextMenu(event, block, cell);
                          return;
                        }

                        const startedFromText = isPointerOnWordTableText(event.target, event.clientX, event.clientY);

                        if (startedFromText && !event.shiftKey) {
                          beginWordTableTextOrCellSelection(event, block, cell);
                          return;
                        }

                        event.stopPropagation();
                        beginWordTableCellSelection(event, block, cell);
                      }}
                      onContextMenu={(event: ReactMouseEvent<HTMLDivElement>) => {
                        handleWordTableContextMenu(event, block, cell);
                      }}
                      onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => event.stopPropagation()}
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
                        borderTop: resolveWordTableCellBorder(block, 'top', cell, usesLegacyWordTableBorders),
                        borderRight: resolveWordTableCellBorder(block, 'right', cell, usesLegacyWordTableBorders),
                        borderBottom: resolveWordTableCellBorder(block, 'bottom', cell, usesLegacyWordTableBorders),
                        borderLeft: resolveWordTableCellBorder(block, 'left', cell, usesLegacyWordTableBorders),
                        bgcolor: isRangeSelected ? 'rgba(22, 119, 255, 0.14)' : String(cell.style?.backgroundColor ?? '#fff'),
                        transition: 'background-color 80ms ease',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        minHeight: 0,
                        position: 'relative',
                        outline: 'none',
                        cursor: 'text',
                        overflow: 'hidden',
                        ...((cell.diagonalTopLeftToBottomRight || cell.diagonalTopRightToBottomLeft) ? {
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            backgroundImage: resolveWordTableCellDiagonalBackground(cell),
                            zIndex: 2,
                          },
                        } : {}),
                      } as SxProps<Theme>}
                    >
                      <Box
                        data-word-table-cell-content="true"
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => {
                          // Focusing a new editable cell must replace any previous cell-range highlight.
                          selectWordTable(block.id, true);
                          setWordTableCellRange({
                            blockId: block.id,
                            anchor: { row: cell.row, col: cell.col },
                            focus: { row: cell.row, col: cell.col },
                          });
                          setWordTableCellStyleTarget({
                            blockId: block.id,
                            range: { top: cell.row, left: cell.col, bottom: cell.row, right: cell.col },
                          });
                        }}
                        onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
                          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
                          event.preventDefault();
                          insertContentEditableLineBreak(event.currentTarget);
                        }}
                        onBlur={(event: ReactFocusEvent<HTMLDivElement>) => {
                          updateWordTableCellText(block.id, cell.id, serializeContentEditableLineBreaks(event.currentTarget));
                        }}
                        sx={{
                          width: '100%',
                          maxWidth: '100%',
                          minWidth: 0,
                          minHeight: '1em',
                          outline: 'none',
                          ...resolveWordTextSx(cell.style),
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        } as SxProps<Theme>}
                      >
                        {cell.text}
                      </Box>
                    </Box>
                  );
                })}
                {outerRightBorderCells.map((cell) => (
                  <Box
                    key={`outer-right-${cell.id}`}
                    data-word-table-outer-right-border="true"
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      top: rowOffsets[cell.row - 1],
                      right: 0,
                      height: getWordTableSpanSize(tableRowHeights, cell.row, cell.rowSpan),
                      width: '1px',
                      bgcolor: String(cell.border?.color ?? '#111827'),
                      pointerEvents: 'none',
                      zIndex: 4,
                    }}
                  />
                ))}
                {outerBottomBorderCells.map((cell) => (
                  <Box
                    key={`outer-bottom-${cell.id}`}
                    data-word-table-outer-bottom-border="true"
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      left: columnOffsets[cell.col - 1],
                      bottom: 0,
                      width: getWordTableSpanSize(tableColumnWidths, cell.col, cell.colSpan),
                      height: '1px',
                      bgcolor: String(cell.border?.color ?? '#111827'),
                      pointerEvents: 'none',
                      zIndex: 4,
                    }}
                  />
                ))}
              </Box>
            );
          }

          const src = mediaSrcMap.get(block.mediaId);
          if (!src) return null;

          return (
            <Box
              key={block.id}
              component="img"
              data-word-block="image"
              src={src}
              alt=""
              sx={{
                position: 'absolute',
                left: block.layout.left,
                top: block.layout.top,
                width: block.layout.width,
                height: block.layout.height,
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </Box>
    );
  };

  const renderWordTableDragHandleLayer = () => {
    const wordDocument = currentPage?.wordDocument;
    const selectedTable = wordDocument?.blocks.find((block): block is CanvasWordTableBlock => (
      block.id === selectedWordTableBlockId && block.type === 'table'
    ));
    if (!selectedTable) return null;

    const layoutPreview = wordTableLayoutPreview?.blockId === selectedTable.id ? wordTableLayoutPreview : null;
    return (
      <Box
        data-word-table-drag-handle-layer="true"
        sx={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}
      >
        <IconButton
          size="small"
          data-word-table-drag-handle="true"
          aria-label="拖动表格"
          onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            beginWordTableDrag(event, selectedTable);
          }}
          sx={{
            position: 'absolute',
            top: (layoutPreview?.top ?? selectedTable.layout.top) - 28,
            left: layoutPreview?.left ?? selectedTable.layout.left,
            width: 24,
            height: 24,
            p: 0,
            borderRadius: 0.75,
            border: '1px solid #91caff',
            bgcolor: '#fff',
            color: '#1677ff',
            cursor: 'move',
            pointerEvents: 'auto',
            '&:hover': { bgcolor: '#e6f4ff' },
          }}
        >
          <DragIndicatorRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    );
  };

  const renderWordTableContextMenu = () => {
    const context = getWordTableContext();
    if (!wordTableContextMenu || !context) return null;

    const canMerge = isMergeableWordTableRange(context.table, context.range);
    const canSplit = context.cell.rowSpan > 1 || context.cell.colSpan > 1;
    const canDeleteColumns = context.table.columnWidths.length > 1;
    const canDeleteRows = context.table.rowHeights.length > 1;
    const stopMenuInputPropagation = (event: ReactMouseEvent<HTMLElement>) => event.stopPropagation();
    const renderInsertItem = (
      action: 'insert-left' | 'insert-right' | 'insert-above' | 'insert-below',
      label: string,
      suffix: string,
      onInsert: () => void,
    ) => (
      <MenuItem
        key={action}
        data-word-table-context-action={action}
        onClick={(event) => {
          event.stopPropagation();
          onInsert();
        }}
        sx={{ minHeight: 34, px: 1.25, gap: 0.75, fontSize: 13, color: '#334155' }}
      >
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{label}</Box>
        <TextField
          size="small"
          value={wordTableInsertCount}
          inputProps={{ inputMode: 'numeric', 'aria-label': `${label}数量` }}
          onMouseDown={stopMenuInputPropagation}
          onClick={stopMenuInputPropagation}
          onChange={(event) => setWordTableInsertCount(event.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          sx={{
            width: 42,
            '& .MuiOutlinedInput-root': { height: 24, fontSize: 12 },
            '& .MuiOutlinedInput-input': { px: 0.6, py: 0.25, textAlign: 'center' },
          }}
        />
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{suffix}</Box>
      </MenuItem>
    );

    return (
      <Box
        ref={wordTableContextMenuRef}
        data-word-table-context-menu="true"
        role="menu"
        aria-label="表格操作"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        sx={{
          position: 'fixed',
          top: wordTableContextMenu.mouseY,
          left: wordTableContextMenu.mouseX,
          zIndex: 1600,
          minWidth: 196,
          py: 0.5,
          bgcolor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 1.25,
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)',
        }}
      >
        {renderInsertItem('insert-left', '在左侧插入', '列', () => insertWordTableTracks('column', 'before'))}
        {renderInsertItem('insert-right', '在右侧插入', '列', () => insertWordTableTracks('column', 'after'))}
        {renderInsertItem('insert-above', '在上方插入', '行', () => insertWordTableTracks('row', 'before'))}
        {renderInsertItem('insert-below', '在下方插入', '行', () => insertWordTableTracks('row', 'after'))}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          data-word-table-context-action="merge-cells"
          disabled={!canMerge}
          onClick={mergeSelectedWordTableCells}
          sx={{ minHeight: 32, px: 1.25, fontSize: 13 }}
        >
          合并单元格
        </MenuItem>
        <MenuItem
          data-word-table-context-action="split-cell"
          disabled={!canSplit}
          onClick={splitSelectedWordTableCell}
          sx={{ minHeight: 32, px: 1.25, fontSize: 13 }}
        >
          拆分单元格
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          data-word-table-context-action="delete-columns"
          disabled={!canDeleteColumns}
          onClick={() => deleteSelectedWordTableTracks('column')}
          sx={{ minHeight: 32, px: 1.25, fontSize: 13, color: '#b42318' }}
        >
          删除所选列
        </MenuItem>
        <MenuItem
          data-word-table-context-action="delete-rows"
          disabled={!canDeleteRows}
          onClick={() => deleteSelectedWordTableTracks('row')}
          sx={{ minHeight: 32, px: 1.25, fontSize: 13, color: '#b42318' }}
        >
          删除所选行
        </MenuItem>
        <MenuItem
          data-word-table-context-action="delete-table"
          onClick={deleteWordTableFromContextMenu}
          sx={{ minHeight: 32, px: 1.25, fontSize: 13, color: '#b42318' }}
        >
          删除表格
        </MenuItem>
      </Box>
    );
  };

  const renderPageBreakMarkers = () => (pageMarkerCount > 1 ? (
    <Box
      data-page-break-layer="workspace"
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: PAGE_BREAK_MARKER_Z_INDEX,
      }}
    >
      {Array.from({ length: pageMarkerCount - 1 }, (_, index) => {
        const boundaryIndex = index + 1;
        const pageNumber = boundaryIndex + 1;
        const top = paperViewportGapTop + boundaryIndex * a4PaperHeightPx;
        return (
          <Box
            key={`paper-page-break-${pageNumber}`}
            data-page-break-marker="true"
            sx={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: 0,
            }}
          >
            <Box
              data-page-break-line="workspace"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderTop: '1.5px dashed rgba(71, 85, 105, 0.72)',
              }}
            />
            <Box
              data-page-break-badge="workspace-margin"
              sx={{
                position: 'absolute',
                top: -12,
                right: 24,
                px: 1.5,
                height: 24,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.96)',
                color: '#475569',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: '24px',
                letterSpacing: '0.04em',
                boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.58), 0 6px 16px rgba(15, 23, 42, 0.12)',
              }}
            >
              第{pageNumber}页
            </Box>
          </Box>
        );
      })}
    </Box>
  ) : null);
  const renderRowResizePreviewLine = () => (resizeRowDragPreview ? (
    <Box
      data-sheet-row-resize-preview-line="true"
      sx={{
        position: 'absolute',
        top: resizeRowDragPreview.top,
        left: 0,
        right: 0,
        height: 0,
        borderTop: '2px solid #2990ff',
        boxShadow: '0 0 0 1px rgba(41, 144, 255, 0.18)',
        pointerEvents: 'none',
        zIndex: PAPER_RULER_Z_INDEX + 5,
      }}
    />
  ) : null);

  if (currentPage.sheet.canvasMode === 'paper') {
    return (
      <Box
        ref={workspaceScrollRef}
        onScroll={handleWorkspaceScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          position: 'relative',
          bgcolor: '#eef3f9',
          userSelect: 'none',
        }}
      >
        {canvasSettingsFloating}
        <Box sx={{ minWidth: 'max-content', minHeight: '100%', width: '100%' }}>
          <Box sx={{ minWidth: canvasStageMinWidth, width: '100%' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `${paperRowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
                alignItems: 'stretch',
                position: 'sticky',
                top: 0,
                zIndex: PAPER_RULER_Z_INDEX,
              }}
            >
              {showPaperRuler ? (
                <>
                  <Box
                    onClick={() => {
                      if (isAllSelected) {
                        clearSelection();
                        return;
                      }
                      selectAllCells();
                    }}
                    sx={{
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      zIndex: PAPER_RULER_Z_INDEX + 1,
                      height: paperColumnHeaderHeight,
                      borderRight: '1px solid #d8e0eb',
                      borderBottom: '1px solid #d8e0eb',
                      bgcolor: isAllSelected ? '#d7dde7' : '#f4f6fa',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: 0,
                        height: 0,
                        borderBottom: '5px solid #d9d9d9',
                        borderRight: '5px solid #d9d9d9',
                        borderTop: '5px solid transparent',
                        borderLeft: '5px solid transparent',
                      },
                    }}
                  />
                  <Box
                    data-paper-mode-ruler="top"
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: PAPER_RULER_Z_INDEX,
                      height: paperColumnHeaderHeight,
                      borderBottom: '1px solid #d8e0eb',
                      background: 'linear-gradient(180deg, #fafbfc 0%, #f0f2f6 100%)',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight,
                        pl: `${paperViewportGapLeft + paperInsetLeft}px`,
                        pr: `${paperViewportGapRight + paperInsetRight}px`,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: paperContentWidth,
                          height: paperColumnHeaderHeight,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 5,
                            borderTop: '1px solid #ced4de',
                          },
                        }}
                      >
                        {paperRulerXTicks.map((offset, index) => {
                          const level = getRulerTickLevel(index);
                          return (
                            <Box
                              key={`paper-ruler-x-tick-${offset}`}
                              sx={{
                                position: 'absolute',
                                left: offset,
                                bottom: 5,
                                width: '1px',
                                height: level === 'major' ? 15 : level === 'mid' ? 10 : 6,
                                bgcolor: level === 'major' ? '#9097a4' : '#bcc2cb',
                              }}
                            />
                          );
                        })}
                        {paperRulerColumns.map((unit) => (
                          <Box
                            key={`paper-ruler-x-label-${unit}`}
                            sx={{
                              position: 'absolute',
                              left: (unit - 1) * paperRulerUnit - 3,
                              top: 1,
                              fontSize: 12,
                              lineHeight: 1,
                              color: '#6b7280',
                              fontWeight: 400,
                            }}
                          >
                            {unit}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box />
                  <Box />
                </>
              )}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `${paperRowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
                alignItems: 'start',
              }}
            >
              {showPaperRuler ? (
                <Box
                  data-paper-mode-ruler="left"
                  sx={{
                    minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                    borderRight: '1px solid #d8e0eb',
                    background: 'linear-gradient(90deg, #fafbfc 0%, #f0f2f6 100%)',
                    position: 'sticky',
                    left: 0,
                    zIndex: PAPER_RULER_Z_INDEX,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      height: rowHeaderOffsetTop + paperContentHeight,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: rowHeaderOffsetTop,
                        bottom: 0,
                        right: 5,
                        borderLeft: '1px solid #ced4de',
                      },
                    }}
                  >
                    {paperRulerYTicks.map((offset, index) => {
                      const level = getRulerTickLevel(index);
                      return (
                        <Box
                          key={`paper-ruler-y-tick-${offset}`}
                          sx={{
                            position: 'absolute',
                            top: rowHeaderOffsetTop + offset,
                            right: 5,
                            width: level === 'major' ? 15 : level === 'mid' ? 10 : 6,
                            height: '1px',
                            bgcolor: level === 'major' ? '#9097a4' : '#bcc2cb',
                          }}
                        />
                      );
                    })}
                    {paperRulerRows.map((unit) => (
                      <Box
                        key={`paper-ruler-y-label-${unit}`}
                        sx={{
                          position: 'absolute',
                          top: rowHeaderOffsetTop + (unit - 1) * paperRulerUnit - 2,
                          left: 3,
                          fontSize: 12,
                          lineHeight: 1,
                          color: '#6b7280',
                          fontWeight: 400,
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                        }}
                      >
                        {unit}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box />
              )}

              <Box
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    clearSelection();
                  }
                }}
                onMouseMove={(event) => {
                  scheduleHoveredSubTableUpdate(findCellRangeAtClientPoint(event.clientX, event.clientY));
                }}
                onMouseLeave={() => {
                  cancelHoveredSubTableUpdate();
                  setHoveredSubTableNodeId(null);
                }}
                sx={{
                  minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  background: 'linear-gradient(180deg, #eef3f9 0%, #f7f9fc 100%)',
                }}
              >
                {renderPageBreakMarkers()}
                {renderRowResizePreviewLine()}
                <Box
                  data-sheet-paper="true"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      clearSelection();
                    }
                  }}
                  sx={{
                    position: 'relative',
                    width: sheetPaperWidth,
                    minHeight: sheetPaperHeight,
                    mt: `${paperViewportGapTop}px`,
                    mb: `${paperViewportGapBottom}px`,
                    pl: `${paperInsetLeft}px`,
                    pr: `${paperInsetRight}px`,
                    pt: `${paperInsetTop}px`,
                    pb: `${paperInsetBottom}px`,
                    bgcolor: '#fff',
                    border: '1px solid #e7edf5',
                    boxShadow: '0 16px 40px rgba(30, 41, 59, 0.10)',
                  }}
                >
                  <Box
                    data-paper-mode-content-outline="true"
                    sx={{
                      position: 'absolute',
                      top: `${paperInsetTop}px`,
                      right: `${paperInsetRight}px`,
                      bottom: `${paperInsetBottom}px`,
                      left: `${paperInsetLeft}px`,
                      pointerEvents: 'none',
                      '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        borderTop: '1px dashed #d7dde8',
                      },
                      '&::before': {
                        top: 0,
                      },
                      '&::after': {
                        bottom: 0,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        borderLeft: '1px dashed #d7dde8',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        borderLeft: '1px dashed #d7dde8',
                      }}
                    />
                  </Box>
                  {currentPage.sheet.showHeader ? (
                    <Box
                      onMouseDown={clearSelection}
                      sx={{
                        width: paperWorkingWidth,
                        height: paperHeaderHeight,
                        border: '1px dashed #d8dee8',
                        borderBottom: 'none',
                        bgcolor: '#fff',
                      }}
                    />
                  ) : null}
                  <Box sx={{ position: 'relative', width: paperWorkingWidth, minHeight: paperWorkingHeight }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 1,
                        opacity: currentPage.sheet.showGridLines ? 1 : 0,
                        backgroundImage: `
                          linear-gradient(to right, rgba(203, 213, 225, 0.18) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(203, 213, 225, 0.18) 1px, transparent 1px)
                        `,
                        backgroundSize: `${paperRulerUnit}px ${paperRulerUnit}px`,
                        transition: 'opacity 160ms ease',
                      }}
                    />
                    <Box
                      ref={freeCanvasBodyRef}
                      tabIndex={0}
                      onPointerDown={(event) => {
                        const target = event.target instanceof Element ? event.target : null;
                        if (!target || target.closest('[contenteditable="true"], input, textarea, select')) return;
                        freeCanvasBodyRef.current?.focus({ preventScroll: true });
                      }}
                      onMouseDown={(event) => {
                        const target = event.target as HTMLElement;
                        if (!target.closest('[data-canvas-node="true"], [data-word-block], [data-word-table-cell], [data-word-table-drag-handle]')) {
                          clearSelection();
                        }
                      }}
                      onDragOver={(event) => {
                        if (Array.from(event.dataTransfer.types).includes(COMMON_COMPONENT_MIME)) {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'copy';
                        }
                      }}
                      onDrop={(event) => {
                        const componentId = event.dataTransfer.getData(COMMON_COMPONENT_MIME) as CommonCanvasComponentId;
                        if (!componentId) return;
                        event.preventDefault();
                        event.stopPropagation();
                        insertCommonComponentAtClientPoint(componentId, event.clientX, event.clientY);
                      }}
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        minHeight: paperWorkingHeight,
                      }}
                    >
                      {renderWordDocumentLayer()}
                      {hasSheetOverlayContent && !currentPage.wordDocument ? renderImportedGrid('paper') : null}
                      <CanvasNodeRenderer
                        nodes={currentPage.nodes}
                        resolveCellRangeLayout={getFieldDropCellLayout}
                        onCellFieldMouseDown={handleCellFieldMouseDown}
                        onCellFieldContextMenu={handleCellFieldContextMenu}
                        onNodeSelect={() => {
                          setSelectedWordTableBlockId(null);
                          setWordTableCellRange(null);
                        }}
                      />
                      {renderWordTableDragHandleLayer()}
                      {renderSubTableOverlays()}
                      {hasSheetOverlayContent ? renderSelectionOutline('overlay') : null}
                      {renderFieldDropGuide('overlay')}
                    </Box>
                  </Box>
                  {currentPage.sheet.showFooter ? (
                    <Box
                      onMouseDown={clearSelection}
                      sx={{
                        width: paperWorkingWidth,
                        height: paperFooterHeight,
                        border: '1px dashed #d8dee8',
                        borderTop: 'none',
                        bgcolor: '#fff',
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {renderWordTableContextMenu()}
      </Box>
    );
  }

  return (
    <Box
      ref={workspaceScrollRef}
      onScroll={handleWorkspaceScroll}
      sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#eef3f9', userSelect: 'none', position: 'relative' }}
    >
      {canvasSettingsFloating}
      <Box
        ref={sheetInteractionRef}
        tabIndex={0}
        onKeyDown={handleSheetKeyDown}
        sx={{
          minWidth: 'max-content',
          minHeight: '100%',
          width: '100%',
          outline: 'none',
        }}
      >
        <Box sx={{ minWidth: canvasStageMinWidth, width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${sheetRowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
              alignItems: 'stretch',
              position: 'sticky',
              top: 0,
              zIndex: PAPER_RULER_Z_INDEX + 2,
            }}
          >
            {showSheetRuler ? (
              <>
                <Box
                  data-sheet-select-all-corner="true"
                  onClick={() => {
                    if (isAllSelected) {
                      clearSelection();
                      return;
                    }
                    selectAllCells();
                  }}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: PAPER_RULER_Z_INDEX + 3,
                    height: sheetColumnHeaderHeight,
                    borderRight: '1px solid #d8e0eb',
                    borderBottom: '1px solid #d8e0eb',
                    bgcolor: isAllSelected ? '#d7dde7' : '#f4f6fa',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: 0,
                      height: 0,
                      borderBottom: '5px solid #d9d9d9',
                      borderRight: '5px solid #d9d9d9',
                      borderTop: '5px solid transparent',
                      borderLeft: '5px solid transparent',
                    },
                  }}
                />
                <Box
                  data-sheet-column-ruler="true"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: PAPER_RULER_Z_INDEX + 2,
                    height: sheetColumnHeaderHeight,
                    borderBottom: '1px solid #d8e0eb',
                    bgcolor: '#f6f8fc',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight,
                      pl: `${paperViewportGapLeft + paperInsetLeft}px`,
                      pr: `${paperViewportGapRight + paperInsetRight}px`,
                    }}
                  >
                    <Box
                      sx={{
                        width: sheetWidth,
                        display: 'grid',
                        gridTemplateColumns: columnTemplate,
                      }}
                    >
                      {columns.map((col, index) => {
                        const isColumnActive = isColumnInSelectedRanges(col);
                        return (
                          <Box
                            key={`header-col-${col}`}
                            data-sheet-column-active={isColumnActive ? 'true' : 'false'}
                            onMouseDown={(event) => {
                              handleColumnHeaderMouseDown(col, event);
                            }}
                            onMouseEnter={() => {
                              if (dragState?.type !== 'column') return;
                              selectColumnRange(dragState.startCol, col);
                            }}
                            onContextMenu={(event) => {
                              openColumnContextMenu(col, event);
                            }}
                            sx={{
                              position: 'relative',
                              height: columnHeaderHeight,
                              borderLeft: index === 0 ? '1px solid #d8e0eb' : 'none',
                              borderRight: '1px solid #d8e0eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isColumnActive ? '#4b5563' : '#7b8794',
                              fontSize: 13,
                              bgcolor: isColumnActive ? '#d7dde7' : 'transparent',
                              transition: 'background-color 120ms ease',
                              cursor: 'pointer',
                            }}
                          >
                            {getColumnLabel(col)}
                            <Box
                              data-resize-handle="resize-column"
                              onMouseDown={(event) => {
                                event.stopPropagation();
                                setDragState({
                                  type: 'resize-column',
                                  startCol: col,
                                  startWidth: rawColumnWidths[index],
                                  startX: event.clientX,
                                });
                              }}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: -4,
                                width: 8,
                                height: '100%',
                                cursor: 'col-resize',
                                zIndex: 3,
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <Box />
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${sheetRowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
              alignItems: 'start',
            }}
          >
            {showSheetRuler ? (
              <Box
                data-sheet-row-ruler="true"
                sx={{
                  minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                  borderRight: '1px solid #d8e0eb',
                  bgcolor: '#f6f8fc',
                  position: 'sticky',
                  left: 0,
                  zIndex: PAPER_RULER_Z_INDEX,
                }}
              >
                <Box sx={{ height: rowHeaderOffsetTop }} />
                {rows.map((row, index) => {
                  const isRowActive = isRowInSelectedRanges(row);
                  return (
                    <Box
                      key={`header-row-${row}`}
                      data-sheet-row-active={isRowActive ? 'true' : 'false'}
                      onMouseDown={(event) => {
                        handleRowHeaderMouseDown(row, event);
                      }}
                      onMouseEnter={() => {
                        if (dragState?.type !== 'row') return;
                        selectRowRange(dragState.startRow, row);
                      }}
                      onContextMenu={(event) => {
                        openRowContextMenu(row, event);
                      }}
                      sx={{
                        position: 'relative',
                        height: rowHeights[index],
                        borderTop: index === 0 ? '1px solid #d8e0eb' : 'none',
                        borderBottom: '1px solid #d8e0eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isRowActive ? '#4b5563' : '#7b8794',
                        fontSize: 13,
                        bgcolor: isRowActive ? '#d7dde7' : 'transparent',
                        transition: 'background-color 120ms ease',
                        cursor: 'pointer',
                      }}
                    >
                      {row}
                      <Box
                        data-resize-handle="resize-row"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          setResizeRowDragPreview(getResizeRowDragPreview(row, rowHeights[index]));
                          setDragState({
                            type: 'resize-row',
                            startRow: row,
                            startHeight: rowHeights[index],
                            startY: event.clientY,
                          });
                        }}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          bottom: -4,
                          width: '100%',
                          height: 8,
                          cursor: 'row-resize',
                          zIndex: 3,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box />
            )}

            <Box
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  clearSelection();
                }
              }}
              onMouseMove={(event) => {
                scheduleHoveredSubTableUpdate(findCellRangeAtClientPoint(event.clientX, event.clientY));
              }}
              onMouseLeave={() => {
                cancelHoveredSubTableUpdate();
                setHoveredSubTableNodeId(null);
              }}
              sx={{
                minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                background: 'linear-gradient(180deg, #eef3f9 0%, #f7f9fc 100%)',
              }}
            >
              {renderPageBreakMarkers()}
              {renderRowResizePreviewLine()}
              <Box
                data-sheet-paper="true"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    clearSelection();
                  }
                }}
                sx={{
                  width: sheetPaperWidth,
                  minHeight: sheetPaperHeight,
                  mt: `${paperViewportGapTop}px`,
                  mb: `${paperViewportGapBottom}px`,
                  pl: `${paperInsetLeft}px`,
                  pr: `${paperInsetRight}px`,
                  pt: `${paperInsetTop}px`,
                  pb: `${paperInsetBottom}px`,
                  bgcolor: '#fff',
                  border: '1px solid #e7edf5',
                  boxShadow: '0 16px 40px rgba(30, 41, 59, 0.10)',
                }}
              >
                {currentPage.sheet.showHeader ? (
                  <Box
                    onMouseDown={clearSelection}
                    sx={{
                      width: sheetWidth,
                      height: paperHeaderHeight,
                      border: '1px dashed #d8dee8',
                      borderBottom: 'none',
                      bgcolor: '#fff',
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    position: 'relative',
                    width: paperContentWidth,
                    minHeight: paperWorkingHeight,
                  }}
                >
                  {renderImportedGrid('sheet')}
                  <CanvasNodeRenderer
                    nodes={currentPage.nodes}
                    resolveCellRangeLayout={getFieldDropCellLayout}
                    onCellFieldMouseDown={handleCellFieldMouseDown}
                    onCellFieldContextMenu={handleCellFieldContextMenu}
                  />
                  {renderSubTableOverlays()}
                  {renderSelectionOutline('overlay')}
                  {renderFieldDropGuide('overlay')}
                </Box>
                {currentPage.sheet.showFooter ? (
                  <Box
                    onMouseDown={clearSelection}
                    sx={{
                      width: sheetWidth,
                      height: paperFooterHeight,
                      border: '1px dashed #d8dee8',
                      borderTop: 'none',
                      bgcolor: '#fff',
                    }}
                  />
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        open={Boolean(menuState)}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={menuState ? { top: menuState.mouseY, left: menuState.mouseX } : undefined}
      >
        {activeMenuAxis ? (
          activeMenuAxis === 'cell' ? (
            <>
              {canShowCellStructureMenu ? (
                <>
                  <MenuItem
                    data-sheet-menu-action="insert-column-before"
                    onClick={() => handleMenuAction('insert-column-before')}
                    sx={{
                      minWidth: 168,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box component="span" sx={{ flex: 1 }}>左侧新增列</Box>
                    {renderInsertCountInput('insert-column-before')}
                  </MenuItem>
                  <MenuItem
                    data-sheet-menu-action="insert-column-after"
                    onClick={() => handleMenuAction('insert-column-after')}
                    sx={{
                      minWidth: 168,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box component="span" sx={{ flex: 1 }}>右侧新增列</Box>
                    {renderInsertCountInput('insert-column-after')}
                  </MenuItem>
                  <MenuItem
                    data-sheet-menu-action="insert-row-before"
                    onClick={() => handleMenuAction('insert-row-before')}
                    sx={{
                      minWidth: 168,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box component="span" sx={{ flex: 1 }}>上方新增行</Box>
                    {renderInsertCountInput('insert-row-before')}
                  </MenuItem>
                  <MenuItem
                    data-sheet-menu-action="insert-row-after"
                    onClick={() => handleMenuAction('insert-row-after')}
                    sx={{
                      minWidth: 168,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box component="span" sx={{ flex: 1 }}>下方新增行</Box>
                    {renderInsertCountInput('insert-row-after')}
                  </MenuItem>
                </>
              ) : null}
              {canMergeMenuSelection ? (
                <MenuItem
                  data-sheet-menu-action="merge-cells"
                  onClick={() => handleMenuAction('merge-cells')}
                >合并单元格</MenuItem>
              ) : null}
              {canSplitMenuSelection ? (
                <MenuItem
                  data-sheet-menu-action="split-cells"
                  onClick={() => handleMenuAction('split-cells')}
                >拆分单元格</MenuItem>
              ) : null}
              {shouldShowQuickAddFieldsDivider ? (
                <Divider data-sheet-menu-divider="quick-add-fields" sx={{ my: 0.5 }} />
              ) : null}
              <MenuItem
                data-sheet-menu-action="quick-add-fields"
                onClick={() => handleMenuAction('quick-add-fields')}
              >
                快速添加字段
              </MenuItem>
              {renderSetSubTableMenu()}
              {canGroupSubTableSelection ? (
                <MenuItem
                  data-sheet-menu-action="sub-table-data-group"
                  onClick={handleSubTableDataGroup}
                >
                  数据分组
                </MenuItem>
              ) : null}
              {canShowCellStructureMenu ? renderDeleteMenuGroup([
                { action: 'delete-row', label: '删除行', disabled: !canDeleteMenuRows },
                { action: 'delete-column', label: '删除列', disabled: !canDeleteMenuColumns },
              ]) : null}
            </>
          ) : (
            <>
              <MenuItem
                onClick={() => handleMenuAction('insert-before')}
                sx={{
                  minWidth: 168,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box component="span" sx={{ flex: 1 }}>{activeMenuAxis === 'column' ? '左侧新增列' : '上方新增行'}</Box>
                {renderInsertCountInput('insert-before')}
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuAction('insert-after')}
                sx={{
                  minWidth: 168,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box component="span" sx={{ flex: 1 }}>{activeMenuAxis === 'column' ? '右侧新增列' : '下方新增行'}</Box>
                {renderInsertCountInput('insert-after')}
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuAction('resize')}
                sx={{
                  minWidth: 168,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box component="span" sx={{ flex: 1 }}>{activeMenuAxis === 'column' ? '设置列宽' : '设置行高'}</Box>
                <Button
                  data-sheet-menu-auto-size="true"
                  size="small"
                  variant="outlined"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleMenuAction('auto-size');
                  }}
                  sx={{
                    minWidth: 42,
                    height: 24,
                    px: 0.75,
                    py: 0,
                    fontSize: 12,
                    lineHeight: '22px',
                  }}
                >Auto</Button>
              </MenuItem>
              {renderDeleteMenuGroup([
                {
                  action: 'delete',
                  label: activeMenuAxis === 'column' ? '删除列' : '删除行',
                  disabled: !canDeleteMenuSelection,
                },
              ])}
            </>
          )
        ) : null}
      </Menu>
      <AppDialog
        hideCloseButton
        data-quick-add-field-dialog="true"
        open={quickAddFieldDialogOpen}
        onClose={closeQuickAddFieldDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 16,
            fontWeight: 700,
            pb: 1.5,
          }}
        >
          <Box component="span">快速添加字段</Box>
          <IconButton
            data-quick-add-field-close="true"
            aria-label="关闭快速添加字段"
            size="small"
            onClick={closeQuickAddFieldDialog}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <TextField
                data-quick-add-field-target="true"
                select
                size="small"
                label="添加目标"
                value={quickAddTargetValue}
                onChange={(event) => handleQuickAddTargetChange(event.target.value)}
                sx={{ width: 260 }}
              >
                {quickAddTargetOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box
              data-quick-add-field-table-frame="true"
              sx={{
                border: '1px solid #d8dee9',
                borderRadius: '8px',
                overflow: 'hidden',
                bgcolor: '#fff',
              }}
            >
              <Table
                size="small"
                sx={{
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  width: '100%',
                  '& .MuiTableCell-head': {
                    bgcolor: '#f8fafc',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    height: 34,
                    lineHeight: '18px',
                    px: 1.5,
                    py: 0.5,
                    border: '1px solid #d8dee9',
                  },
                  '& .MuiTableCell-body': {
                    px: 1.5,
                    py: 0.75,
                    border: '1px solid #e2e8f0',
                    verticalAlign: 'middle',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell width={64} align="center">序号</TableCell>
                    <TableCell width="28%">字段名称</TableCell>
                    <TableCell width="20%">字段类型</TableCell>
                    <TableCell>字段说明</TableCell>
                    <TableCell width={72} align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quickAddFieldDrafts.map((draft, index) => (
                    <TableRow key={draft.id} data-quick-add-field-row="true">
                      <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600 }}>{index + 1}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={draft.name}
                          onChange={(event) => updateQuickAddFieldDraft(draft.id, { name: event.target.value })}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={draft.type}
                          onChange={(event) => updateQuickAddFieldDraft(draft.id, { type: event.target.value as FieldType })}
                          fullWidth
                        >
                          {quickAddFieldTypeOptions.map((fieldType) => (
                            <MenuItem key={fieldType.type} value={fieldType.type}>{fieldType.label}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={draft.description}
                          onChange={(event) => updateQuickAddFieldDraft(draft.id, { description: event.target.value })}
                          placeholder="字段说明"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          data-quick-add-field-row-remove="true"
                          size="small"
                          aria-label="移除"
                          onClick={() => removeQuickAddFieldDraft(draft.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeQuickAddFieldDialog}>取消</Button>
          <Button
            variant="contained"
            onClick={handleConfirmQuickAddFields}
            disabled={
              !quickAddFieldDrafts.some((draft) => draft.name.trim())
              || (quickAddFieldTarget === 'subTable' && !quickAddFieldSubTableId)
            }
          >
            确认添加
          </Button>
        </DialogActions>
      </AppDialog>
      {renderWordTableContextMenu()}
      <Menu
        data-sheet-sub-table-menu-root="true"
        open={Boolean(subTableMenuAnchorEl)}
        anchorEl={subTableMenuAnchorEl}
        onClose={() => setSubTableMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        MenuListProps={{
          sx: { p: 0.5 },
        }}
        PaperProps={{
          'data-sheet-menu-sub-table-list': 'true',
          sx: {
            ml: 0.75,
            minWidth: 148,
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
          },
        }}
      >
        {availableSubTableFields.map((field) => (
          <MenuItem
            key={field.id}
            data-sheet-menu-sub-table-field-id={field.id}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleSetSubTableField(field);
            }}
            sx={{
              minHeight: 30,
              minWidth: 132,
              px: 1.25,
              color: '#303133',
              fontSize: 13,
              lineHeight: 1.3,
            }}
          >
            {field.name || '未命名子表'}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
