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

    <DefaultValueEditor :widget="widget" :precision="0" :disabled="disabled" />
    <NumberRangeEditor
      :widget="widget"
      :fieldMeta="fieldMeta"
      :readonly="readonly"
      :precision="0"
      :disabled="disabled"
    />
    <NumberStepCounterEditor
      :widget="widget"
      :readonly="readonly"
      :precision="0"
      :disabled="disabled"
    />
  </template>

  <IndicesEditor
    v-model:is-super-script="formState.isSuperScript"
    v-model:script-value="formState.scriptValue"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import NumberRangeEditor from '../common/number-range/number-range-editor.vue';
  import DefaultValueEditor from '../common/default-value-editor/default-value-editor.vue';
  import NumberStepCounterEditor from '../common/number-step-counter-editor/number-step-counter-editor.vue';
  import IndicesEditor from '../common/indices-editor/indices-editor.vue';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const props = defineProps<{
    fieldMeta: IBindField;
    widget: CellWidget.Integer;
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
</script>

<style></style>
