<template>
  <template v-if="!readonly">
    <form-item :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
      <a-input
        size="small"
        v-model:value="formState.placeholder"
        :placeholder="t('sys.inputText')"
        :disabled="disabled"
        show-count
        :maxlength="32"
      />
    </form-item>
    <DefaultValueEditor :widget="widget" :precision="NaN" :disabled="disabled" />
    <DecimalDisplayMode
      v-if="showConfig"
      v-model:value="formState.displayMode"
      :disabled="disabled"
    />
    <NumberRangeEditor
      :widget="widget"
      :fieldMeta="fieldMeta"
      :readonly="readonly"
      :precision="NaN"
      :disabled="disabled"
    />
  </template>

  <IndicesEditor
    v-if="showConfig"
    v-model:is-super-script="formState.isSuperScript"
    v-model:script-value="formState.scriptValue"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import IndicesEditor from '../common/indices-editor/indices-editor.vue';
  import { computed } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DefaultValueEditor from '../common/default-value-editor/default-value-editor.vue';
  import NumberRangeEditor from '../common/number-range/number-range-editor.vue';
  import DecimalDisplayMode from '../common/decimal-display-mode/decimal-display-mode.vue';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const props = defineProps<{
    fieldMeta: IBindField;
    widget: CellWidget.Double;
    fieldType: FIELD_TYPE;
    /** 打印或者关联模型字段 */
    readonly: boolean;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const showConfig = computed(() => {
    return ![
      FIELD_TYPE.GOOD_QTY,
      FIELD_TYPE.NOT_GOOD_QTY,
      FIELD_TYPE.SCRAP_QTY,
      FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
      FIELD_TYPE.PRODUCT_CHECK_QTY,
      FIELD_TYPE.MATERIAL_CHECK_QTY,
    ].includes(props.fieldType);
  });
</script>

<style></style>
