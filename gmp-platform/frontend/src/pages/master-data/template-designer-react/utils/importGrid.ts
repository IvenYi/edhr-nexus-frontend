import type {
  CanvasPage,
  CanvasPaperMode,
  CanvasPaperOrientation,
  CanvasSelectionRange,
  CanvasSheetCell,
  CanvasSheetImage,
  CanvasSheetMedia,
} from '../types';

export const MM_TO_PX = 96 / 25.4;
export const DEFAULT_ROW_HEIGHT = 36;
export const DEFAULT_COLUMN_WIDTH = 98;
export const DEFAULT_TOP_MARGIN_MM = 5;
export const DEFAULT_SIDE_MARGIN_MM = 6;
export const A4_PAPER_WIDTH_MM = 210;
export const A4_PAPER_HEIGHT_MM = 297;
export const MAX_IMPORT_ROWS = 300;
export const MAX_IMPORT_COLS = 75;

export interface ImportedGridModel {
  rowHeights: number[];
  columnWidths: number[];
  cells: Record<string, CanvasSheetCell>;
  mergedCells?: CanvasSelectionRange[];
  medias?: CanvasSheetMedia[];
  images?: CanvasSheetImage[];
}

export function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

export function clampImportedRowCount(rowCount: number) {
  return Math.max(1, Math.min(MAX_IMPORT_ROWS, Math.round(rowCount || 1)));
}

export function clampImportedColumnCount(columnCount: number) {
  return Math.max(1, Math.min(MAX_IMPORT_COLS, Math.round(columnCount || 1)));
}

export function normalizeImportedOrientation(
  explicit?: string | null,
  totalWidth = 0,
  totalHeight = 0,
) {
  if (explicit === 'landscape') return 'landscape';
  if (explicit === 'portrait') return 'portrait';
  const a4PortraitContentWidth = Math.round(((A4_PAPER_WIDTH_MM - DEFAULT_SIDE_MARGIN_MM * 2) * 96) / 25.4);
  if (totalWidth > a4PortraitContentWidth || totalWidth > totalHeight) {
    return 'landscape';
  }
  return 'portrait';
}

export function createImportedCanvasPage(params: {
  pageId: string;
  pageName: string;
  orientation: CanvasPaperOrientation;
  canvasMode: 'sheet' | 'paper';
  paperMode: CanvasPaperMode;
  grid: ImportedGridModel;
}) {
  const rowCount = clampImportedRowCount(params.grid.rowHeights.length || 1);
  const columnCount = clampImportedColumnCount(params.grid.columnWidths.length || 1);
  const rowHeights = Array.from({ length: rowCount }, (_, index) => (
    Math.max(24, Math.round(params.grid.rowHeights[index] ?? DEFAULT_ROW_HEIGHT))
  ));
  const columnWidths = Array.from({ length: columnCount }, (_, index) => (
    Math.max(36, Math.round(params.grid.columnWidths[index] ?? DEFAULT_COLUMN_WIDTH))
  ));

  return {
    id: params.pageId,
    name: params.pageName,
    nodes: [],
    sheet: {
      rowCount,
      columnCount,
      defaultRowHeight: DEFAULT_ROW_HEIGHT,
      defaultColumnWidth: DEFAULT_COLUMN_WIDTH,
      rowHeights,
      columnWidths,
      showGridLines: true,
      showHeader: false,
      showFooter: false,
      showRuler: true,
      canvasMode: params.canvasMode,
      paperMode: params.paperMode,
      paperOrientation: params.orientation,
      paperMarginTopMm: DEFAULT_TOP_MARGIN_MM,
      paperMarginRightMm: DEFAULT_SIDE_MARGIN_MM,
      paperMarginBottomMm: DEFAULT_SIDE_MARGIN_MM,
      paperMarginLeftMm: DEFAULT_SIDE_MARGIN_MM,
    },
    cells: params.grid.cells,
    mergedCells: (params.grid.mergedCells ?? []).filter((range) => (
      range.t <= rowCount
      && range.l <= columnCount
      && range.b >= range.t
      && range.r >= range.l
    )).map((range) => ({
      t: Math.max(1, range.t),
      l: Math.max(1, range.l),
      b: Math.min(rowCount, range.b),
      r: Math.min(columnCount, range.r),
    })),
    medias: params.grid.medias ?? [],
    images: params.grid.images ?? [],
  } satisfies CanvasPage;
}

export function base64FromBytes(input: unknown) {
  if (!input) {
    return '';
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
    return input.toString('base64');
  }

  const bytes = input instanceof Uint8Array
    ? input
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : ArrayBuffer.isView(input)
        ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
        : null;

  if (!bytes) {
    const maybeToString = (input as { toString?: (encoding?: string) => string } | null)?.toString;
    return typeof maybeToString === 'function' ? maybeToString.call(input, 'base64') : '';
  }

  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

export function buildDataUrl(input: unknown, mimeType: string) {
  const base64 = base64FromBytes(input);
  return base64 ? `data:${mimeType};base64,${base64}` : '';
}
