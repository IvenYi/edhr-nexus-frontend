<template>
  <aside class="page-thumbnails">
    <div class="page-thumbnails__body">
      <button
        v-for="(sheet, index) in thumbnailPages"
        :key="sheet.sheetId"
        type="button"
        class="page-thumbnails__item"
        :class="{ 'page-thumbnails__item--active': activeSheetId === sheet.sheetId || sheet.sheetId === EMPTY_PAGE_ID }"
        @click="handleThumbnailClick(sheet)"
      >
        <span
          class="page-thumbnails__paper"
          :class="{ 'page-thumbnails__paper--landscape': sheet.paper?.orientation === 'landscape' }"
        >
          <span class="page-thumbnails__grid" :style="thumbnailGridStyle(sheet)">
            <span
              v-for="cell in thumbnailCells(sheet)"
              :key="cell.key"
              class="page-thumbnails__grid-cell"
              :style="cell.style"
            >
              {{ thumbnailCellText(cell.data) }}
            </span>
          </span>
        </span>
        <span class="page-thumbnails__label">第 {{ index + 1 }} 页</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useAllSpreadSheets, type ISheet } from '../hooks/useAllSpreadSheets';
  import { useSpreadSheet } from '../hooks/useSpreadSheet';
  import type { ICell, IPaper } from '../types';

  const { sheetsData, activeSheetId, changeActiveSheet } = useAllSpreadSheets();
  const { paper: currentPaper } = useSpreadSheet();
  const EMPTY_PAGE_ID = '__empty_page_thumbnail__';
  const MAX_THUMBNAIL_ROWS = 40;
  const MAX_THUMBNAIL_COLS = 26;
  const thumbnailPages = computed<ISheet[]>(() => {
    return sheetsData.value.length
      ? sheetsData.value
      : [
          {
            sheetId: EMPTY_PAGE_ID,
            title: '第 1 页',
            paper: currentPaper.value,
          },
        ];
  });

  const handleThumbnailClick = (sheet: ISheet) => {
    if (sheet.sheetId === EMPTY_PAGE_ID) return;
    changeActiveSheet(sheet);
  };

  const thumbnailRows = (sheet: ISheet) => {
    return (sheet.paper?.rows || []).slice(0, MAX_THUMBNAIL_ROWS);
  };

  const thumbnailCols = (sheet: ISheet) => {
    return (sheet.paper?.cols || []).slice(0, MAX_THUMBNAIL_COLS);
  };

  const thumbnailGridStyle = (sheet: ISheet) => {
    const cols = thumbnailCols(sheet);
    const rows = thumbnailRows(sheet);
    return {
      gridTemplateColumns: cols.map((col) => `${Math.max(col?.width || 1, 1)}fr`).join(' '),
      gridTemplateRows: rows.map((row) => `${Math.max(row?.height || 1, 1)}fr`).join(' '),
    };
  };

  const getMergedCell = (paper: IPaper, row: number, col: number) => {
    return paper.mergedCells?.find(
      (item) => item.t <= row && item.b >= row && item.l <= col && item.r >= col,
    );
  };

  const thumbnailCellText = (cell: ICell = {}) => {
    if (cell.value !== undefined && cell.value !== null) return String(cell.value);
    if (cell.fieldMeta?.name) return cell.fieldMeta.name;
    if (cell.paperWidget?.name) return cell.paperWidget.name;
    const multiFieldName = cell.multiFieldsContent?.find?.((item) => item.fieldMeta?.name)?.fieldMeta
      ?.name;
    return multiFieldName || '';
  };

  const buildThumbnailCellStyle = (
    cell: ICell,
    rowIndex: number,
    colIndex: number,
    rowSpan = 1,
    colSpan = 1,
  ) => {
    const style = cell?.style || {};
    return {
      gridRow: `${rowIndex + 1} / span ${rowSpan}`,
      gridColumn: `${colIndex + 1} / span ${colSpan}`,
      background: style['background-color'] || style.background || undefined,
      color: style.color || undefined,
      fontWeight: style['font-weight'] || undefined,
      textAlign: style['text-align'] || undefined,
    };
  };

  const thumbnailCells = (sheet: ISheet) => {
    const paper = sheet.paper;
    if (!paper) return [];

    const rows = thumbnailRows(sheet);
    const cols = thumbnailCols(sheet);
    return rows.flatMap((_, rowIndex) => {
      return cols
        .map((__, colIndex) => {
          const row = rowIndex + 1;
          const col = colIndex + 1;
          const mergedCell = getMergedCell(paper, row, col);
          if (mergedCell && (mergedCell.t !== row || mergedCell.l !== col)) {
            return undefined;
          }

          const rowSpan = mergedCell
            ? Math.min(mergedCell.b, rows.length) - mergedCell.t + 1
            : 1;
          const colSpan = mergedCell
            ? Math.min(mergedCell.r, cols.length) - mergedCell.l + 1
            : 1;
          const cell = paper.cells?.[rowIndex]?.[colIndex] || {};

          return {
            key: `${sheet.sheetId}-${row}-${col}`,
            data: cell,
            style: buildThumbnailCellStyle(cell, rowIndex, colIndex, rowSpan, colSpan),
          };
        })
        .filter(Boolean);
    });
  };
</script>

<style lang="less" scoped>
  .page-thumbnails {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 300px;
    overflow: hidden;
    background: #fff;

    &__body {
      flex: 1 1 auto;
      min-height: 0;
      padding: 16px 14px 24px;
      overflow-y: auto;
    }

    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: calc(100% - 28px);
      max-width: 190px;
      min-width: 132px;
      aspect-ratio: 1 / 0.96;
      height: auto;
      margin: 0 auto 14px;
      border: 1px solid transparent;
      border-radius: 3px;
      background: #f6f8fb;
      color: #6f7785;
      cursor: pointer;
      font-size: 16px;
      line-height: 24px;
      transition:
        border-color 0.16s ease,
        background-color 0.16s ease;

      &:hover,
      &--active {
        border-color: #1687e8;
        background: #eaf6ff;
      }
    }

    &__paper {
      display: block;
      width: clamp(58px, 46%, 82px);
      aspect-ratio: 0.8 / 1;
      height: auto;
      margin-bottom: 8px;
      background: #fff;
      overflow: hidden;
      box-shadow: 0 0 0 1px #e6ebf2;

      &--landscape {
        width: clamp(78px, 62%, 104px);
        aspect-ratio: 1.69 / 1;
        height: auto;
        margin-top: 20px;
        margin-bottom: 28px;
      }
    }

    &__grid {
      display: grid;
      width: 100%;
      height: 100%;
      background: #fff;
    }

    &__grid-cell {
      min-width: 0;
      min-height: 0;
      border-right: 1px solid #e2e7ef;
      border-bottom: 1px solid #e2e7ef;
      overflow: hidden;
      color: inherit;
      font-size: 6px;
      line-height: 1;
      text-overflow: clip;
      white-space: nowrap;
    }

    &__label {
      display: block;
      color: #6f7785;
      font-size: 12px;
      line-height: 18px;
    }
  }
</style>
