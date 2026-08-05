import AddOutlined from '@mui/icons-material/AddOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DrawOutlined from '@mui/icons-material/DrawOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AppDialog from '@/components/AppDialog';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react';
import { getFilePreviewBlob } from '@/api/files';
import { verifyCurrentUserSignaturePassword } from '@/api/identity';
import type {
  CanvasNode,
  CanvasPage,
  CanvasCellBorder,
  CanvasSelectionRange,
  CanvasSheetCell,
  ModelField,
  TemplateDesignerDocument,
} from '../../types';
import {
  buildSubTableGroupRepeatRanges,
  buildSubTableRepeatedGroupSheetLayout,
  normalizeRange,
  rangeContainsRange,
  readNodeCellRange,
} from '../../utils/subTableRegion';

interface MockSignatureValue {
  type: 'signature';
  signatureId?: string;
  signerId?: string;
  signerName?: string;
  signatureImageFileId?: string;
  signatureImageUrl: string;
  signatureImageObjectUrl?: string;
  signedAt?: string;
  certifiedAt?: string;
  expiresAt?: string;
  authMethod?: string;
}

type MockFillValue = string | string[] | boolean | MockSignatureValue;
type MockFillValues = Record<string, MockFillValue>;
type SubTableRecordCounts = Record<string, number>;

interface MockFillDialogProps {
  open: boolean;
  document: TemplateDesignerDocument;
  onClose: () => void;
}

interface MergedCellMaps {
  skipSet: Set<string>;
  startMap: Map<string, CanvasSelectionRange>;
}

type MockFillCellBorderEdge = 'top' | 'right' | 'bottom' | 'left';

interface RenderMockFillControlParams {
  node: CanvasNode;
  field: ModelField | null;
  valueKey: string;
  values: MockFillValues;
  onValueChange: (key: string, value: MockFillValue) => void;
  onSignatureRequest: (key: string) => void;
}

interface MockFillPageProps {
  page: CanvasPage;
  document: TemplateDesignerDocument;
  values: MockFillValues;
  subTableRecordCounts: SubTableRecordCounts;
  onValueChange: (key: string, value: MockFillValue) => void;
  onSignatureRequest: (key: string) => void;
  onAddSubTableRecord: (nodeId: string) => void;
  onRemoveSubTableRecord: (nodeId: string) => void;
}

const CELL_GRID_COLOR = '#d9dee7';
const CELL_FIELD_INSET = 3;
const MM_TO_PX = 96 / 25.4;
const A4_PAPER_WIDTH_MM = 210;
const A4_PAPER_HEIGHT_MM = 297;
const PAGE_MIN_PADDING = 24;

function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function getRangeKey(range: CanvasSelectionRange) {
  const normalizedRange = normalizeRange(range);
  return `${normalizedRange.t}:${normalizedRange.l}:${normalizedRange.b}:${normalizedRange.r}`;
}

function readNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function readText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function formatNowForInput(inputType: 'date' | 'time' | 'datetime-local') {
  const now = new Date();
  if (inputType === 'date') {
    return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
  }
  if (inputType === 'time') {
    return `${padDatePart(now.getHours())}:${padDatePart(now.getMinutes())}`;
  }
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}T${padDatePart(now.getHours())}:${padDatePart(now.getMinutes())}`;
}

function openMockFillDatePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled || input.readOnly) return;
  input.focus();
  try {
    input.showPicker?.();
  } catch {
    // showPicker requires a user gesture in some browsers; focus still keeps the field usable.
  }
}

function flattenNodes(nodes: CanvasNode[]) {
  const result: CanvasNode[] = [];
  const visit = (items: CanvasNode[]) => {
    items.forEach((node) => {
      result.push(node);
      if (node.children?.length) visit(node.children);
    });
  };
  visit(nodes);
  return result;
}

function getPrimaryRegionRange(node: CanvasNode) {
  const region = node.bindings?.subTableRegion;
  if (!region) return readNodeCellRange(node);
  const primaryRange = [...region.ranges].sort((first, second) => first.order - second.order)[0]?.range ?? null;
  return primaryRange ? normalizeRange(primaryRange) : readNodeCellRange(node);
}

function resolveBoundField(document: TemplateDesignerDocument, node: CanvasNode) {
  if (node.bindings?.subTableField) return node.bindings.subTableField;
  const fieldId = node.bindings?.subTableFieldId ?? node.bindings?.fieldId;
  return fieldId ? document.model.fields.find((field) => field.id === fieldId) ?? null : null;
}

function readDefaultValues(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  const text = String(value ?? '').trim();
  if (!text) return [];
  return text.split('\n').map((item) => item.trim()).filter(Boolean);
}

function readImageFilesAsDataUrls(files: File[]) {
  return Promise.all(files.map((file) => new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  }))).then((urls) => urls.filter(Boolean));
}

function normalizeMockFillNumberInput(value: string) {
  const numericText = value.replace(/[^\d.-]/g, '');
  const isNegative = numericText.startsWith('-');
  const unsignedText = numericText.replace(/-/g, '');
  const [integerPart = '', ...decimalParts] = unsignedText.split('.');
  const decimalText = decimalParts.join('');
  return `${isNegative ? '-' : ''}${integerPart}${decimalParts.length ? `.${decimalText}` : ''}`;
}

function isMockSignatureValue(value: MockFillValue | undefined): value is MockSignatureValue {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && 'type' in value
    && value.type === 'signature'
    && 'signatureImageUrl' in value
    && typeof value.signatureImageUrl === 'string',
  );
}

function readValueAsText(value: MockFillValue | undefined) {
  if (isMockSignatureValue(value)) return value.signerName || '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : '';
  return String(value ?? '');
}

function readValueAsArray(value: MockFillValue | undefined) {
  if (Array.isArray(value)) return value;
  const text = String(value ?? '').trim();
  return text ? [text] : [];
}

function readApiErrorMessage(error: unknown, fallback: string) {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
  if (error instanceof Error && error.message.trim() && error.message !== 'Request failed') return error.message;
  return fallback;
}

async function createSignatureImageObjectUrl(signature: MockSignatureValue) {
  if (!signature.signatureImageFileId) return '';
  try {
    const response = await getFilePreviewBlob(signature.signatureImageFileId);
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch {
    throw new Error('电子签名图片加载失败，请重新签署或联系管理员检查个人签名图片');
  }
}

function parseFieldOptions(field?: ModelField | null) {
  const options = field?.typeConfig.options;
  if (Array.isArray(options)) {
    return options
      .filter((option) => option && typeof option === 'object')
      .map((option, index) => {
        const typedOption = option as { id?: string; label?: string; value?: string; status?: string };
        return {
          key: typedOption.id || `${field?.id ?? 'field'}:${index}`,
          label: typedOption.label || `选项${index + 1}`,
          value: typedOption.value || typedOption.label || `option_${index + 1}`,
        };
      });
  }

  if (typeof options !== 'string' || !options.trim()) return [];
  return options
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawValue] = line.split(':');
      const label = rawLabel?.trim() || `选项${index + 1}`;
      const value = rawValue?.trim() || label;
      return {
        key: `${field?.id ?? 'field'}:${index}`,
        label,
        value,
      };
    });
}

function parseConfiguredOptions(node: CanvasNode, field?: ModelField | null) {
  const optionList = node.bindings?.widgetConfig?.optionList;
  const text = typeof optionList === 'string' ? optionList : '';
  if (!text.trim()) {
    const fieldOptions = parseFieldOptions(field);
    if (fieldOptions.length || !['singleSelect', 'multiSelect'].includes(field?.type ?? '')) return fieldOptions;
    return [
      { key: `${field?.id ?? 'configured'}:default-1`, label: '选项1', value: '选项1' },
      { key: `${field?.id ?? 'configured'}:default-2`, label: '选项2', value: '选项2' },
    ];
  }

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawValue] = line.split(':');
      const label = rawLabel?.trim() || `选项${index + 1}`;
      const value = rawValue?.trim() || label;
      return {
        key: `${field?.id ?? 'configured'}:${index}`,
        label,
        value,
      };
    });
}

function getDateInputType(node: CanvasNode, field?: ModelField | null): 'date' | 'time' | 'datetime-local' {
  const widgetConfig = node.bindings?.widgetConfig ?? {};
  const dateType = readText(widgetConfig.dateType, readText(field?.typeConfig.mode, 'datetime'));
  if (node.type === 'datepicker' || dateType === 'date') return 'date';
  if (node.type === 'timepicker' || dateType === 'time') return 'time';
  return 'datetime-local';
}

function createInitialNodeValue(node: CanvasNode, field?: ModelField | null): MockFillValue {
  const defaultValues = readDefaultValues(node.bindings?.defaultValue);
  if (field?.type === 'multiSelect') return defaultValues;
  if (field?.type === 'datetime' && node.bindings?.widgetConfig?.dateDefaultValue === 'current') {
    return formatNowForInput(getDateInputType(node, field));
  }
  if (field?.type === 'signature' || field?.type === 'attachment' || field?.type === 'image') {
    return defaultValues[0] ?? '';
  }
  return defaultValues[0] ?? '';
}

function createMockValueKey(pageId: string, node: CanvasNode, recordKey?: string) {
  if (recordKey) {
    return `${pageId}:${recordKey}:${node.bindings?.subTableFieldId ?? node.id}`;
  }
  return `${pageId}:${node.id}`;
}

function createInitialMockFillValues(document: TemplateDesignerDocument): MockFillValues {
  const values: MockFillValues = {};
  document.canvas.pages.forEach((page) => {
    flattenNodes(page.nodes).forEach((node) => {
      if (node.type === 'sub-table' || !node.bindings?.fieldId || node.bindings.subTableId) return;
      if (Boolean(node.bindings?.hidden)) return;
      values[createMockValueKey(page.id, node)] = createInitialNodeValue(node, resolveBoundField(document, node));
    });
  });
  return values;
}

function createInitialSubTableRecordCounts(document: TemplateDesignerDocument): SubTableRecordCounts {
  const counts: SubTableRecordCounts = {};
  document.canvas.pages.forEach((page) => {
    flattenNodes(page.nodes).forEach((node) => {
      if (node.type === 'sub-table' && node.bindings?.subTableRegion?.repeat.type === 'dynamic') {
        counts[node.id] = 1;
      }
    });
  });
  return counts;
}

function createMergedCellMaps(mergedCells: CanvasSelectionRange[]): MergedCellMaps {
  const skipSet = new Set<string>();
  const startMap = new Map<string, CanvasSelectionRange>();

  mergedCells.forEach((range) => {
    const normalizedRange = normalizeRange(range);
    startMap.set(getCellKey(normalizedRange.t, normalizedRange.l), normalizedRange);
    for (let row = normalizedRange.t; row <= normalizedRange.b; row += 1) {
      for (let col = normalizedRange.l; col <= normalizedRange.r; col += 1) {
        if (row === normalizedRange.t && col === normalizedRange.l) continue;
        skipSet.add(getCellKey(row, col));
      }
    }
  });

  return { skipSet, startMap };
}

function findMockFillMergedRangeContaining(page: CanvasPage, row: number, col: number) {
  return page.mergedCells
    .map((range) => normalizeRange(range))
    .find((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function getRenderedMockFillAdjacentCellBorder(
  page: CanvasPage,
  row: number,
  col: number,
  edge: 'top' | 'left',
): CanvasCellBorder | undefined {
  const mergedRange = findMockFillMergedRangeContaining(page, row, col);
  if (mergedRange) {
    if (edge === 'top' && mergedRange.t !== row) return undefined;
    if (edge === 'left' && mergedRange.l !== col) return undefined;
    return page.cells[getCellKey(mergedRange.t, mergedRange.l)]?.border;
  }
  return page.cells[getCellKey(row, col)]?.border;
}

function isAdjacentMockFillCellBorderCovered(page: CanvasPage, range: CanvasSelectionRange, edge: 'right' | 'bottom') {
  if (edge === 'right') {
    if (range.r >= page.sheet.columnCount) return false;
    const adjacentCol = range.r + 1;
    for (let row = range.t; row <= range.b; row += 1) {
      const neighborBorder = getRenderedMockFillAdjacentCellBorder(page, row, adjacentCol, 'left');
      if (!neighborBorder?.left) return false;
    }
    return true;
  }

  if (range.b >= page.sheet.rowCount) return false;
  const adjacentRow = range.b + 1;
  for (let col = range.l; col <= range.r; col += 1) {
    const neighborBorder = getRenderedMockFillAdjacentCellBorder(page, adjacentRow, col, 'top');
    if (!neighborBorder?.top) return false;
  }
  return true;
}

function shouldRenderMockFillCellBorderEdge(page: CanvasPage, range: CanvasSelectionRange, edge: MockFillCellBorderEdge) {
  const cellBorder = page.cells[getCellKey(range.t, range.l)]?.border;
  if (edge === 'right') return Boolean(cellBorder?.right && !isAdjacentMockFillCellBorderCovered(page, range, 'right'));
  if (edge === 'bottom') return Boolean(cellBorder?.bottom && !isAdjacentMockFillCellBorderCovered(page, range, 'bottom'));
  return Boolean(edge === 'top' ? cellBorder?.top : cellBorder?.left);
}

function getRowHeight(page: CanvasPage, row: number) {
  return page.sheet.rowHeights[row - 1] ?? page.sheet.defaultRowHeight;
}

function getColumnWidth(page: CanvasPage, col: number) {
  return page.sheet.columnWidths[col - 1] ?? page.sheet.defaultColumnWidth;
}

function buildTrackTemplate(count: number, getSize: (index: number) => number) {
  return Array.from({ length: count }, (_, index) => `${Math.max(24, getSize(index + 1))}px`).join(' ');
}

function sumTrackSizes(count: number, getSize: (index: number) => number) {
  return Array.from({ length: count }, (_, index) => Math.max(24, getSize(index + 1))).reduce((sum, value) => sum + value, 0);
}

function getMockFillRangeWidth(page: CanvasPage, range: CanvasSelectionRange) {
  let width = 0;
  for (let col = range.l; col <= range.r; col += 1) {
    width += Math.max(24, getColumnWidth(page, col));
  }
  return width;
}

function getMockFillRangeHeight(page: CanvasPage, range: CanvasSelectionRange) {
  let height = 0;
  for (let row = range.t; row <= range.b; row += 1) {
    height += Math.max(24, getRowHeight(page, row));
  }
  return height;
}

function getMockFillRowOffset(page: CanvasPage, fromRow: number, toRow: number) {
  let offset = 0;
  for (let row = fromRow; row < toRow; row += 1) {
    offset += Math.max(24, getRowHeight(page, row));
  }
  return offset;
}

function estimateMockFillControlContentWidth(value: string) {
  const textWidth = Array.from(value).reduce((sum, char) => {
    if (/[\u4e00-\u9fff]/.test(char)) return sum + 14;
    if (/[0-9.]/.test(char)) return sum + 8;
    return sum + 9;
  }, 0);
  return textWidth + 34;
}

function canMockFillFieldExpandOnFocus(field?: ModelField | null) {
  return !['signature', 'attachment', 'image', 'singleSelect', 'multiSelect', 'datetime'].includes(field?.type ?? '');
}

function getMockFillPagePaperMetrics(page: CanvasPage, gridWidth: number, gridHeight: number) {
  const paperOrientation = page.sheet.paperOrientation ?? 'portrait';
  const basePaperWidth = Math.round((paperOrientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM) * MM_TO_PX);
  const basePaperHeight = Math.round((paperOrientation === 'landscape' ? A4_PAPER_WIDTH_MM : A4_PAPER_HEIGHT_MM) * MM_TO_PX);
  const insetTop = Math.max(PAGE_MIN_PADDING, Math.round(readNumber(page.sheet.paperMarginTopMm, 5) * MM_TO_PX));
  const insetRight = Math.max(PAGE_MIN_PADDING, Math.round(readNumber(page.sheet.paperMarginRightMm, 6) * MM_TO_PX));
  const insetBottom = Math.max(PAGE_MIN_PADDING, Math.round(readNumber(page.sheet.paperMarginBottomMm, 6) * MM_TO_PX));
  const insetLeft = Math.max(PAGE_MIN_PADDING, Math.round(readNumber(page.sheet.paperMarginLeftMm, 6) * MM_TO_PX));

  return {
    paperWidth: Math.max(basePaperWidth, gridWidth + insetLeft + insetRight),
    paperHeight: Math.max(basePaperHeight, gridHeight + insetTop + insetBottom),
    insetTop,
    insetRight,
    insetBottom,
    insetLeft,
  };
}

function resolveTextAlign(value: unknown): CSSProperties['textAlign'] {
  return value === 'right' || value === 'center' || value === 'justify' ? value : 'left';
}

function resolveCellTextSx(cell?: CanvasSheetCell | null): CSSProperties {
  return {
    color: String(cell?.style?.color ?? '#303133'),
    fontSize: readNumber(cell?.style?.fontSize, 13),
    fontWeight: cell?.style?.fontWeight as string | number | undefined,
    fontStyle: cell?.style?.fontStyle as string | undefined,
    textDecoration: cell?.style?.textDecoration as string | undefined,
    whiteSpace: cell?.style?.whiteSpace === 'normal' || String(cell?.value ?? '').includes('\n') ? 'pre-wrap' : 'nowrap',
    overflowWrap: 'anywhere',
    textAlign: resolveTextAlign(cell?.style?.textAlign),
  };
}

function renderMockFillControl({
  node,
  field,
  valueKey,
  values,
  onValueChange,
  onSignatureRequest,
}: RenderMockFillControlParams) {
  if (Boolean(node.bindings?.hidden)) return null;

  const widgetConfig = node.bindings?.widgetConfig ?? {};
  const readConfig = (key: string, fallback: unknown = '') => widgetConfig[key] ?? node.props[key] ?? field?.typeConfig[key] ?? fallback;
  const readonly = Boolean(node.bindings?.readonly);
  const required = Boolean(node.bindings?.required);
  const autoWrap = Boolean(node.bindings?.autoWrap);
  const label = String(node.bindings?.displayLabel || field?.name || node.props.label || '字段');
  const placeholder = String(node.bindings?.placeholder || node.props.placeholder || label);
  const helpText = readText(node.bindings?.helpText);
  const prefix = String(readConfig('prefix'));
  const suffix = String(readConfig('suffix'));
  const isNumberField = field?.type === 'number';
  const value = values[valueKey] ?? createInitialNodeValue(node, field);
  const textValue = readValueAsText(value);
  const options = parseConfiguredOptions(node, field);
  const optionShape = String(readConfig('optionShape', 'select'));
  const optionLayout = String(readConfig('optionLayout', 'horizontal'));
  const isVerticalOptionLayout = ['vertical', 'column'].includes(optionLayout);
  const commonTextFieldSx = {
    height: '100%',
    '& .MuiInputBase-root': {
      minHeight: 0,
      height: '100%',
      boxSizing: 'border-box',
      alignItems: autoWrap ? 'stretch' : 'center',
      fontSize: 12,
      bgcolor: readonly ? '#f8fafc' : '#fff',
    },
    '& .MuiOutlinedInput-input': {
      height: '100%',
      boxSizing: 'border-box',
      py: 0,
      px: 0.75,
      lineHeight: '18px',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputBase-root.MuiInputBase-multiline': {
      p: 0,
      alignItems: 'stretch',
    },
    '& .MuiInputBase-inputMultiline': {
      height: '100% !important',
      boxSizing: 'border-box',
      py: '4px !important',
      px: '6px !important',
      maxHeight: 'none',
      overflowY: 'auto !important',
      resize: 'none',
    },
  };
  const dateTextFieldSx = {
    ...commonTextFieldSx,
    height: '100%',
    '& .MuiInputBase-root': {
      ...commonTextFieldSx['& .MuiInputBase-root'],
      height: '100%',
      minHeight: 0,
      alignItems: 'center',
      cursor: readonly ? 'default' : 'pointer',
    },
    '& .MuiOutlinedInput-input': {
      ...commonTextFieldSx['& .MuiOutlinedInput-input'],
      height: '100%',
      boxSizing: 'border-box',
      py: 0,
      cursor: readonly ? 'default' : 'pointer',
    },
    '& input::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  };
  const numberTextFieldSx = {
    ...commonTextFieldSx,
    '& .MuiOutlinedInput-input': {
      ...commonTextFieldSx['& .MuiOutlinedInput-input'],
      minWidth: 0,
      px: 0.5,
      fontVariantNumeric: 'tabular-nums',
    },
  };
  const mockFillSelectOptionSx = {
    minHeight: 40,
    py: 0.75,
    fontSize: 14,
    '& .MuiCheckbox-root': { p: 0, mr: 1 },
    '& .MuiSvgIcon-root': { fontSize: 18 },
  };
  const inputProps = {
    readOnly: readonly,
    startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
    endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
  };

  const wrapWithHelp = (content: ReactNode) => (
    <Tooltip title={helpText} disableHoverListener={!helpText} arrow>
      <Box data-mock-fill-field-control="true" sx={{ width: '100%', height: '100%', minWidth: 0 }}>
        {content}
      </Box>
    </Tooltip>
  );

  if (field?.type === 'signature') {
    const signatureValue = isMockSignatureValue(value) ? value : null;
    return wrapWithHelp(
      <Button
        fullWidth
        variant="outlined"
        disabled={readonly}
        startIcon={signatureValue ? undefined : <DrawOutlined />}
        onClick={() => onSignatureRequest(valueKey)}
        sx={{
          height: '100%',
          minHeight: 0,
          borderStyle: 'dashed',
          borderColor: signatureValue ? '#2990ff' : '#c8d0dc',
          color: signatureValue ? '#1677d2' : '#606266',
          bgcolor: '#fff',
          fontSize: 12,
          p: signatureValue ? 0.25 : 0.5,
        }}
      >
        {signatureValue ? (
          <Box
            component="img"
            data-mock-fill-signature-image="true"
            src={signatureValue.signatureImageObjectUrl || signatureValue.signatureImageUrl}
            alt={signatureValue.signerName ? `${signatureValue.signerName}电子签名` : '电子签名'}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : '点击签名'}
      </Button>,
    );
  }

  if (field?.type === 'attachment' || field?.type === 'image') {
    const isImage = field.type === 'image';
    const uploadStrategy = readText(
      isImage ? widgetConfig.imageUploadStrategy : widgetConfig.uploadMode,
      'single',
    );
    const multiple = uploadStrategy === 'multiple';
    const imagePreviewUrls = isImage
      ? readValueAsArray(value).filter((item) => /^data:image\/|^blob:|^https?:\/\//.test(item))
      : [];
    const imagePreviewSrc = imagePreviewUrls[0] ?? '';
    if (isImage) {
      return wrapWithHelp(
        <Box
          component="label"
          data-mock-fill-image-thumbnail="true"
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
            border: '1px solid #dcdfe6',
            borderRadius: 1,
            bgcolor: '#fff',
            color: imagePreviewSrc ? '#1677d2' : '#606266',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: readonly ? 'default' : 'pointer',
          }}
        >
          {imagePreviewSrc ? (
            <>
              <Box
                component="img"
                src={imagePreviewSrc}
                alt="图片缩略图"
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
              {imagePreviewUrls.length > 1 ? (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 4,
                    bottom: 4,
                    px: 0.75,
                    height: 18,
                    lineHeight: '18px',
                    borderRadius: 1,
                    bgcolor: 'rgba(15, 23, 42, 0.68)',
                    color: '#fff',
                    fontSize: 11,
                  }}
                >
                  +{imagePreviewUrls.length - 1}
                </Box>
              ) : null}
            </>
          ) : (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, px: 1 }}>
              <ImageOutlined sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                点击上传
              </Typography>
            </Stack>
          )}
          {readonly ? null : (
            <input
              hidden
              type="file"
              multiple={multiple}
              accept="image/*"
              onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(event.target.files ?? []);
                const urls = await readImageFilesAsDataUrls(files);
                onValueChange(valueKey, multiple ? urls : urls[0] ?? '');
              }}
            />
          )}
        </Box>,
      );
    }

    return wrapWithHelp(
      <Button
        fullWidth
        component="label"
        variant="outlined"
        disabled={readonly}
        startIcon={<AttachFileOutlined />}
        sx={{
          height: '100%',
          minHeight: 0,
          borderColor: '#dcdfe6',
          color: textValue ? '#1677d2' : '#606266',
          bgcolor: '#fff',
          fontSize: 12,
        }}
      >
        {textValue || '点击上传'}
        <input
          hidden
          type="file"
          multiple={multiple}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const names = Array.from(event.target.files ?? []).map((file) => file.name);
            onValueChange(valueKey, names.length ? names.join(', ') : '');
          }}
        />
      </Button>,
    );
  }

  if (field?.type === 'datetime') {
    const inputType = getDateInputType(node, field);
    const adornment = (
      <InputAdornment position="end">
        <CalendarMonthOutlined sx={{ fontSize: 16, color: '#909399' }} />
      </InputAdornment>
    );
    const dateInput = inputType === 'datetime-local' ? (
      <TextField
        fullWidth
        data-mock-fill-date-control="true"
        type="datetime-local"
        size="small"
        value={textValue}
        required={required}
        disabled={readonly}
        onClick={(event) => openMockFillDatePicker(event.currentTarget.querySelector<HTMLInputElement>('input'))}
        onChange={(event) => onValueChange(valueKey, event.target.value)}
        InputProps={{ endAdornment: adornment }}
        sx={dateTextFieldSx}
      />
    ) : (
      <TextField
        fullWidth
        data-mock-fill-date-control="true"
        type={inputType}
        size="small"
        value={textValue}
        required={required}
        disabled={readonly}
        onClick={(event) => openMockFillDatePicker(event.currentTarget.querySelector<HTMLInputElement>('input'))}
        onChange={(event) => onValueChange(valueKey, event.target.value)}
        InputProps={{ endAdornment: adornment }}
        sx={dateTextFieldSx}
      />
    );
    return wrapWithHelp(dateInput);
  }

  if (['singleSelect', 'multiSelect'].includes(field?.type ?? '')) {
    const currentValues = readValueAsArray(value);
    const renderedOptions = options.length ? options : [{ key: 'empty', label: '未配置选项', value: '' }];
    if (optionShape === 'radio' || optionShape === 'checkbox') {
      const isMultiSelect = field?.type === 'multiSelect';
      return wrapWithHelp(
        <Stack
          data-mock-fill-option-group="true"
          direction={isVerticalOptionLayout ? 'column' : 'row'}
          spacing={0.25}
          sx={{
            height: '100%',
            minHeight: 0,
            alignItems: isVerticalOptionLayout ? 'flex-start' : 'center',
            overflow: 'hidden',
            flexWrap: isVerticalOptionLayout ? 'nowrap' : 'wrap',
            '& .MuiCheckbox-root, & .MuiRadio-root': { p: 0.25 },
            '& .MuiSvgIcon-root': { fontSize: 16 },
          }}
        >
          {renderedOptions.map((option) => {
            const checked = currentValues.includes(option.value) || currentValues.includes(option.label);
            const control = optionShape === 'radio' ? (
              <Radio size="small" checked={checked} disabled={readonly} />
            ) : (
              <Checkbox size="small" checked={checked} disabled={readonly} />
            );
            return (
              <Button
                key={option.key}
                disabled={readonly}
                onClick={() => {
                  if (isMultiSelect) {
                    const nextValues = checked
                      ? currentValues.filter((item) => item !== option.value && item !== option.label)
                      : [...currentValues, option.value];
                    onValueChange(valueKey, nextValues);
                    return;
                  }
                  onValueChange(valueKey, option.value);
                }}
                sx={{
                  minWidth: 0,
                  p: 0,
                  mr: isVerticalOptionLayout ? 0 : 0.75,
                  color: '#303133',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: 12,
                  lineHeight: '18px',
                }}
              >
                {control}
                <Typography sx={{ fontSize: 12, lineHeight: '18px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {option.label}
                </Typography>
              </Button>
            );
          })}
        </Stack>,
      );
    }

    const isMultiSelectDropdown = field?.type === 'multiSelect';
    const dropdownValue = isMultiSelectDropdown ? currentValues : textValue;
    const renderDropdownValue = (selected: unknown) => {
      const selectedValues = Array.isArray(selected)
        ? selected.map((item) => String(item)).filter(Boolean)
        : String(selected ?? '').trim()
          ? [String(selected)]
          : [];
      if (!selectedValues.length) return placeholder || '请选择';
      return selectedValues
        .map((selectedValue) => renderedOptions.find((option) => option.value === selectedValue)?.label ?? selectedValue)
        .join(', ');
    };

    return wrapWithHelp(
      <TextField
        select
        fullWidth
        size="small"
        value={dropdownValue}
        required={required}
        disabled={readonly}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (isMultiSelectDropdown) {
            const nextValues = Array.isArray(nextValue) ? nextValue : String(nextValue).split(',');
            onValueChange(valueKey, nextValues.filter(Boolean));
            return;
          }
          onValueChange(valueKey, String(nextValue));
        }}
        SelectProps={{
          displayEmpty: true,
          multiple: isMultiSelectDropdown,
          renderValue: (selected) => renderDropdownValue(selected),
        }}
        sx={commonTextFieldSx}
      >
        {renderedOptions.map((option) => (
          <MenuItem key={option.key} value={option.value} sx={mockFillSelectOptionSx}>
            {isMultiSelectDropdown ? <Checkbox size="small" checked={currentValues.includes(option.value) || currentValues.includes(option.label)} /> : null}
            {option.label}
          </MenuItem>
        ))}
      </TextField>,
    );
  }

  return wrapWithHelp(
    <TextField
      fullWidth
      size="small"
      type="text"
      value={textValue}
      required={required}
      placeholder={placeholder}
      multiline={autoWrap}
      minRows={autoWrap ? 1 : undefined}
      maxRows={autoWrap ? 4 : undefined}
      onChange={(event) => onValueChange(valueKey, isNumberField ? normalizeMockFillNumberInput(event.target.value) : event.target.value)}
      InputProps={inputProps}
      inputProps={{
        'data-mock-fill-number-control': isNumberField ? 'true' : undefined,
        inputMode: isNumberField ? 'decimal' : undefined,
        min: readConfig('minValue', undefined),
        max: readConfig('maxValue', undefined),
        maxLength: readNumber(readConfig('maxLength', 0), 0) || undefined,
      }}
      sx={isNumberField ? numberTextFieldSx : commonTextFieldSx}
    />,
  );
}

function getSubTableChildNodes(allNodes: CanvasNode[], subTableFieldId?: string) {
  if (!subTableFieldId) return [];
  return allNodes.filter((node) => (
    node.bindings?.subTableId === subTableFieldId
    && Boolean(node.bindings?.subTableFieldId)
    && Boolean(readNodeCellRange(node))
  ));
}

function getRecordTemplateRange(subTableNode: CanvasNode) {
  const primaryRange = getPrimaryRegionRange(subTableNode);
  const groupRange = subTableNode.bindings?.subTableRegion?.recordTemplate.groupRange;
  if (groupRange) return normalizeRange(groupRange);
  return primaryRange;
}

function buildSubTableRecordRanges(subTableNode: CanvasNode, recordCount: number) {
  const region = subTableNode.bindings?.subTableRegion;
  const primaryRange = getPrimaryRegionRange(subTableNode);
  const templateRange = getRecordTemplateRange(subTableNode);
  if (!region || !primaryRange || !templateRange) return [];

  if (region.repeat.type === 'dynamic') {
    const rowHeight = templateRange.b - templateRange.t + 1;
    return Array.from({ length: Math.max(1, recordCount) }, (_, index) => ({
      t: templateRange.t + index * rowHeight,
      l: templateRange.l,
      b: templateRange.b + index * rowHeight,
      r: templateRange.r,
    }));
  }

  return [
    templateRange,
    ...buildSubTableGroupRepeatRanges(primaryRange, templateRange, region.recordTemplate.direction),
  ];
}

function mapChildRangeToRecord(childRange: CanvasSelectionRange, templateRange: CanvasSelectionRange, recordRange: CanvasSelectionRange) {
  return normalizeRange({
    t: recordRange.t + (childRange.t - templateRange.t),
    l: recordRange.l + (childRange.l - templateRange.l),
    b: recordRange.t + (childRange.b - templateRange.t),
    r: recordRange.l + (childRange.r - templateRange.l),
  });
}

function getMockPageRowCount(page: CanvasPage, recordCounts: SubTableRecordCounts) {
  const allNodes = flattenNodes(page.nodes);
  return allNodes.reduce((rowCount, node) => {
    if (node.type !== 'sub-table' || node.bindings?.subTableRegion?.repeat.type !== 'dynamic') return rowCount;
    const recordRanges = buildSubTableRecordRanges(node, recordCounts[node.id] ?? 1);
    const lastRangeBottom = recordRanges.reduce((bottom, range) => Math.max(bottom, range.b), 0);
    return Math.max(rowCount, lastRangeBottom);
  }, page.sheet.rowCount);
}

function MockFillPage({
  page,
  document,
  values,
  subTableRecordCounts,
  onValueChange,
  onSignatureRequest,
  onAddSubTableRecord,
  onRemoveSubTableRecord,
}: MockFillPageProps) {
  const allNodes = useMemo(() => flattenNodes(page.nodes), [page.nodes]);
  const renderedPage = useMemo(() => buildSubTableRepeatedGroupSheetLayout({
    cells: page.cells,
    mergedCells: page.mergedCells,
    nodes: page.nodes,
  }), [page.cells, page.mergedCells, page.nodes]);
  const rowCount = getMockPageRowCount(page, subTableRecordCounts);
  const displayPage = useMemo(() => ({
    ...page,
    sheet: { ...page.sheet, rowCount },
    cells: renderedPage.cells,
    mergedCells: renderedPage.mergedCells,
  }), [page, renderedPage.cells, renderedPage.mergedCells, rowCount]);
  const mergedCellMaps = useMemo(() => createMergedCellMaps(displayPage.mergedCells), [displayPage.mergedCells]);
  const columnCount = page.sheet.columnCount;
  const gridTemplateRows = buildTrackTemplate(rowCount, (row) => getRowHeight(page, row));
  const gridTemplateColumns = buildTrackTemplate(columnCount, (col) => getColumnWidth(page, col));
  const gridWidth = sumTrackSizes(columnCount, (col) => getColumnWidth(page, col));
  const gridHeight = sumTrackSizes(rowCount, (row) => getRowHeight(page, row));
  const paperMetrics = getMockFillPagePaperMetrics(page, gridWidth, gridHeight);
  const [hoveredSubTableNodeId, setHoveredSubTableNodeId] = useState<string | null>(null);

  const renderFieldNode = (node: CanvasNode, range: CanvasSelectionRange, valueKey: string) => {
    const field = resolveBoundField(document, node);
    const content = renderMockFillControl({
      node,
      field,
      valueKey,
      values,
      onValueChange,
      onSignatureRequest,
    });
    if (!content) return null;
    const currentText = readValueAsText(values[valueKey] ?? createInitialNodeValue(node, field));
    const fieldContentWidth = estimateMockFillControlContentWidth(currentText);
    const fieldCellWidth = getMockFillRangeWidth(page, range) - CELL_FIELD_INSET * 2;
    const shouldExpandFieldOnFocus = canMockFillFieldExpandOnFocus(field) && fieldContentWidth > fieldCellWidth;
    const focusedFieldWidth = Math.min(Math.max(fieldContentWidth, fieldCellWidth), 480);
    return (
      <Box
        key={valueKey}
        data-mock-fill-field-cell="true"
        data-mock-fill-field-overflowing={shouldExpandFieldOnFocus ? 'true' : undefined}
        style={shouldExpandFieldOnFocus ? ({ '--mock-fill-focus-width': `${focusedFieldWidth}px` } as CSSProperties) : undefined}
        sx={{
          gridColumn: `${range.l} / span ${range.r - range.l + 1}`,
          gridRow: `${range.t} / span ${range.b - range.t + 1}`,
          zIndex: 4,
          p: `${CELL_FIELD_INSET}px`,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          '&:not(:focus-within)': {
            overflow: 'hidden',
          },
          '&[data-mock-fill-field-overflowing="true"]:focus-within': {
            overflow: 'visible',
            zIndex: 120,
          },
          '&[data-mock-fill-field-overflowing="true"]:focus-within [data-mock-fill-field-control="true"]': {
            position: 'relative',
            zIndex: 121,
            width: 'var(--mock-fill-focus-width)',
            minWidth: '100%',
            maxWidth: 'min(480px, calc(100vw - 96px))',
          },
        }}
      >
        {content}
      </Box>
    );
  };

  const subTableNodes = allNodes.filter((node) => node.type === 'sub-table' && node.bindings?.fieldId && node.bindings?.subTableRegion);
  const subTableFieldNodes = new Set(allNodes.filter((node) => Boolean(node.bindings?.subTableId)).map((node) => node.id));
  const mainFieldNodes = allNodes.filter((node) => (
    node.bindings?.fieldId
    && node.type !== 'sub-table'
    && !subTableFieldNodes.has(node.id)
    && Boolean(readNodeCellRange(node))
  ));

  return (
    <Box sx={{ minWidth: paperMetrics.paperWidth, display: 'flex', justifyContent: 'center' }}>
      <Box
        data-mock-fill-page-paper="true"
        sx={{
          position: 'relative',
          width: paperMetrics.paperWidth,
          minHeight: paperMetrics.paperHeight,
          boxSizing: 'border-box',
          pl: `${paperMetrics.insetLeft}px`,
          pr: `${paperMetrics.insetRight}px`,
          pt: `${paperMetrics.insetTop}px`,
          pb: `${paperMetrics.insetBottom}px`,
          bgcolor: '#fff',
          border: '1px solid #e7edf5',
          boxShadow: '0 16px 40px rgba(30, 41, 59, 0.10)',
        }}
      >
        <Box
          data-mock-fill-runtime="true"
          sx={{
            width: gridWidth,
            display: 'grid',
            gridTemplateRows,
            gridTemplateColumns,
            position: 'relative',
            bgcolor: '#fff',
          }}
        >
          {Array.from({ length: rowCount }, (_, rowIndex) => rowIndex + 1).flatMap((row) => (
            Array.from({ length: columnCount }, (_, colIndex) => {
              const col = colIndex + 1;
              const key = getCellKey(row, col);
              if (mergedCellMaps.skipSet.has(key)) return null;
              const mergedRange = mergedCellMaps.startMap.get(key);
              const range = mergedRange ?? { t: row, l: col, b: row, r: col };
              const cell = renderedPage.cells[key];
              const cellBorder = cell?.border;
              const borderColor = String(cellBorder?.color ?? '#000000');
              const gridColor = CELL_GRID_COLOR;

              return (
                <Box
                  key={key}
                  data-mock-fill-sheet-cell="true"
                  sx={{
                    gridColumn: `${range.l} / span ${range.r - range.l + 1}`,
                    gridRow: `${range.t} / span ${range.b - range.t + 1}`,
                    zIndex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    px: `${readNumber(cell?.style?.paddingLeft, 8)}px`,
                    py: `${readNumber(cell?.style?.paddingTop, 4)}px`,
                    borderLeft: shouldRenderMockFillCellBorderEdge(displayPage, range, 'left') ? `1px solid ${borderColor}` : col === 1 ? `1px solid ${gridColor}` : 'none',
                    borderTop: shouldRenderMockFillCellBorderEdge(displayPage, range, 'top') ? `1px solid ${borderColor}` : row === 1 ? `1px solid ${gridColor}` : 'none',
                    borderRight: shouldRenderMockFillCellBorderEdge(displayPage, range, 'right') ? `1px solid ${borderColor}` : `1px solid ${gridColor}`,
                    borderBottom: shouldRenderMockFillCellBorderEdge(displayPage, range, 'bottom') ? `1px solid ${borderColor}` : `1px solid ${gridColor}`,
                    bgcolor: String(cell?.style?.backgroundColor ?? '#fff'),
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: cell?.style?.verticalAlign === 'top' ? 'flex-start' : cell?.style?.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                  }}
                >
                  <Box component="span" sx={{ width: '100%', minWidth: 0, ...resolveCellTextSx(cell) }}>
                    {cell?.value ?? ''}
                  </Box>
                </Box>
              );
            })
          ))}

          {page.images.map((image) => {
            const media = page.medias.find((item) => item.id === image.mediaId);
            if (!media?.src) return null;
            return (
              <Box
                key={image.id}
                component="img"
                src={media.src}
                alt=""
                sx={{
                  position: 'absolute',
                  left: image.layout.left,
                  top: image.layout.top,
                  width: image.layout.width,
                  height: image.layout.height,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            );
          })}

          {mainFieldNodes.map((node) => {
            const range = readNodeCellRange(node);
            return range ? renderFieldNode(node, range, createMockValueKey(page.id, node)) : null;
          })}

          {subTableNodes.flatMap((subTableNode) => {
            const region = subTableNode.bindings?.subTableRegion;
            const subTableField = resolveBoundField(document, subTableNode);
            const primaryRange = getPrimaryRegionRange(subTableNode);
            const templateRange = getRecordTemplateRange(subTableNode);
            if (!region || !primaryRange || !templateRange || !subTableField) return [];

            const recordCount = subTableRecordCounts[subTableNode.id] ?? 1;
            const recordRanges = buildSubTableRecordRanges(subTableNode, recordCount);
            const frameRange = recordRanges.reduce(
              (current, range) => normalizeRange({
                t: Math.min(current.t, range.t),
                l: Math.min(current.l, range.l),
                b: Math.max(current.b, range.b),
                r: Math.max(current.r, range.r),
              }),
              primaryRange,
            );
            const childNodes = getSubTableChildNodes(allNodes, subTableField.id);
            const isDynamic = region.repeat.type === 'dynamic';
            const isLabelVisible = hoveredSubTableNodeId === subTableNode.id;
            const lastRecordRange = recordRanges[recordRanges.length - 1] ?? frameRange;
            const subTableActionCenterY = getMockFillRowOffset(page, frameRange.t, lastRecordRange.t)
              + getMockFillRangeHeight(page, lastRecordRange) / 2;
            const subTableElements: ReactNode[] = [
              <Box
                key={`${subTableNode.id}:frame`}
                data-mock-fill-sub-table-frame="true"
                sx={{
                  gridColumn: `${frameRange.l} / span ${frameRange.r - frameRange.l + 1}`,
                  gridRow: `${frameRange.t} / span ${frameRange.b - frameRange.t + 1}`,
                  zIndex: 90,
                  position: 'relative',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                  border: '1.5px dashed #8b5cf6',
                  pointerEvents: 'none',
                  bgcolor: 'rgba(139, 92, 246, 0.03)',
                  '&:hover [data-mock-fill-sub-table-label="true"]': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  onMouseEnter={() => setHoveredSubTableNodeId(subTableNode.id)}
                  onMouseLeave={() => setHoveredSubTableNodeId((current) => (current === subTableNode.id ? null : current))}
                  sx={{
                    position: 'absolute',
                    right: 4,
                    top: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    pointerEvents: 'auto',
                  }}
                >
                  <Box
                    data-mock-fill-sub-table-label="true"
                    sx={{
                      px: 0.75,
                      height: 22,
                      lineHeight: '22px',
                      borderRadius: 0.5,
                      bgcolor: '#8b5cf6',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      opacity: isLabelVisible ? 1 : 0,
                      pointerEvents: isLabelVisible ? 'auto' : 'none',
                      transition: 'opacity 120ms ease',
                    }}
                  >
                    {subTableField.name || '子表'}
                  </Box>
                </Box>
                {isDynamic ? (
                  <Box
                    data-mock-fill-sub-table-actions="true"
                    sx={{
                      position: 'absolute',
                      left: 'calc(100% + 6px)',
                      top: subTableActionCenterY,
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      pointerEvents: 'auto',
                    }}
                  >
                    <Tooltip title="新增行" arrow>
                      <IconButton
                        data-mock-fill-sub-table-add-row="true"
                        aria-label="新增行"
                        size="small"
                        onClick={() => onAddSubTableRecord(subTableNode.id)}
                        sx={{
                          width: 24,
                          height: 24,
                          p: 0,
                          border: '1px solid #d8e4f2',
                          bgcolor: '#fff',
                          color: '#1677d2',
                          boxShadow: '0 4px 10px rgba(30, 41, 59, 0.12)',
                          '&:hover': { bgcolor: '#e8f3ff', borderColor: '#2990ff' },
                        }}
                      >
                        <AddOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    {recordCount > 1 ? (
                      <Tooltip title="删除行" arrow>
                        <IconButton
                          data-mock-fill-sub-table-remove-row="true"
                          size="small"
                          color="error"
                          onClick={() => onRemoveSubTableRecord(subTableNode.id)}
                          sx={{ width: 24, height: 24, bgcolor: '#fff' }}
                        >
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Box>
                ) : null}
              </Box>,
            ];

            recordRanges.forEach((recordRange, recordIndex) => {
              childNodes.forEach((childNode) => {
                const childRange = readNodeCellRange(childNode);
                if (!childRange || !rangeContainsRange(templateRange, childRange)) return;
                const targetRange = mapChildRangeToRecord(childRange, templateRange, recordRange);
                const valueKey = createMockValueKey(page.id, childNode, `${subTableNode.id}:record-${recordIndex}`);
                const rendered = renderFieldNode(childNode, targetRange, valueKey);
                if (rendered) subTableElements.push(rendered);
              });
            });

            return subTableElements;
          })}

          {Array.from({ length: rowCount }, (_, rowIndex) => rowIndex + 1).flatMap((row) => (
            Array.from({ length: columnCount }, (_, colIndex) => {
              const col = colIndex + 1;
              const key = getCellKey(row, col);
              if (mergedCellMaps.skipSet.has(key)) return null;
              const mergedRange = mergedCellMaps.startMap.get(key);
              const range = mergedRange ?? { t: row, l: col, b: row, r: col };
              const cell = renderedPage.cells[key];
              const cellBorder = cell?.border;
              const borderColor = String(cellBorder?.color ?? '#000000');
              const gridColor = CELL_GRID_COLOR;

              return (
                <Box
                  key={`${key}:border-overlay`}
                  data-mock-fill-sheet-border-overlay="true"
                  sx={{
                    gridColumn: `${range.l} / span ${range.r - range.l + 1}`,
                    gridRow: `${range.t} / span ${range.b - range.t + 1}`,
                    position: 'relative',
                    zIndex: 80,
                    minWidth: 0,
                    minHeight: 0,
                    pointerEvents: 'none',
                    bgcolor: 'transparent',
                    borderLeft: shouldRenderMockFillCellBorderEdge(displayPage, range, 'left') ? `1px solid ${borderColor}` : col === 1 ? `1px solid ${gridColor}` : 'none',
                    borderTop: shouldRenderMockFillCellBorderEdge(displayPage, range, 'top') ? `1px solid ${borderColor}` : row === 1 ? `1px solid ${gridColor}` : 'none',
                    borderRight: shouldRenderMockFillCellBorderEdge(displayPage, range, 'right') ? `1px solid ${borderColor}` : `1px solid ${gridColor}`,
                    borderBottom: shouldRenderMockFillCellBorderEdge(displayPage, range, 'bottom') ? `1px solid ${borderColor}` : `1px solid ${gridColor}`,
                  }}
                />
              );
            })
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default function MockFillDialog({ open, document, onClose }: MockFillDialogProps) {
  const [values, setValues] = useState<MockFillValues>(() => createInitialMockFillValues(document));
  const [subTableRecordCounts, setSubTableRecordCounts] = useState<SubTableRecordCounts>(() => createInitialSubTableRecordCounts(document));
  const [signatureDialogKey, setSignatureDialogKey] = useState<string | null>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signaturePasswordError, setSignaturePasswordError] = useState('');
  const [signatureSubmitting, setSignatureSubmitting] = useState(false);
  const signatureObjectUrlsRef = useRef<Set<string>>(new Set());
  const templateTitle = `${document.meta.templateName} : ${document.meta.versionLabel}`;

  const releaseSignatureObjectUrl = (url?: string) => {
    if (!url || !signatureObjectUrlsRef.current.has(url)) return;
    URL.revokeObjectURL(url);
    signatureObjectUrlsRef.current.delete(url);
  };

  const releaseAllSignatureObjectUrls = () => {
    signatureObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    signatureObjectUrlsRef.current.clear();
  };

  useEffect(() => () => {
    releaseAllSignatureObjectUrls();
  }, []);

  useEffect(() => {
    if (open) return;
    releaseAllSignatureObjectUrls();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    releaseAllSignatureObjectUrls();
    setValues(createInitialMockFillValues(document));
    setSubTableRecordCounts(createInitialSubTableRecordCounts(document));
    setSignatureDialogKey(null);
    setSignaturePassword('');
    setSignaturePasswordError('');
    setSignatureSubmitting(false);
  }, [document, open]);

  const handleValueChange = (key: string, value: MockFillValue) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleReset = () => {
    releaseAllSignatureObjectUrls();
    setValues(createInitialMockFillValues(document));
    setSubTableRecordCounts(createInitialSubTableRecordCounts(document));
    setSignatureDialogKey(null);
    setSignaturePassword('');
    setSignaturePasswordError('');
    setSignatureSubmitting(false);
  };

  const handleOpenSignatureDialog = (key: string) => {
    setSignatureDialogKey(key);
    setSignaturePassword('');
    setSignaturePasswordError('');
    setSignatureSubmitting(false);
  };

  const handleCloseSignatureDialog = () => {
    if (signatureSubmitting) return;
    setSignatureDialogKey(null);
    setSignaturePassword('');
    setSignaturePasswordError('');
  };

  const handleConfirmSignature = async () => {
    if (!signatureDialogKey) return;
    const password = signaturePassword.trim();
    if (!password) {
      setSignaturePasswordError('请输入电子签名密码');
      return;
    }
    setSignatureSubmitting(true);
    try {
      const response = await verifyCurrentUserSignaturePassword({ signaturePassword: password });
      const signature = response.data.data as MockSignatureValue;
      if (!signature?.signatureImageUrl) {
        throw new Error('电子签名图片不存在，请先在个人设置中重新认证');
      }
      const signatureImageObjectUrl = await createSignatureImageObjectUrl(signature);
      if (signatureImageObjectUrl) signatureObjectUrlsRef.current.add(signatureImageObjectUrl);
      const previousValue = values[signatureDialogKey];
      if (isMockSignatureValue(previousValue)) {
        releaseSignatureObjectUrl(previousValue.signatureImageObjectUrl);
      }
      handleValueChange(signatureDialogKey, {
        type: 'signature',
        signatureId: signature.signatureId,
        signerId: signature.signerId,
        signerName: signature.signerName,
        signatureImageFileId: signature.signatureImageFileId,
        signatureImageUrl: signature.signatureImageUrl,
        signatureImageObjectUrl,
        signedAt: signature.signedAt,
        certifiedAt: signature.certifiedAt,
        expiresAt: signature.expiresAt,
        authMethod: signature.authMethod,
      });
      setSignatureDialogKey(null);
      setSignaturePassword('');
      setSignaturePasswordError('');
    } catch (error) {
      setSignaturePasswordError(readApiErrorMessage(error, '电子签名鉴权失败，请重试'));
    } finally {
      setSignatureSubmitting(false);
    }
  };

  const handleAddSubTableRecord = (nodeId: string) => {
    setSubTableRecordCounts((current) => ({
      ...current,
      [nodeId]: (current[nodeId] ?? 1) + 1,
    }));
  };

  const handleRemoveSubTableRecord = (nodeId: string) => {
    if (!window.confirm('确认删除当前记录吗？')) return;
    setSubTableRecordCounts((current) => ({
      ...current,
      [nodeId]: Math.max(1, (current[nodeId] ?? 1) - 1),
    }));
  };

  return (
    <AppDialog
      hideCloseButton
      fullScreen
      open={open}
      onClose={onClose}
      data-mock-fill-dialog="true"
      PaperProps={{ sx: { bgcolor: '#f4f6fa' } }}
    >
      <Box
        sx={{
          height: 56,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1f2128',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>模拟填报</Typography>
          <Divider
            data-mock-fill-title-divider="true"
            orientation="vertical"
            flexItem
            sx={{
              alignSelf: 'center',
              height: 22,
              borderColor: 'rgba(255,255,255,.24)',
            }}
          />
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,.72)', minWidth: 0 }} noWrap>
            {templateTitle}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<RestartAltOutlined />}
            onClick={handleReset}
            sx={{
              height: 32,
              minWidth: 88,
              px: 1.5,
              color: '#f8fafc',
              borderColor: 'rgba(255,255,255,.14)',
              '&:hover': { borderColor: 'rgba(255,255,255,.28)', bgcolor: 'rgba(255,255,255,.06)' },
            }}
          >
            重置
          </Button>
          <IconButton aria-label="关闭模拟填报" onClick={onClose} sx={{ color: '#f8fafc' }}>
            <CloseOutlined />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, pt: 3, pb: '20px' }}>
        <Stack spacing={3}>
          {document.canvas.pages.map((page) => (
            <Box key={page.id} sx={{ overflowX: 'auto' }}>
              <MockFillPage
                page={page}
                document={document}
                values={values}
                subTableRecordCounts={subTableRecordCounts}
                onValueChange={handleValueChange}
                onSignatureRequest={handleOpenSignatureDialog}
                onAddSubTableRecord={handleAddSubTableRecord}
                onRemoveSubTableRecord={handleRemoveSubTableRecord}
              />
            </Box>
          ))}
          {!document.canvas.pages.length ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 260, color: '#909399' }}>
              <Typography sx={{ fontSize: 14 }}>暂无可模拟填报的页面</Typography>
            </Stack>
          ) : null}
        </Stack>
      </Box>
      <AppDialog
        open={Boolean(signatureDialogKey)}
        onClose={handleCloseSignatureDialog}
        data-mock-fill-signature-dialog="true"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>签署电子签名</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ mb: 1.5, fontSize: 13, color: '#606266' }}>
            请输入个人设置中认证的电子签名密码，系统将调用后端完成真实鉴权。
          </Typography>
          <TextField
            data-mock-fill-signature-password="true"
            autoFocus
            fullWidth
            type="password"
            label="电子签名密码"
            value={signaturePassword}
            error={Boolean(signaturePasswordError)}
            helperText={signaturePasswordError || ' '}
            disabled={signatureSubmitting}
            onChange={(event) => {
              setSignaturePassword(event.target.value);
              if (signaturePasswordError) setSignaturePasswordError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleConfirmSignature();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseSignatureDialog} disabled={signatureSubmitting}>取消</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSignature}
            data-mock-fill-signature-confirm="true"
            disabled={signatureSubmitting}
            sx={{ minWidth: 88 }}
          >
            {signatureSubmitting ? '鉴权中...' : '确认签名'}
          </Button>
        </DialogActions>
      </AppDialog>
    </AppDialog>
  );
}
