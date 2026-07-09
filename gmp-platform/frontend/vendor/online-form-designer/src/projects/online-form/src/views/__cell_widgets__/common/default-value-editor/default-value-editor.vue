<template>
  <form-item :label="`${t('sys.defaultValue')}`" :inline="false">
    <a-input-number
      :precision="precision"
      size="small"
      v-model:value="formState.defaultValue"
      :placeholder="t('sys.inputText')"
      v-bind="attrs"
      :disabled="disabled"
    />
  </form-item>
</template>

<script setup lang="ts" name="default-value-editor">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { RangeValidateMode } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      widget: CellWidget.Integer | CellWidget.Double | CellWidget.Decimal;
      precision?: number;
      disabled: boolean;
    }>(),
    {},
  );

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const attrs = computed(() => {
    const params = {};
    if (formState.value.enableRangeValidate) {
      if (formState.value.maxValidateMode === RangeValidateMode.Fixed_Number) {
        Object.assign(params, {
          max: formState.value.max,
        });
      }

      if (formState.value.minValidateMode === RangeValidateMode.Fixed_Number) {
        Object.assign(params, {
          min: formState.value.min,
        });
      }
    }
    return params;
  });
</script>

<style scoped></style>
