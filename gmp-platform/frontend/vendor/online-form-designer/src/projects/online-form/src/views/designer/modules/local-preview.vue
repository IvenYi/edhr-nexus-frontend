<template>
  <div class="local-preview">
    <div class="local-preview__bar">
      <span>{{ title }}</span>
      <a-button type="primary" size="small" @click="backToDesigner">返回设计器</a-button>
    </div>
    <div class="local-preview__paper">
      <div class="local-preview__sheet" :style="paperStyle">
        <template v-for="cell in visibleCells" :key="cell.id || `${cell.row}_${cell.col}`">
          <div class="local-preview__cell" :style="getCellStyle(cell)">
            {{ getCellText(cell) }}
          </div>
        </template>
        <template v-for="widget in paper.paperWidgets || []" :key="widget.id">
          <div class="local-preview__widget" :style="getWidgetStyle(widget)">
            {{ widget.value || widget.title || widget.name || '' }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    getLocalDesignerDocument,
    LOCAL_FORM_DESIGNER_ID,
  } from '/@online-form/views/designer/hooks/local-designer-cache';
  import { DefaultPaper } from '/@online-form/views/designer/constants';

  const router = useRouter();
  const doc = computed(() => getLocalDesignerDocument());
  const designerJson = computed(() => {
    try {
      return JSON.parse(doc.value.designerJson || '{}');
    } catch {
      return {};
    }
  });
  const paper = computed(() => designerJson.value.sheets?.[0]?.paper || DefaultPaper);
  const title = computed(
    () => `${doc.value.name || '本地表单预览'} : ${doc.value.version || 'V1'}`,
  );
  const rows = computed(() => paper.value.rows || []);
  const cols = computed(() => paper.value.cols || []);
  const visibleCells = computed(() => (paper.value.cells || []).filter((cell) => !cell.hidden));
  const paperStyle = computed(() => ({
    width: `${cols.value.reduce((sum, item) => sum + (item.width || 0), 0)}px`,
    height: `${rows.value.reduce((sum, item) => sum + (item.height || 0), 0)}px`,
  }));

  function sumSize(list: any[], endIndex: number, key: string) {
    return list.slice(0, endIndex).reduce((sum, item) => sum + (item[key] || 0), 0);
  }

  function getCellStyle(cell: any) {
    const row = cell.row ?? cell.r ?? 0;
    const col = cell.col ?? cell.c ?? 0;
    const rowSpan = cell.rowSpan || cell.rs || 1;
    const colSpan = cell.colSpan || cell.cs || 1;
    return {
      top: `${sumSize(rows.value, row, 'height')}px`,
      left: `${sumSize(cols.value, col, 'width')}px`,
      width: `${sumSize(cols.value.slice(col), colSpan, 'width')}px`,
      height: `${sumSize(rows.value.slice(row), rowSpan, 'height')}px`,
    };
  }

  function getWidgetStyle(widget: any) {
    const position = widget.position || {};
    return {
      top: `${position.top ?? widget.top ?? 0}px`,
      left: `${position.left ?? widget.left ?? 0}px`,
      width: `${position.width ?? widget.width ?? 120}px`,
      height: `${position.height ?? widget.height ?? 32}px`,
    };
  }

  function getCellText(cell: any) {
    return cell.value || cell.text || cell.label || cell.field?.name || '';
  }

  function backToDesigner() {
    router.push(`/Online-form-designer/${LOCAL_FORM_DESIGNER_ID}?local=1`);
  }
</script>

<style lang="less" scoped>
  .local-preview {
    min-height: 100vh;
    background: #f4f6f8;
  }

  .local-preview__bar {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #1f2329;
    background: #fff;
    border-bottom: 1px solid #e5e6eb;
  }

  .local-preview__paper {
    padding: 24px;
    overflow: auto;
  }

  .local-preview__sheet {
    position: relative;
    margin: 0 auto;
    min-width: 794px;
    min-height: 1123px;
    background: #fff;
    box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
  }

  .local-preview__cell,
  .local-preview__widget {
    position: absolute;
    box-sizing: border-box;
    padding: 4px 6px;
    overflow: hidden;
    white-space: pre-wrap;
    color: #1f2329;
  }

  .local-preview__cell {
    border: 1px solid #d9dde3;
  }

  .local-preview__widget {
    border: 1px dashed #4e7fff;
    background: rgb(78 127 255 / 6%);
  }
</style>
