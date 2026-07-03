<template>
  <div>
    <a-input
      :disabled="disabled"
      :placeholder="fieldWidget.placeholder"
      v-if="fieldWidget.renderComp === CellWidgetRenderComp.Input"
      :value="fieldWidget.defaultValue"
      size="small"
    />
    <a-textarea
      v-else
      class="cell-text-design-textarea-warp"
      :disabled="disabled"
      :placeholder="fieldWidget.placeholder"
      :value="fieldWidget.defaultValue"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums';

  defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Text;
  }>();
</script>

<style scoped lang="less">
  .cell-text-design-textarea-warp {
    padding: 4px;
    border-radius: 2px;

    height: var(--cmp-height) !important;
    min-height: var(--cmp-height) !important;
    max-height: var(--cmp-height) !important;
    resize: none;
  }
</style>
