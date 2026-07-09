import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import type {
  CanvasCellBorder,
  CanvasPage,
  CanvasSelectionRange,
  CanvasSheetCell,
  CanvasSheetImage,
  CanvasSheetMedia,
} from '../types';
import {
  buildDataUrl,
  clampImportedColumnCount,
  clampImportedRowCount,
  createImportedCanvasPage,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  fitImportedColumnWidthsToPaper,
  getCellKey,
  normalizeImportedOrientation,
} from './importGrid';

const PX_PER_POINT = 96 / 72;
const EMU_PER_PX = 9525;
const DEFAULT_IMPORTED_FONT_SIZE = 14;
const DEFAULT_IMPORTED_LINE_HEIGHT = 1.5;
const DEFAULT_CELL_HORIZONTAL_PADDING = 16;
const IMPORTED_EXCEL_BORDER_COLOR = '#000000';
const MERGED_TEXT_SPLIT_GAP_PATTERN = /[ \t\u00a0\u3000]{2,}/g;
const CHECKBOX_MARKER_PATTERN = /(^|[\s\r\n])[□☐☑☒£þý](?=\S)/;
const SPECIAL_SYMBOL_WRAP_PATTERN = /[□☐☑☒■▪●○◆◇★☆※√×]/;
const WINGDINGS_CHECKBOX_GLYPHS: Record<string, string> = {
  '£': '□',
  '¨': '□',
  'þ': '☑',
  'ý': '☒',
  R: '☑',
};

interface MergedTextSegment {
  text: string;
  start: number;
}

function isWingdingsFont(fontName?: string | null) {
  return /wingdings|webdings/i.test(String(fontName ?? ''));
}

function normalizeImportedCheckboxGlyphs(value: string, fontName?: string | null) {
  if (isWingdingsFont(fontName)) {
    return Array.from(value).map((char) => WINGDINGS_CHECKBOX_GLYPHS[char] ?? char).join('');
  }

  return value.replace(/(^|[\s\r\n])£(?=[^\d\s])/g, '$1□');
}

function pointsToPx(value?: number | null, fallback = DEFAULT_ROW_HEIGHT) {
  if (!Number.isFinite(value) || !value) return fallback;
  return Math.max(24, Math.round(Number(value) * PX_PER_POINT));
}

function excelColumnWidthToPx(value?: number | null, fallback = DEFAULT_COLUMN_WIDTH) {
  if (!Number.isFinite(value) || !value) return fallback;
  return Math.max(48, Math.round(Number(value) * 7 + 14));
}

function normalizeCellValue(value: unknown, text?: string, fontName?: string | null) {
  if (typeof value === 'object' && Array.isArray((value as { richText?: Array<{ text?: string; font?: { name?: string } }> }).richText)) {
    return ((value as { richText: Array<{ text?: string; font?: { name?: string } }> }).richText ?? [])
      .map((item) => normalizeImportedCheckboxGlyphs(item.text ?? '', item.font?.name ?? fontName))
      .join('');
  }
  if (typeof text === 'string' && text.trim()) return normalizeImportedCheckboxGlyphs(text, fontName);
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
  if (typeof value === 'object') {
    if ('text' in (value as Record<string, unknown>) && typeof (value as { text?: unknown }).text === 'string') {
      return normalizeImportedCheckboxGlyphs(String((value as { text?: unknown }).text ?? ''), fontName);
    }
    if ('result' in (value as Record<string, unknown>)) {
      return normalizeImportedCheckboxGlyphs(String((value as { result?: unknown }).result ?? ''), fontName);
    }
    if ('formula' in (value as Record<string, unknown>)) {
      const result = (value as { result?: unknown }).result;
      return result == null ? '' : normalizeImportedCheckboxGlyphs(String(result), fontName);
    }
  }
  return normalizeImportedCheckboxGlyphs(String(value), fontName);
}

function normalizeExcelColor(argb?: string | null) {
  const normalized = String(argb ?? '').trim();
  if (!normalized) return undefined;
  if (normalized.length === 8) {
    return `#${normalized.slice(2)}`;
  }
  if (normalized.length === 6) {
    return `#${normalized}`;
  }
  return undefined;
}

