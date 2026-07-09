<template>
  <div class="w-full h-full relative online-form-sheet-view" :class="[!isRecord && 'ks-column']">
    <a-spin v-if="loading" size="large" />
    <div v-if="sheetNull" class="h-full w-full flex items-center justify-center">
      <a-empty :image="NoDataSvg" />
    </div>
    <file-view v-else-if="doc.formType === FormTypeEnum.FILE" />
    <div
      v-else
      ref="SpreadSheetRef"
      class="spread-sheet important-block important-w-full important-h-full overflow-auto"
      :style="{
        '--paper-width': paperLayout.w + 'mm',
        '--paper-height': paperFitHeight + 'mm',
      }"
    >
      <div class="spread-sheet__canvas">
        <spread-sheet-paper
          :key="activeSheet.sheetId"
          class="spread-sheet__paper"
          :style="{
            'pointer-events': 'none',
          }"
        />
      </div>
    </div>
    <div v-if="!loading && !sheetNull && doc.formType !== FormTypeEnum.FILE && !isRecord">
      <SheetsComp :readonly="true" />
    </div>
    <slot v-if="!loading && !sheetNull" name="logbookFormConfig"></slot>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FormTypeEnum } from '@gct/nocode-base';
  import SpreadSheetPaper from './sheet/sheet-paper.vue';
  import FileView from './file-view.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import NoDataSvg from '/@online-form/assets/no-data.svg';
  import SheetsComp from './sheets/index.vue';
  import { useAllSpreadSheets } from '../hooks/useAllSpreadSheets';

  defineProps<{
    loading?: boolean;
    sheetNull?: boolean;
    isRecord?: number; // 是否是记录本
  }>();

  const SpreadSheetRef = ref();

  const { paperLayout, paperFitHeight, doc, paper } = useSpreadSheet();
  const { activeSheet } = useAllSpreadSheets();
</script>

<style lang="less" scoped>
  .ant-spin-spinning {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 1);
  }
</style>
