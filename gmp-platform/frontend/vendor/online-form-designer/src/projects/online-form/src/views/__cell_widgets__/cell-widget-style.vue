<template>
  <div class="cell-widget-style">
    <CompSizeEditor
      :fieldType="fieldMeta.fieldType"
      :widget="fieldWidget"
      :disabled="disabled || disabledCellSize"
      v-model:compHeight="formState.compHeight"
      v-model:compWidth="formState.compWidth"
    />
    <component
      :is="CellWidgetStyleMap[FieldTypeToCellWidgetMap[fieldMeta.fieldType!]]"
      :widget="fieldWidget"
      :fieldType="fieldMeta.fieldType"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import { asyncImportWidgetStyle } from '/@online-form/views/__cell_widgets__/index';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { FieldTypeToCellWidgetMap } from '/@online-form/views/designer/constants';
  import { computed } from 'vue';
  import CompSizeEditor from './common/comp-size-editor/comp-size-editor.vue';
  import type { IBindField } from '@gct/nocode-base';

  const CellWidgetStyleMap = asyncImportWidgetStyle();

  const props = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.BasicSchema;
    disabled: boolean;
    disabledCellSize: boolean;
  }>();

  const formState = computed({
    get() {
      return props.fieldWidget;
    },
    set(v) {
      Object.assign(props.fieldWidget, v);
    },
  });
</script>

<style lang="less" scoped>
  .cell-widget-style {
    // 统一样式压制
    :deep(.ant-input) {
      font-size: 12px;
    }
    :deep(.ant-select) {
      font-size: 12px;
    }
    :deep(.ant-input-number) {
      font-size: 12px;
    }
    :deep(.ant-checkbox-wrapper) {
      font-size: 12px;
      .ant-checkbox-inner {
        height: 12px;
        width: 12px;
        &:after {
          height: 7.42857px;
          width: 4.314286px;
        }
      }
    }
  }
</style>
