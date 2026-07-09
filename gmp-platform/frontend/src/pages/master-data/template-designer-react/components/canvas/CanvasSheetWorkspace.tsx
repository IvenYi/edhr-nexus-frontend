import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import { Box, Button, InputAdornment, Menu, MenuItem, Stack, TextField } from '@mui/material';
import CanvasDropZone from './CanvasDropZone';
import CanvasNodeRenderer from './CanvasNodeRenderer';
import type { CanvasSelectedCell, CanvasSelectionRange } from '../../types';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';

const columnLabels = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
const scrollbarWidth = 18;
const MM_TO_PX = 96 / 25.4;
const A4_PAPER_WIDTH_MM = 210;
const A4_PAPER_HEIGHT_MM = 297;

type DragState =
  | { type: 'cell'; startRow: number; startCol: number }
  | { type: 'column'; startCol: number }
  | { type: 'row'; startRow: number }
  | { type: 'resize-column'; startCol: number; startWidth: number; startX: number }
  | { type: 'resize-row'; startRow: number; startHeight: number; startY: number }
  | null;

type MenuAxis = 'column' | 'row';

interface SheetMenuState {
  axis: MenuAxis;
  mouseX: number;
  mouseY: number;
}

type CanvasSettingsPanel = 'paper-mode' | 'paper-orientation' | 'paper-spacing';

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

