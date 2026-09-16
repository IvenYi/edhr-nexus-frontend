import type { CanvasPage } from '../types';

const MM_TO_PX = 96 / 25.4;
const A4_PAPER_WIDTH_MM = 210;
const A4_PAPER_HEIGHT_MM = 297;
const PAGE_MIN_PADDING = 24;

function readNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getFormPagePaperMetrics(page: CanvasPage, gridWidth: number, gridHeight: number) {
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
