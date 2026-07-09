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
  getCellKey,
  normalizeImportedOrientation,
} from './importGrid';

const PX_PER_POINT = 96 / 72;
const EMU_PER_PX = 9525;

function pointsToPx(value?: number | null, fallback = DEFAULT_ROW_HEIGHT) {
  if (!Number.isFinite(value) || !value) return fallback;
  return Math.max(24, Math.round(Number(value) * PX_PER_POINT));
}

function excelColumnWidthToPx(value?: number | null, fallback = DEFAULT_COLUMN_WIDTH) {
  if (!Number.isFinite(value) || !value) return fallback;
  return Math.max(48, Math.round(Number(value) * 7 + 14));
}

function normalizeCellValue(value: unknown, text?: string) {
  if (typeof text === 'string' && text.trim()) return text;
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
  if (typeof value === 'object') {
    if (Array.isArray((value as { richText?: Array<{ text?: string }> }).richText)) {
      return ((value as { richText: Array<{ text?: string }> }).richText ?? [])
        .map((item) => item.text ?? '')
        .join('');
    }
    if ('text' in (value as Record<string, unknown>) && typeof (value as { text?: unknown }).text === 'string') {
      return String((value as { text?: unknown }).text ?? '');
    }
    if ('result' in (value as Record<string, unknown>)) {
      return String((value as { result?: unknown }).result ?? '');
    }
    if ('formula' in (value as Record<string, unknown>)) {
      const result = (value as { result?: unknown }).result;
      return result == null ? '' : String(result);
    }
  }
  return String(value);
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

function buildExcelJsCellStyle(cell: ExcelJS.Cell) {
  const style: Record<string, unknown> = {};
  if (cell.font?.bold) style.fontWeight = 'bold';
  if (cell.font?.italic) style.fontStyle = 'italic';
  if (cell.font?.underline) style.textDecoration = 'underline';
  if (typeof cell.font?.size === 'number') style.fontSize = Math.max(12, Math.round(cell.font.size * PX_PER_POINT));
  if (cell.font?.color?.argb) style.color = normalizeExcelColor(cell.font.color.argb);
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
  return Object.values(nextBorder).some(Boolean) ? nextBorder : undefined;
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

function buildLegacyCellBorder(cell: XLSX.CellObject): CanvasCellBorder | undefined {
  const source = ((cell as XLSX.CellObject & { s?: Record<string, unknown> }).s?.border ?? {}) as Record<string, unknown>;
  const border: CanvasCellBorder = {
    top: Boolean(source.top),
    right: Boolean(source.right),
    bottom: Boolean(source.bottom),
    left: Boolean(source.left),
  };
  return Object.values(border).some(Boolean) ? border : undefined;
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
      const style = buildExcelJsCellStyle(cell);
      const border = buildExcelJsCellBorder(cell);
      const cellKey = getCellKey(rowIndex, colIndex);
      const value = mergedSecondaryKeys.has(cellKey) ? '' : normalizeCellValue(cell.value, cell.text);
      if (!value && !hasCellStyle(style, border)) continue;
      cells[cellKey] = {
        value,
        style,
        border,
      };
    }
  }

  const { medias, images } = buildModernExcelImages(worksheet, workbook, rowHeights, columnWidths);
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0);

  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation: normalizeImportedOrientation(worksheet.pageSetup?.orientation, totalWidth, totalHeight),
    canvasMode: 'sheet',
    paperMode: 'table',
    grid: {
      rowHeights,
      columnWidths,
      cells,
      mergedCells,
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
      const value = mergedSecondaryKeys.has(cellKey) ? '' : normalizeCellValue(cell.v, cell.w);
      if (!value && !hasCellStyle(style, border)) continue;
      cells[cellKey] = {
        value,
        style,
        border,
      };
    }
  }

  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0);

  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation: normalizeImportedOrientation(undefined, totalWidth, totalHeight),
    canvasMode: 'sheet',
    paperMode: 'table',
    grid: {
      rowHeights,
      columnWidths,
      cells,
      mergedCells,
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