function legacyRgbColor(value: string) {
  const color = value.replace(/^#/, '').slice(-6);
  return `#${color.padStart(6, '0')}`;
}

function hasCellStyle(style?: Record<string, unknown>, border?: CanvasCellBorder) {
  return Boolean(
    (style && Object.keys(style).length > 0)
    || (border && Object.values(border).some(Boolean)),
  );
}

function readNumericStyle(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function hasCellTextValue(cell?: CanvasSheetCell) {
  return String(cell?.value ?? '').trim().length > 0;
}

function estimateImportedTextPixelWidth(text: string, fontSize = DEFAULT_IMPORTED_FONT_SIZE) {
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

function estimateImportedTextHeight(
  text: string,
  width: number,
  fontSize = DEFAULT_IMPORTED_FONT_SIZE,
  lineHeight = DEFAULT_IMPORTED_LINE_HEIGHT,
) {
  const contentWidth = Math.max(1, width);
  const lineCount = text
    .split(/\r?\n/)
    .reduce((total, line) => (
      total + Math.max(1, Math.ceil(Math.max(1, estimateImportedTextPixelWidth(line, fontSize)) / contentWidth))
    ), 0);
  return Math.max(DEFAULT_ROW_HEIGHT, Math.ceil(lineCount * fontSize * lineHeight + 8));
}

function hasExcelFontValue(font?: Partial<ExcelJS.Font>) {
  return Boolean(font && Object.values(font).some((value) => value !== undefined));
}

function getExcelJsRichTextFont(value: ExcelJS.CellValue): Partial<ExcelJS.Font> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const richText = (value as { richText?: Array<{ font?: Partial<ExcelJS.Font> }> }).richText;
  if (!Array.isArray(richText)) return undefined;
  return richText.find((item) => hasExcelFontValue(item.font))?.font;
}

function buildExcelJsEffectiveFont(cell: ExcelJS.Cell) {
  const columnFont = cell.worksheet.getColumn(cell.fullAddress.col).font;
  const rowFont = cell.worksheet.getRow(cell.fullAddress.row).font;
  const richTextFont = getExcelJsRichTextFont(cell.value);
  const effectiveFont: Partial<ExcelJS.Font> = {
    ...(columnFont ?? {}),
    ...(rowFont ?? {}),
    ...(cell.font ?? {}),
    ...(richTextFont ?? {}),
  };

  return hasExcelFontValue(effectiveFont) ? effectiveFont : undefined;
}

function readExcelFontSize(font?: Partial<ExcelJS.Font>) {
  return typeof font?.size === 'number'
    ? Math.max(12, Math.round(font.size * PX_PER_POINT))
    : undefined;
}

function readExcelFontBold(font?: Partial<ExcelJS.Font>) {
  return font?.bold === true;
}

function buildExcelJsCellStyle(cell: ExcelJS.Cell, effectiveFont = buildExcelJsEffectiveFont(cell)) {
  const style: Record<string, unknown> = {};
  const fontSize = readExcelFontSize(effectiveFont);
  if (readExcelFontBold(effectiveFont)) style.fontWeight = 'bold';
  if (effectiveFont?.italic) style.fontStyle = 'italic';
  if (effectiveFont?.underline) style.textDecoration = 'underline';
  if (fontSize) style.fontSize = fontSize;
  if (effectiveFont?.color?.argb) style.color = normalizeExcelColor(effectiveFont.color.argb);
  if (cell.alignment?.horizontal) style.textAlign = cell.alignment.horizontal === 'centerContinuous' ? 'center' : cell.alignment.horizontal;
  if (cell.alignment?.vertical) {
    style.verticalAlign = cell.alignment.vertical === 'middle' ? 'middle' : cell.alignment.vertical;
  }
  if (cell.alignment?.wrapText) {
    style.whiteSpace = 'normal';
    style.lineHeight = 1.5;
  }
  const fillColor = normalizeExcelColor(cell.fill && 'fgColor' in cell.fill ? cell.fill.fgColor?.argb : undefined);
  if (fillColor) style.backgroundColor = fillColor;
  return style;
}

function buildExcelJsCellBorder(cell: ExcelJS.Cell): CanvasCellBorder | undefined {
  const border = cell.border;
  if (!border) return undefined;
  const nextBorder: CanvasCellBorder = {
    top: Boolean(border.top),
    right: Boolean(border.right),
    bottom: Boolean(border.bottom),
    left: Boolean(border.left),
  };
  return Object.values(nextBorder).some(Boolean)
    ? { ...nextBorder, color: IMPORTED_EXCEL_BORDER_COLOR }
    : undefined;
}

function buildLegacyCellStyle(cell: XLSX.CellObject) {
  const style: Record<string, unknown> = {};
  const source = (cell as XLSX.CellObject & { s?: Record<string, unknown> }).s;
  const font = source?.font as Record<string, unknown> | undefined;
  const alignment = source?.alignment as Record<string, unknown> | undefined;
  const fill = source?.fill as Record<string, unknown> | undefined;

  if (font?.bold) style.fontWeight = 'bold';
  if (font?.italic) style.fontStyle = 'italic';
  if (font?.underline) style.textDecoration = 'underline';
  if (typeof font?.sz === 'number') style.fontSize = Math.max(12, Math.round(Number(font.sz) * PX_PER_POINT));
  if (typeof font?.color === 'string') style.color = normalizeExcelColor(String(font.color));
  if (typeof alignment?.horizontal === 'string') style.textAlign = alignment.horizontal;
  if (typeof alignment?.vertical === 'string') style.verticalAlign = alignment.vertical === 'center' ? 'middle' : alignment.vertical;
  if (alignment?.wrapText) {
    style.whiteSpace = 'normal';
    style.lineHeight = 1.5;
  }

  const fillColor =
    typeof fill?.fgColor === 'string'
      ? normalizeExcelColor(fill.fgColor)
      : normalizeExcelColor((fill?.fgColor as { rgb?: string } | undefined)?.rgb);
  if (fillColor) style.backgroundColor = fillColor;
  return style;
}

function getLegacyCellFontName(cell: XLSX.CellObject) {
  const source = (cell as XLSX.CellObject & { s?: Record<string, unknown> }).s;
  const font = source?.font as Record<string, unknown> | undefined;
  return typeof font?.name === 'string' ? font.name : undefined;
}

function buildLegacyCellBorder(cell: XLSX.CellObject): CanvasCellBorder | undefined {
  const source = ((cell as XLSX.CellObject & { s?: Record<string, unknown> }).s?.border ?? {}) as Record<string, unknown>;
  const border: CanvasCellBorder = {
    top: Boolean(source.top),
    right: Boolean(source.right),
    bottom: Boolean(source.bottom),
    left: Boolean(source.left),
  };
  return Object.values(border).some(Boolean)
    ? { ...border, color: IMPORTED_EXCEL_BORDER_COLOR }
    : undefined;
}

function decodeMergedAddress(address: string): CanvasSelectionRange {
  const range = XLSX.utils.decode_range(address);
  return {
    t: range.s.r + 1,
    l: range.s.c + 1,
    b: range.e.r + 1,
    r: range.e.c + 1,
  };
}

function filterMergedRanges(ranges: CanvasSelectionRange[], rowCount: number, columnCount: number) {
  return ranges
    .filter((range) => range.t <= rowCount && range.l <= columnCount)
    .map((range) => ({
      t: Math.max(1, range.t),
      l: Math.max(1, range.l),
      b: Math.min(rowCount, range.b),
      r: Math.min(columnCount, range.r),
    }))
    .filter((range) => range.b > range.t || range.r > range.l);
}

function buildMergedSecondaryCellSet(ranges: CanvasSelectionRange[]) {
  const keys = new Set<string>();
  ranges.forEach((range) => {
    for (let row = range.t; row <= range.b; row += 1) {
      for (let col = range.l; col <= range.r; col += 1) {
        if (row === range.t && col === range.l) continue;
        keys.add(getCellKey(row, col));
      }
    }
  });
  return keys;
}

function splitMergedCellTextByWhitespace(value: string): MergedTextSegment[] {
  const segments: MergedTextSegment[] = [];
  const matches = [...value.matchAll(MERGED_TEXT_SPLIT_GAP_PATTERN)];
  if (!matches.length) {
    return segments;
  }

  let segmentStart = 0;
  const pushSegment = (rawText: string, absoluteStart: number) => {
    const text = rawText.trim();
    if (!text) return;
    segments.push({
      text,
      start: absoluteStart + rawText.length - rawText.trimStart().length,
    });
  };

  matches.forEach((match) => {
    const gapStart = match.index ?? 0;
    pushSegment(value.slice(segmentStart, gapStart), segmentStart);
    segmentStart = gapStart + match[0].length;
  });
  pushSegment(value.slice(segmentStart), segmentStart);

  return segments.length > 1 ? segments : [];
}

function shouldPreserveMergedTextLayout(value: string) {
  return /[\r\n]/.test(value) || CHECKBOX_MARKER_PATTERN.test(value) || SPECIAL_SYMBOL_WRAP_PATTERN.test(value);
}

function applyPreservedMergedTextWrap(cells: Record<string, CanvasSheetCell>, cellKey: string) {
  const cell = cells[cellKey];
  if (!cell) return;

  cells[cellKey] = {
    ...cell,
    style: {
      ...(cell.style ?? {}),
      whiteSpace: 'normal',
      lineHeight: readNumericStyle(cell.style?.lineHeight, DEFAULT_IMPORTED_LINE_HEIGHT),
    },
  };
}

function findColumnForMergedTextOffset(
  range: CanvasSelectionRange,
  columnWidths: number[],
  textLength: number,
  offset: number,
) {
  const mergedWidth = sumByRange(columnWidths, range.l - 1, range.r);
  const offsetRatio = textLength <= 1 ? 0 : Math.min(1, Math.max(0, offset / textLength));
  const targetX = mergedWidth * offsetRatio;
  let cursorX = 0;

  for (let col = range.l; col <= range.r; col += 1) {
    cursorX += columnWidths[col - 1] ?? DEFAULT_COLUMN_WIDTH;
    if (targetX <= cursorX) {
      return col;
    }
  }

  return range.r;
}

function clearImportedCellValue(cells: Record<string, CanvasSheetCell>, cellKey: string) {
  const cell = cells[cellKey];
  if (!cell) return;

  const nextCell: CanvasSheetCell = {
    ...(cell.style ? { style: cell.style } : {}),
    ...(cell.border ? { border: cell.border } : {}),
  };

  if (hasCellStyle(nextCell.style, nextCell.border)) {
    cells[cellKey] = nextCell;
  } else {
    delete cells[cellKey];
  }
}

function applyMergedWhitespaceSplits(
  cells: Record<string, CanvasSheetCell>,
  mergedCells: CanvasSelectionRange[],
  columnWidths: number[],
) {
  const nextCells = { ...cells };
  const remainingMergedCells: CanvasSelectionRange[] = [];

  mergedCells.forEach((range) => {
    const sourceKey = getCellKey(range.t, range.l);
    const sourceCell = nextCells[sourceKey];
    const sourceValue = String(sourceCell?.value ?? '');
    const shouldPreserveLayout = shouldPreserveMergedTextLayout(sourceValue);
    const splitSegments = range.t === range.b && range.r > range.l && !shouldPreserveLayout
      ? splitMergedCellTextByWhitespace(sourceValue)
      : [];

    if (!splitSegments.length) {
      if (shouldPreserveLayout) {
        applyPreservedMergedTextWrap(nextCells, sourceKey);
      }
      remainingMergedCells.push(range);
      return;
    }

    const splitValues = new Map<number, string[]>();
    splitSegments.forEach((segment) => {
      const targetCol = findColumnForMergedTextOffset(range, columnWidths, sourceValue.length, segment.start);
      splitValues.set(targetCol, [...(splitValues.get(targetCol) ?? []), segment.text]);
    });

    for (let col = range.l; col <= range.r; col += 1) {
      clearImportedCellValue(nextCells, getCellKey(range.t, col));
    }

    splitValues.forEach((values, col) => {
      const cellKey = getCellKey(range.t, col);
      const targetCell = nextCells[cellKey] ?? {};
      nextCells[cellKey] = {
        ...targetCell,
        value: values.join(' '),
        style: targetCell.style ?? sourceCell?.style,
      };
    });
  });

  return { cells: nextCells, remainingMergedCells };
}

function isCellInsideMergedRange(row: number, col: number, mergedCells: CanvasSelectionRange[]) {
  return mergedCells.some((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function rangesOverlap(a: CanvasSelectionRange, b: CanvasSelectionRange) {
  return a.l <= b.r && a.r >= b.l && a.t <= b.b && a.b >= b.t;
}

function findRightBlankOverflowMergeEnd(params: {
  row: number;
  col: number;
  requiredWidth: number;
  columnWidths: number[];
  cells: Record<string, CanvasSheetCell>;
  mergedCells: CanvasSelectionRange[];
}) {
  let accumulatedWidth = params.columnWidths[params.col - 1] ?? DEFAULT_COLUMN_WIDTH;
  let mergeEnd = params.col;

  for (let col = params.col + 1; col <= params.columnWidths.length; col += 1) {
    if (isCellInsideMergedRange(params.row, col, params.mergedCells)) break;
    if (hasCellTextValue(params.cells[getCellKey(params.row, col)])) break;

    accumulatedWidth += params.columnWidths[col - 1] ?? DEFAULT_COLUMN_WIDTH;
    mergeEnd = col;
    if (accumulatedWidth >= params.requiredWidth) break;
  }

  return mergeEnd > params.col ? mergeEnd : null;
}

function applyLongTextOverflowLayout(params: {
  rowHeights: number[];
  columnWidths: number[];
  cells: Record<string, CanvasSheetCell>;
  mergedCells: CanvasSelectionRange[];
}) {
  const nextRowHeights = [...params.rowHeights];
  const nextMergedCells = [...params.mergedCells];

  Object.entries(params.cells).forEach(([cellKey, cell]) => {
    const value = String(cell.value ?? '');
    if (!value.trim() || /\r|\n/.test(value)) return;

    const [rowText, colText] = cellKey.split(':');
    const row = Number(rowText);
    const col = Number(colText);
    if (!Number.isInteger(row) || !Number.isInteger(col)) return;
    if (row < 1 || col < 1 || row > nextRowHeights.length || col > params.columnWidths.length) return;
    if (isCellInsideMergedRange(row, col, nextMergedCells)) return;

    const fontSize = readNumericStyle(cell.style?.fontSize, DEFAULT_IMPORTED_FONT_SIZE);
    const lineHeight = readNumericStyle(cell.style?.lineHeight, DEFAULT_IMPORTED_LINE_HEIGHT);
    const paddingLeft = readNumericStyle(cell.style?.paddingLeft, DEFAULT_CELL_HORIZONTAL_PADDING / 2);
    const paddingRight = readNumericStyle(cell.style?.paddingRight, DEFAULT_CELL_HORIZONTAL_PADDING / 2);
    const currentWidth = params.columnWidths[col - 1] ?? DEFAULT_COLUMN_WIDTH;
    const requiredWidth = Math.ceil(estimateImportedTextPixelWidth(value, fontSize) + paddingLeft + paddingRight);
    if (requiredWidth <= currentWidth) return;

    const mergeEnd = findRightBlankOverflowMergeEnd({
      row,
      col,
      requiredWidth,
      columnWidths: params.columnWidths,
      cells: params.cells,
      mergedCells: nextMergedCells,
    });
    const layoutWidth = mergeEnd
      ? sumByRange(params.columnWidths, col - 1, mergeEnd)
      : currentWidth;

    if (mergeEnd) {
      const nextRange = { t: row, l: col, b: row, r: mergeEnd };
      if (!nextMergedCells.some((range) => rangesOverlap(range, nextRange))) {
        nextMergedCells.push(nextRange);
      }
    }

    if (layoutWidth >= requiredWidth) return;

    const nextStyle = {
      ...(cell.style ?? {}),
      whiteSpace: 'normal',
      lineHeight,
    };
    params.cells[cellKey] = {
      ...cell,
      style: nextStyle,
    };
    nextRowHeights[row - 1] = Math.max(
      nextRowHeights[row - 1] ?? DEFAULT_ROW_HEIGHT,
      estimateImportedTextHeight(value, layoutWidth - paddingLeft - paddingRight, fontSize, lineHeight),
    );
  });

  return {
    rowHeights: nextRowHeights,
    mergedCells: nextMergedCells,
  };
}

function aggregateMergedRangeBorder(
  cells: Record<string, CanvasSheetCell>,
  range: CanvasSelectionRange,
): CanvasCellBorder | undefined {
  const border: CanvasCellBorder = {};

  for (let col = range.l; col <= range.r; col += 1) {
    const sourceCell = cells[getCellKey(range.t, col)];
    if (sourceCell?.border?.top) border.top = true;
  }

  for (let col = range.l; col <= range.r; col += 1) {
    const sourceCell = cells[getCellKey(range.b, col)];
    if (sourceCell?.border?.bottom) border.bottom = true;
  }

  for (let row = range.t; row <= range.b; row += 1) {
    const sourceCell = cells[getCellKey(row, range.l)];
    if (sourceCell?.border?.left) border.left = true;
  }

  for (let row = range.t; row <= range.b; row += 1) {
    const sourceCell = cells[getCellKey(row, range.r)];
    if (sourceCell?.border?.right) border.right = true;
  }

  return Object.values(border).some(Boolean)
    ? { ...border, color: IMPORTED_EXCEL_BORDER_COLOR }
    : undefined;
}

function mergeImportedCellBorders(
  cells: Record<string, CanvasSheetCell>,
  mergedCells: CanvasSelectionRange[],
) {
  const nextCells = { ...cells };

  mergedCells.forEach((range) => {
    const mergedBorder = aggregateMergedRangeBorder(nextCells, range);
    if (!mergedBorder) return;

    const targetKey = getCellKey(range.t, range.l);
    const targetCell = nextCells[targetKey] ?? {};
    nextCells[targetKey] = {
      ...targetCell,
      border: {
        ...(targetCell.border ?? {}),
        ...mergedBorder,
      },
    };
  });

  return nextCells;
}

function sumByRange(values: number[], start: number, end: number) {
  let total = 0;
  for (let index = start; index < end; index += 1) {
    total += values[index] ?? 0;
  }
  return total;
}

function emuToPx(value?: number | null) {
  return Math.round(Number(value ?? 0) / EMU_PER_PX);
}

function mediaMimeType(extension: string) {
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'svg') return 'image/svg+xml';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

type ModernExcelImage = {
  imageId?: unknown;
  range?: {
    tl?: { nativeRow?: number; nativeCol?: number; nativeRowOff?: number; nativeColOff?: number };
    br?: { nativeRow?: number; nativeCol?: number; nativeRowOff?: number; nativeColOff?: number };
  };
};

function safeGetWorksheetImages(worksheet: ExcelJS.Worksheet): ModernExcelImage[] {
  try {
    return typeof worksheet.getImages === 'function' ? worksheet.getImages() : [];
  } catch {
    return [];
  }
}

function safeGetImageRange(item: ModernExcelImage): ModernExcelImage['range'] | null {
  try {
    return item.range ?? null;
  } catch {
    return null;
  }
}

function buildModernExcelImages(
  worksheet: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  rowHeights: number[],
  columnWidths: number[],
) {
  // `sheet.columnWidths` is normalized into the React grid model before page creation.
  const medias: CanvasSheetMedia[] = [];
  const images: CanvasSheetImage[] = [];
  const mediaRefs = ((workbook as unknown as { model?: { media?: Array<Record<string, unknown>> } }).model?.media ?? []);
  const worksheetImages = safeGetWorksheetImages(worksheet);
  const mediaIdMap = new Map<number, string>();

  mediaRefs.forEach((media, index) => {
    const extension = String(media.extension ?? media.type ?? 'png').toLowerCase();
    const src = buildDataUrl(media.buffer ?? media.base64 ?? media.data, mediaMimeType(extension));
    if (!src) return;
    const mediaId = `excel-media-${index}`;
    mediaIdMap.set(index, mediaId);
    medias.push({ id: mediaId, src });
  });

  worksheetImages.forEach((item, index) => {
    const range = safeGetImageRange(item);
    const tl = range?.tl;
    const br = range?.br;
    if (!tl) return;
    const imageId = Number(item.imageId);
    const mediaId = mediaIdMap.get(imageId) ?? mediaIdMap.get(imageId - 1);
    if (!mediaId) return;
    const startCol = Math.max(0, Number(tl.nativeCol ?? 0));
    const startRow = Math.max(0, Number(tl.nativeRow ?? 0));
    const endCol = Math.max(startCol, Number(br?.nativeCol ?? startCol));
    const endRow = Math.max(startRow, Number(br?.nativeRow ?? startRow));
    const left = sumByRange(columnWidths, 0, startCol) + emuToPx(tl.nativeColOff);
    const top = sumByRange(rowHeights, 0, startRow) + emuToPx(tl.nativeRowOff);
    const width = Math.max(
      24,
      sumByRange(columnWidths, startCol, endCol)
      + emuToPx(br?.nativeColOff)
      - emuToPx(tl.nativeColOff),
    );
    const height = Math.max(
      24,
      sumByRange(rowHeights, startRow, endRow)
      + emuToPx(br?.nativeRowOff)
      - emuToPx(tl.nativeRowOff),
    );
    images.push({
      id: `excel-image-${index}`,
      mediaId,
      layout: { left, top, width, height },
    });
  });

  return { medias, images };
}

function modernMergedCells(worksheet: ExcelJS.Worksheet, rowCount: number, columnCount: number) {
  const mergedRanges: CanvasSelectionRange[] = [];
  const mergeSet = new Set<string>();
  const mergeAddresses = [
    ...((((worksheet as unknown as { model?: { merges?: string[] } }).model?.merges) ?? []).filter(Boolean)),
    ...Object.keys((worksheet as unknown as { _merges?: Record<string, unknown> })._merges ?? {}),
  ];

  mergeAddresses.forEach((address) => {
    if (mergeSet.has(address)) return;
    mergeSet.add(address);
    mergedRanges.push(decodeMergedAddress(address));
  });

  return filterMergedRanges(mergedRanges, rowCount, columnCount);
}

async function importModernExcel(file: File, pageId: string, pageName: string): Promise<CanvasPage> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel 文件中未找到可导入工作表');
  }

  const rowCount = clampImportedRowCount(worksheet.actualRowCount || worksheet.rowCount || 1);
  const columnCount = clampImportedColumnCount(worksheet.actualColumnCount || worksheet.columnCount || 1);
  const rowHeights = Array.from({ length: rowCount }, (_, index) => (
    pointsToPx(worksheet.getRow(index + 1).height, DEFAULT_ROW_HEIGHT)
  ));
  const columnWidths = Array.from({ length: columnCount }, (_, index) => (
    excelColumnWidthToPx(worksheet.getColumn(index + 1).width, DEFAULT_COLUMN_WIDTH)
  ));
  const mergedCells = modernMergedCells(worksheet, rowCount, columnCount);
  const mergedSecondaryKeys = buildMergedSecondaryCellSet(mergedCells);
  const cells: Record<string, CanvasSheetCell> = {};

  for (let rowIndex = 1; rowIndex <= rowCount; rowIndex += 1) {
    for (let colIndex = 1; colIndex <= columnCount; colIndex += 1) {
      const cell = worksheet.getCell(rowIndex, colIndex);
      const effectiveFont = buildExcelJsEffectiveFont(cell);
      const style = buildExcelJsCellStyle(cell, effectiveFont);
      const border = buildExcelJsCellBorder(cell);
      const cellKey = getCellKey(rowIndex, colIndex);
      const value = mergedSecondaryKeys.has(cellKey) ? '' : normalizeCellValue(cell.value, cell.text, effectiveFont?.name);
      if (!value && !hasCellStyle(style, border)) continue;
      cells[cellKey] = {
        value,
        style,
        border,
      };
    }
  }

  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const initialTotalHeight = rowHeights.reduce((sum, height) => sum + height, 0);
  const orientation = normalizeImportedOrientation(worksheet.pageSetup?.orientation, totalWidth, initialTotalHeight);
  const fittedColumnWidths = fitImportedColumnWidthsToPaper(columnWidths, orientation);
  const splitGrid = applyMergedWhitespaceSplits(cells, mergedCells, fittedColumnWidths);
  const overflowGrid = applyLongTextOverflowLayout({
    rowHeights,
    columnWidths: fittedColumnWidths,
    cells: splitGrid.cells,
    mergedCells: splitGrid.remainingMergedCells,
  });
  const cellsWithMergedBorders = mergeImportedCellBorders(splitGrid.cells, overflowGrid.mergedCells);
  const { medias, images } = buildModernExcelImages(worksheet, workbook, overflowGrid.rowHeights, fittedColumnWidths);

  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation,
    canvasMode: 'sheet',
    paperMode: 'table',
    grid: {
      rowHeights: overflowGrid.rowHeights,
      columnWidths: fittedColumnWidths,
      cells: cellsWithMergedBorders,
      mergedCells: overflowGrid.mergedCells,
      medias,
      images,
    },
  });
}

async function importLegacyExcel(file: File, pageId: string, pageName: string): Promise<CanvasPage> {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: 'array',
    cellStyles: true,
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = sheetName ? workbook.Sheets[sheetName] : null;
  if (!worksheet) {
    throw new Error('Excel 文件中未找到可导入工作表');
  }

  const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
  const rowCount = clampImportedRowCount(range.e.r - range.s.r + 1);
  const columnCount = clampImportedColumnCount(range.e.c - range.s.c + 1);
  const rowHeights = Array.from({ length: rowCount }, (_, index) => {
    const row = worksheet['!rows']?.[index];
    return Math.max(
      24,
      Math.round(Number(row?.hpx ?? (typeof row?.hpt === 'number' ? row.hpt * PX_PER_POINT : DEFAULT_ROW_HEIGHT))),
    );
  });
  const columnWidths = Array.from({ length: columnCount }, (_, index) => {
    const column = worksheet['!cols']?.[index];
    return Math.max(
      48,
      Math.round(Number(column?.wpx ?? (typeof column?.wch === 'number' ? column.wch * 7 + 14 : DEFAULT_COLUMN_WIDTH))),
    );
  });
  const mergedCells = filterMergedRanges(
    (worksheet['!merges'] ?? []).map((entry) => ({
      t: entry.s.r + 1,
      l: entry.s.c + 1,
      b: entry.e.r + 1,
      r: entry.e.c + 1,
    })),
    rowCount,
    columnCount,
  );
  const mergedSecondaryKeys = buildMergedSecondaryCellSet(mergedCells);
  const cells: Record<string, CanvasSheetCell> = {};

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let colIndex = 0; colIndex < columnCount; colIndex += 1) {
      const address = XLSX.utils.encode_cell({
        r: range.s.r + rowIndex,
        c: range.s.c + colIndex,
      });
      const cell = worksheet[address];
      if (!cell) continue;
      const cellKey = getCellKey(rowIndex + 1, colIndex + 1);
      const style = buildLegacyCellStyle(cell);
      const border = buildLegacyCellBorder(cell);
      const value = mergedSecondaryKeys.has(cellKey) ? '' : normalizeCellValue(cell.v, cell.w, getLegacyCellFontName(cell));
      if (!value && !hasCellStyle(style, border)) continue;
      cells[cellKey] = {
        value,
        style,
        border,
      };
    }
  }

  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const initialTotalHeight = rowHeights.reduce((sum, height) => sum + height, 0);
  const orientation = normalizeImportedOrientation(undefined, totalWidth, initialTotalHeight);
  const fittedColumnWidths = fitImportedColumnWidthsToPaper(columnWidths, orientation);
  const splitGrid = applyMergedWhitespaceSplits(cells, mergedCells, fittedColumnWidths);
  const overflowGrid = applyLongTextOverflowLayout({
    rowHeights,
    columnWidths: fittedColumnWidths,
    cells: splitGrid.cells,
    mergedCells: splitGrid.remainingMergedCells,
  });
  const cellsWithMergedBorders = mergeImportedCellBorders(splitGrid.cells, overflowGrid.mergedCells);

  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation,
    canvasMode: 'sheet',
    paperMode: 'table',
    grid: {
      rowHeights: overflowGrid.rowHeights,
      columnWidths: fittedColumnWidths,
      cells: cellsWithMergedBorders,
      mergedCells: overflowGrid.mergedCells,
    },
  });
}

export async function importExcelToCanvasPage(
  file: File,
  options?: { pageId?: string; pageName?: string },
): Promise<CanvasPage> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const pageId = options?.pageId ?? 'page-1';
  const pageName = options?.pageName ?? '页面 1';

  if (extension === 'xls') {
    return importLegacyExcel(file, pageId, pageName);
  }
  return importModernExcel(file, pageId, pageName).catch(() => importLegacyExcel(file, pageId, pageName));
}