function isInRange(range: CanvasSelectionRange | null, row: number, col: number) {
  if (!range) return false;
  return row >= range.t && row <= range.b && col >= range.l && col <= range.r;
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

function buildSingleCellRange(cell: CanvasSelectedCell | null): CanvasSelectionRange | null {
  if (!cell) return null;
  return { t: cell.row, l: cell.col, b: cell.row, r: cell.col };
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

export default function CanvasSheetWorkspace() {
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const selectedCell = useTemplateDesignerStore((state) => state.selectedCell);
  const selectedRange = useTemplateDesignerStore((state) => state.selectedRange);
  const setSelectedRange = useTemplateDesignerStore((state) => state.setSelectedRange);
  const updateCurrentPageSheet = useTemplateDesignerStore((state) => state.updateCurrentPageSheet);
  const selectAllCells = useTemplateDesignerStore((state) => state.selectAllCells);
  const selectColumnRange = useTemplateDesignerStore((state) => state.selectColumnRange);
  const selectRowRange = useTemplateDesignerStore((state) => state.selectRowRange);
  const insertSheetColumns = useTemplateDesignerStore((state) => state.insertSheetColumns);
  const insertSheetRows = useTemplateDesignerStore((state) => state.insertSheetRows);
  const setSheetColumnWidth = useTemplateDesignerStore((state) => state.setSheetColumnWidth);
  const setSheetRowHeight = useTemplateDesignerStore((state) => state.setSheetRowHeight);
  const updateSheetCellValue = useTemplateDesignerStore((state) => state.updateSheetCellValue);
  const setPagePreviewCount = useTemplateDesignerStore((state) => state.setPagePreviewCount);

  const [dragState, setDragState] = useState<DragState>(null);
  const [menuState, setMenuState] = useState<SheetMenuState | null>(null);
  const [paperSettingsOpen, setPaperSettingsOpen] = useState(false);
  const [settingsPopover, setSettingsPopover] = useState<CanvasSettingsPopoverState | null>(null);
  const [editingCell, setEditingCell] = useState<EditingCellState | null>(null);
  const canvasSettingsRef = useRef<HTMLDivElement | null>(null);
  const freeCanvasBodyRef = useRef<HTMLDivElement | null>(null);
  const sheetInteractionRef = useRef<HTMLDivElement | null>(null);
  const skipNextBlurCommitRef = useRef(false);
  const [freeCanvasMeasuredHeight, setFreeCanvasMeasuredHeight] = useState(480);
  const columns = useMemo(
    () => Array.from({ length: currentPage?.sheet.columnCount ?? 0 }, (_, index) => index + 1),
    [currentPage?.sheet.columnCount],
  );
  const rows = useMemo(
    () => Array.from({ length: currentPage?.sheet.rowCount ?? 0 }, (_, index) => index + 1),
    [currentPage?.sheet.rowCount],
  );
  const rawColumnWidths = columns.map((_, index) => currentPage?.sheet.columnWidths[index] ?? currentPage?.sheet.defaultColumnWidth ?? 98);
  const rowHeights = rows.map((_, index) => currentPage?.sheet.rowHeights[index] ?? currentPage?.sheet.defaultRowHeight ?? 36);
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
  const sheetWidth = columnOffsets[columnOffsets.length - 1];
  const sheetHeight = rowOffsets[rowOffsets.length - 1];
  const rowHeaderWidth = 42;
  const columnHeaderHeight = 36;
  const sheetPaperWidth = a4PaperWidthPx;
  const freeCanvasBodyHeight = Math.max(freeCanvasMeasuredHeight, 480);
  const paperBodyHeight = isFreeCanvas ? freeCanvasBodyHeight : sheetHeight;
  const rawPaperHeight = paperInsetTop + paperHeaderHeight + paperBodyHeight + paperFooterHeight + paperInsetBottom;
  const pageMarkerCount = isFreeCanvas ? Math.max(1, Math.ceil(rawPaperHeight / a4PaperHeightPx)) : 1;
  const sheetPaperHeight = isFreeCanvas ? pageMarkerCount * a4PaperHeightPx : Math.max(a4PaperHeightPx, rawPaperHeight);
  const paperContentHeight = sheetPaperHeight - paperInsetTop - paperInsetBottom;
  const showPaperRuler = currentPage?.sheet.showRuler ?? true;
  const paperRowHeaderWidth = showPaperRuler ? rowHeaderWidth : 0;
  const paperColumnHeaderHeight = showPaperRuler ? columnHeaderHeight : 0;
  const paperRulerColumns = useMemo(() => buildRulerUnits(paperContentWidth, paperRulerUnit), [paperContentWidth]);
  const paperRulerRows = useMemo(() => buildRulerUnits(paperContentHeight, paperRulerUnit), [paperContentHeight]);
  const paperRulerXTicks = useMemo(() => buildRulerTicks(paperContentWidth, paperRulerMinorStep), [paperContentWidth, paperRulerMinorStep]);
  const paperRulerYTicks = useMemo(() => buildRulerTicks(paperContentHeight, paperRulerMinorStep), [paperContentHeight, paperRulerMinorStep]);
  const rowHeaderOffsetTop = paperViewportGapTop + paperInsetTop + paperHeaderHeight;
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
  const paperWorkingHeight = isFreeCanvas ? Math.max(freeCanvasBodyHeight, absoluteNodeBottom, sheetHeight) : Math.max(sheetHeight, 480);
  const effectiveRange = selectedRange ?? buildSingleCellRange(selectedCell);
  const normalizedRange = effectiveRange ? normalizeRange(effectiveRange) : null;
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
  const mergedCellMaps = useMemo(
    () => buildMergedCellMaps(currentPage?.mergedCells ?? []),
    [currentPage?.mergedCells],
  );
  const mediaSrcMap = useMemo(
    () => new Map((currentPage?.medias ?? []).map((media) => [media.id, media.src])),
    [currentPage?.medias],
  );
  const hasSheetOverlayContent = Boolean(
    currentPage && (
      Object.keys(currentPage.cells).length
      || currentPage.images.length
      || currentPage.mergedCells.length
    ),
  );
  const clearSelection = () => {
    setSelectedRange(null, null);
  };
  const startEditingCell = (row: number, col: number, initialValue?: string) => {
    skipNextBlurCommitRef.current = false;
    const currentValue = currentPage?.cells[getCellKey(row, col)]?.value ?? '';
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
  const handleSheetKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (currentPage?.sheet.canvasMode !== 'sheet' || editingCell || !selectedCell) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (isPrintableCellInput(event.key)) {
      event.preventDefault();
      startEditingCell(selectedCell.row, selectedCell.col, event.key);
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      startEditingCell(selectedCell.row, selectedCell.col, '');
      return;
    }
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      startEditingCell(selectedCell.row, selectedCell.col);
    }
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
      setDragState(null);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.type === 'resize-column') {
        const nextWidth = dragState.startWidth + event.clientX - dragState.startX;
        setSheetColumnWidth(dragState.startCol, dragState.startCol, nextWidth);
      }

      if (dragState.type === 'resize-row') {
        const nextHeight = dragState.startHeight + event.clientY - dragState.startY;
        setSheetRowHeight(dragState.startRow, dragState.startRow, nextHeight);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);

    if (dragState.type === 'resize-column' || dragState.type === 'resize-row') {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragState, setSheetColumnWidth, setSheetRowHeight]);

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
    if (!currentPage) {
      return;
    }
    setPagePreviewCount(currentPage.id, pageMarkerCount);
  }, [currentPage, pageMarkerCount, setPagePreviewCount]);

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
    setMenuState({
      axis,
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const closeContextMenu = () => {
    setMenuState(null);
  };

  const handleMenuAction = (action: 'insert-before' | 'insert-after' | 'resize') => {
    if (!menuState || !normalizedRange || !currentPage) {
      closeContextMenu();
      return;
    }

    if (menuState.axis === 'column') {
      if (action === 'insert-before') {
        insertSheetColumns(normalizedRange.l, 1);
      }
      if (action === 'insert-after') {
        insertSheetColumns(normalizedRange.r + 1, 1);
      }
      if (action === 'resize') {
        const nextWidth = parsePromptNumber('设置列宽', rawColumnWidths[normalizedRange.l - 1] ?? currentPage.sheet.defaultColumnWidth);
        if (nextWidth !== null) {
          setSheetColumnWidth(normalizedRange.l, normalizedRange.r, nextWidth);
        }
      }
    }

    if (menuState.axis === 'row') {
      if (action === 'insert-before') {
        insertSheetRows(normalizedRange.t, 1);
      }
      if (action === 'insert-after') {
        insertSheetRows(normalizedRange.b + 1, 1);
      }
      if (action === 'resize') {
        const nextHeight = parsePromptNumber('设置行高', rowHeights[normalizedRange.t - 1] ?? currentPage.sheet.defaultRowHeight);
        if (nextHeight !== null) {
          setSheetRowHeight(normalizedRange.t, normalizedRange.b, nextHeight);
        }
      }
    }

    closeContextMenu();
  };

  if (!currentPage) {
    return null;
  }

  const renderImportedGrid = (mode: 'sheet' | 'paper') => (
    <Box
      sx={{
        position: mode === 'paper' ? 'absolute' : 'relative',
        top: mode === 'paper' ? 0 : undefined,
        left: mode === 'paper' ? 0 : undefined,
        width: sheetWidth,
        display: 'grid',
        gridTemplateColumns: columnTemplate,
        gridTemplateRows: rowTemplate,
      }}
    >
      {rows.flatMap((row, rowIndex) => columns.map((col, colIndex) => {
        const key = getCellKey(row, col);
        if (mergedCellMaps.skipSet.has(key)) {
          return null;
        }

        const cell = currentPage.cells[key];
        const mergedRange = mergedCellMaps.startMap.get(key);
        const isSelected = selectedCell?.row === row && selectedCell?.col === col;
        const isRangeActive = isInRange(normalizedRange, row, col);
        const isEditing = currentPage.sheet.canvasMode === 'sheet' && editingCell?.row === row && editingCell?.col === col;
        const verticalAlign = cell?.style?.verticalAlign;
        const textAlign = cell?.style?.textAlign;
        const cellBorder = cell?.border;
        const spanCols = mergedRange ? (mergedRange.r - mergedRange.l + 1) : 1;
        const spanRows = mergedRange ? (mergedRange.b - mergedRange.t + 1) : 1;
        const borderColor = '#9ea9ba';
        const gridColor = '#d9dee7';

        return (
          <Box
            key={key}
            data-sheet-cell-focus="true"
            tabIndex={-1}
            onMouseDown={(event) => {
              if (event.button !== 0) return;
              event.currentTarget.focus();
              setSelectedRange({ t: row, l: col, b: row, r: col }, { row, col });
              setDragState({ type: 'cell', startRow: row, startCol: col });
            }}
            onDoubleClick={(event) => {
              event.currentTarget.focus();
              setSelectedRange({ t: row, l: col, b: row, r: col }, { row, col });
              startEditingCell(row, col);
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
              handleSheetKeyDown(event);
            }}
            onMouseEnter={() => {
              if (dragState?.type !== 'cell') return;
              setSelectedRange(
                {
                  t: dragState.startRow,
                  l: dragState.startCol,
                  b: row,
                  r: col,
                },
                { row: dragState.startRow, col: dragState.startCol },
              );
            }}
            sx={{
              gridColumn: `${colIndex + 1} / span ${spanCols}`,
              gridRow: `${rowIndex + 1} / span ${spanRows}`,
              display: 'flex',
              alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
              justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : textAlign === 'justify' ? 'flex-start' : 'flex-start',
              px: `${resolveNumericStyle(cell?.style?.paddingLeft, 8)}px`,
              py: `${resolveNumericStyle(cell?.style?.paddingTop, 4)}px`,
              pr: `${resolveNumericStyle(cell?.style?.paddingRight, resolveNumericStyle(cell?.style?.paddingLeft, 8))}px`,
              pb: `${resolveNumericStyle(cell?.style?.paddingBottom, resolveNumericStyle(cell?.style?.paddingTop, 4))}px`,
              borderLeft: cellBorder?.left ? `1px solid ${borderColor}` : colIndex === 0 && currentPage.sheet.showGridLines ? `1px solid ${gridColor}` : 'none',
              borderTop: cellBorder?.top ? `1px solid ${borderColor}` : rowIndex === 0 && currentPage.sheet.showGridLines ? `1px solid ${gridColor}` : 'none',
              borderRight: cellBorder?.right ? `1px solid ${borderColor}` : currentPage.sheet.showGridLines ? `1px solid ${gridColor}` : '1px solid transparent',
              borderBottom: cellBorder?.bottom ? `1px solid ${borderColor}` : currentPage.sheet.showGridLines ? `1px solid ${gridColor}` : '1px solid transparent',
              bgcolor: isSelected ? '#dbeafe' : isRangeActive ? '#eef5ff' : (cell?.style?.backgroundColor ? String(cell.style.backgroundColor) : '#fff'),
              boxShadow: isSelected ? 'inset 0 0 0 2px #1274dd' : 'none',
              overflow: 'hidden',
              cursor: 'cell',
              color: String(cell?.style?.color ?? '#303133'),
              fontSize: resolveNumericStyle(cell?.style?.fontSize) || undefined,
              fontWeight: cell?.style?.fontWeight as string | undefined,
              fontStyle: cell?.style?.fontStyle as string | undefined,
              textDecoration: cell?.style?.textDecoration as string | undefined,
              whiteSpace: cell?.style?.whiteSpace === 'normal' ? 'normal' : 'nowrap',
              lineHeight: cell?.style?.lineHeight as string | number | undefined,
              fontFamily: cell?.style?.fontFamily as string | undefined,
              wordBreak: 'break-word',
              transition: 'background-color 120ms ease',
              '&:hover': {
                bgcolor: isSelected ? '#dbeafe' : isRangeActive ? '#eef5ff' : '#f8fbff',
              },
            }}
          >
            {isEditing ? (
              <TextField
                data-sheet-cell-editor="true"
                autoFocus
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
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitEditingCell(editingCell);
                  } else if (event.key === 'Escape') {
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
                  '& .MuiInputBase-root': {
                    height: '100%',
                    font: 'inherit',
                    color: 'inherit',
                    alignItems: verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center',
                  },
                  '& .MuiInputBase-input': {
                    p: 0,
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: textAlign === 'right' ? 'right' : textAlign === 'center' ? 'center' : 'left',
                  },
                }}
              />
            ) : (
              cell?.value ?? ''
            )}
          </Box>
        );
      }))}
      {currentPage.images.map((image) => {
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
      {selectionOutline ? (
        <Box
          data-selection-outline="selectionOutline"
          sx={{
            position: 'absolute',
            top: selectionOutline.top,
            left: selectionOutline.left,
            width: selectionOutline.width,
            height: selectionOutline.height,
            border: '2px solid #1274dd',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      ) : null}
    </Box>
  );

  if (currentPage.sheet.canvasMode === 'paper') {
    return (
      <Box
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
                zIndex: 20,
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
                      zIndex: 30,
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
                      zIndex: 25,
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
                    zIndex: 15,
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
                sx={{
                  minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                  display: 'flex',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #eef3f9 0%, #f7f9fc 100%)',
                }}
              >
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
                    {pageMarkerCount > 1 ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          pointerEvents: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        {Array.from({ length: pageMarkerCount - 1 }, (_, index) => {
                          const boundaryIndex = index + 1;
                          const pageNumber = boundaryIndex + 1;
                          const top = boundaryIndex * a4PaperHeightPx - paperInsetTop - paperHeaderHeight;
                          return (
                            <Box
                              key={`paper-page-break-${pageNumber}`}
                              sx={{
                                position: 'absolute',
                                top,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Box sx={{ flex: 1, borderTop: '1px dashed rgba(148, 163, 184, 0.58)' }} />
                              <Box
                                sx={{
                                  px: 1.5,
                                  mx: 1.25,
                                  height: 24,
                                  borderRadius: 999,
                                  bgcolor: 'rgba(255,255,255,0.96)',
                                  color: '#94a3b8',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  lineHeight: '24px',
                                  letterSpacing: '0.04em',
                                  boxShadow: '0 0 0 1px rgba(226, 232, 240, 0.92)',
                                }}
                              >
                                第{pageNumber}页
                              </Box>
                              <Box sx={{ flex: 1, borderTop: '1px dashed rgba(148, 163, 184, 0.58)' }} />
                            </Box>
                          );
                        })}
                      </Box>
                    ) : null}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
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
                      sx={{
                        position: 'relative',
                        minHeight: paperWorkingHeight,
                      }}
                    >
                      {hasSheetOverlayContent ? renderImportedGrid('paper') : null}
                      <CanvasDropZone parentId={null} />
                      <CanvasNodeRenderer nodes={currentPage.nodes} />
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
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: '#eef3f9', userSelect: 'none', position: 'relative' }}>
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
              gridTemplateColumns: `${rowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
              alignItems: 'stretch',
              position: 'sticky',
              top: 0,
              zIndex: 20,
            }}
          >
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
                zIndex: 30,
                height: columnHeaderHeight,
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
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 25,
                height: columnHeaderHeight,
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
                    const isColumnActive = normalizedRange ? col >= normalizedRange.l && col <= normalizedRange.r : false;
                    return (
                      <Box
                        key={`header-col-${col}`}
                        data-sheet-column-active={isColumnActive ? 'true' : 'false'}
                        onMouseDown={(event) => {
                          if (event.button !== 0) return;
                          selectColumnRange(col);
                          setDragState({ type: 'column', startCol: col });
                        }}
                        onMouseEnter={() => {
                          if (dragState?.type !== 'column') return;
                          selectColumnRange(dragState.startCol, col);
                        }}
                        onContextMenu={(event) => {
                          selectColumnRange(col);
                          openContextMenu('column', event);
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
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${rowHeaderWidth}px minmax(${sheetPaperWidth + paperViewportGapLeft + paperViewportGapRight}px, 1fr)`,
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                borderRight: '1px solid #d8e0eb',
                bgcolor: '#f6f8fc',
                position: 'sticky',
                left: 0,
                zIndex: 15,
              }}
            >
              <Box sx={{ height: rowHeaderOffsetTop }} />
              {rows.map((row, index) => {
                const isRowActive = normalizedRange ? row >= normalizedRange.t && row <= normalizedRange.b : false;
                return (
                  <Box
                      key={`header-row-${row}`}
                      data-sheet-row-active={isRowActive ? 'true' : 'false'}
                    onMouseDown={(event) => {
                      if (event.button !== 0) return;
                      selectRowRange(row);
                      setDragState({ type: 'row', startRow: row });
                    }}
                    onMouseEnter={() => {
                      if (dragState?.type !== 'row') return;
                      selectRowRange(dragState.startRow, row);
                    }}
                    onContextMenu={(event) => {
                      selectRowRange(row);
                      openContextMenu('row', event);
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

            <Box
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  clearSelection();
                }
              }}
              sx={{
                minHeight: sheetPaperHeight + paperViewportGapTop + paperViewportGapBottom,
                display: 'flex',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #eef3f9 0%, #f7f9fc 100%)',
              }}
            >
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
                    width: sheetWidth,
                  }}
                >
                  {renderImportedGrid('sheet')}
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
        <MenuItem onClick={() => handleMenuAction('insert-before')}>{menuState?.axis === 'column' ? '左侧新增列' : '上方新增行'}</MenuItem>
        <MenuItem onClick={() => handleMenuAction('insert-after')}>{menuState?.axis === 'column' ? '右侧新增列' : '下方新增行'}</MenuItem>
        <MenuItem onClick={() => handleMenuAction('resize')}>{menuState?.axis === 'column' ? '设置列宽' : '设置行高'}</MenuItem>
      </Menu>
    </Box>
  );
}
