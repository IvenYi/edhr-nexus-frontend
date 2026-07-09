<template>
  <div>
    <a-date-picker
      :value="defaultValue"
      v-if="isTraceDate"
      class="w-full"
      :format="fieldWidget.format"
      :placeholder="fieldWidget.placeholder"
      :disabled="disabled"
    />
    <a-input
      :disabled="disabled"
      :placeholder="fieldWidget.placeholder"
      v-else-if="fieldWidget.renderComp === CellWidgetRenderComp.Input"
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
  import { computed } from 'vue';
  import dayjs from 'dayjs';
  import { FIELD_TYPE } from '@gct/runtime';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums';

  const props = defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Text;
    fieldMeta: IBindField;
  }>();

  const isTraceDate = computed(() => props.fieldMeta.fieldType === FIELD_TYPE.TRACE_DATE);

  const defaultValue = computed(() => {
    if (props.fieldWidget.defaultSystemDate) {
      return dayjs();
    }
    return undefined;
  });
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
