<template>
  <div class="diff-sheet">
    <template v-if="tmpl">
      <div
        ref="SpreadSheetRef"
        class="spread-sheet diff-sheet__paper"
        :style="{
          '--paper-width': paperLayout.w + 'mm',
          '--paper-height': paperFitHeight + 'mm',
        }"
      >
        <div
          class="spread-sheet__viewport"
          ref="ViewPortScrollRef"
          @mousedown.capture="handleViewPortMouseDown"
        >
          <div class="spread-sheet__canvas">
            <spread-sheet-paper
              :key="activeSheet.sheetId"
              class="spread-sheet__paper"
              @click="(e) => e.stopPropagation()"
            />
          </div>
        </div>
      </div>
      <SheetsComp :readonly="true" />
    </template>
  </div>
</template>

<script lang="ts" setup name="diff-sheet">
  import {
    SpreadSheetEventType,
    SpreadSheetEvents,
  } from '/@online-form/views/designer/hooks/useSpreadSheetEvent';
  import { useDiffSheet } from './use-diff-sheet';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';

  import SpreadSheetPaper from '/@online-form/views/designer/modules/sheet/sheet-paper.vue';
  import SheetsComp from '/@online-form/views/designer/modules/sheets/index.vue';
  import { reactive, computed, watch, onUnmounted, ref, watchEffect } from 'vue';
  import { ICellInfo } from '/@online-form/views/designer/hooks/reverse-modeling/scan-field';

  const props = withDefaults(
    defineProps<{
      tmpl?: OnlineFormTmplResponse;
      selectedCell?: ICellInfo;
    }>(),
    {},
  );

  type SheetChangeEvent = SpreadSheetEvents[SpreadSheetEventType.SHEET_CHANGE];
  const emit = defineEmits<{
    (e: 'sheetChange', evt: SheetChangeEvent): void;
  }>();

  const {
    paperLayout,
    paperFitHeight,
    activeSheet,
    init,
    emitter,
    setActiveSheet: _setActiveSheet,
    selectCell,
  } = useDiffSheet();

  watch(
    () => props.selectedCell,
    (nowSelectedCell) => {
      if (!nowSelectedCell) {
        return;
      }
      // 选中单元格变更的时候,如需要,切换分页
      const nowSheetId = activeSheet.value?.sheetId;
      if (nowSelectedCell.sheetId !== nowSheetId) {
        _setActiveSheet(nowSelectedCell.sheetId!);
      }
    },
  );

  watchEffect(() => {
    // 选中和激活页签一致时选中单元格
    if (props.selectedCell && activeSheet.value?.sheetId === props.selectedCell.sheetId) {
      selectCell(props.selectedCell);
    }
  });

  watch(
    () => props.tmpl,
    (val) => {
      if (val) {
        console.log('初始化');
        init(val);
      }
    },
    { immediate: true },
  );

  /**
   * 点击viewport事件
   * @param event 事件对象
   */
  const handleViewPortMouseDown = (e): void => {
    // 阻止手动选中单元格和范围
    e.stopPropagation();
  };

  /** 跳过事件监听 */
  const skipEmit = ref(false);
  // 处理分页切换事件
  let onSheetChange = (e: SheetChangeEvent) => {
    if (skipEmit.value) {
      return;
    }
    console.log('onSheetChange', e);
    emit('sheetChange', e);
  };
  emitter.on(SpreadSheetEventType.SHEET_CHANGE, onSheetChange);
  onUnmounted(() => {
    emitter.off(SpreadSheetEventType.SHEET_CHANGE, onSheetChange);
  });

  const setActiveSheet = (key) => {
    skipEmit.value = true;
    _setActiveSheet(key);
    skipEmit.value = false;
  };

  defineExpose({
    setActiveSheet,
    selectCell,
  });
</script>

<style lang="less" scoped>
  .diff-sheet {
    display: flex;
    flex-direction: column;
    padding-right: 2px;

    &__paper {
      // 表单的样式调整
      flex-grow: 1;
      &.spread-sheet {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: 'viewport';
      }

      // 禁用动态表等标题的交互
      :deep(.dynamic-area__title) {
        pointer-events: none;
      }
    }
    .spread-sheet__viewport {
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: #cccccc;
        border-radius: 4px;
      }
    }
  }
</style>
