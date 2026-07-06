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
        ></span>
        <span class="page-thumbnails__label">第 {{ index + 1 }} 页</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useAllSpreadSheets, type ISheet } from '../hooks/useAllSpreadSheets';

  const { sheetsData, activeSheetId, changeActiveSheet } = useAllSpreadSheets();
  const EMPTY_PAGE_ID = '__empty_page_thumbnail__';
  const thumbnailPages = computed<ISheet[]>(() => {
    return sheetsData.value.length
      ? sheetsData.value
      : [
          {
            sheetId: EMPTY_PAGE_ID,
            title: '第 1 页',
            paper: undefined as unknown as ISheet['paper'],
          },
        ];
  });

  const handleThumbnailClick = (sheet: ISheet) => {
    if (sheet.sheetId === EMPTY_PAGE_ID) return;
    changeActiveSheet(sheet);
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
      background: #d8d8d8;
      color: #3f4552;
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
      width: clamp(54px, 42%, 78px);
      aspect-ratio: 0.8 / 1;
      height: auto;
      margin-bottom: 12px;
      background: #fff;
      box-shadow: 0 0 0 1px #eeeeee;

      &--landscape {
        width: clamp(72px, 58%, 98px);
        aspect-ratio: 1.69 / 1;
        height: auto;
        margin-top: 20px;
        margin-bottom: 32px;
      }
    }

    &__label {
      display: block;
      color: inherit;
      font-size: 16px;
      line-height: 24px;
    }
  }
</style>
