<template>
  <component
    :is="widgetRenderMap[widget.type]"
    :widget="widget"
    :modelValue="readonlyValue"
    :model-value-multi="modelValueMulti"
    :pageNumber="pageNumber"
    :pageTotal="pageTotal"
    :is-in-cell="isInCell"
  />
</template>

<script setup lang="ts">
  import { computed, onBeforeMount, reactive, ref, watch, inject } from 'vue';
  import { widgetRenderMap } from '/@online-form/views/__widgets__';

  import { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import {
    PaperWidgeType,
    PaperWidgeValueType,
    useCurrentPageFormState,
    useWidgetStaticAttrs,
    renderUtils,
    useCalculateFormula,
  } from '@gct/nocode-base';

  const props = defineProps<{
    widget: PaperWidget.BasicSchema;
    pageNumber?: number;
    pageTotal?: number;
    pageFormState: any;
    isInCell?: boolean;
  }>();

  const { valueType, value, startField, endField, type } = reactive(props.widget);

  const readonlyValue = ref();

  const { currentPageFormState } = useCurrentPageFormState();

  const { targetFieldId, fieldType, options } = useWidgetStaticAttrs(props.widget);

  const { calculateFormula } = useCalculateFormula();

  const getFieldValue = (value, data) => {
    const fieldKey = targetFieldId || (props.widget.isFieldModel ? props.widget.fieldLink : value);
    
    const modelValue = data?.[fieldKey];

    let text = data?._DICT?.[fieldKey!]?.[modelValue ?? ''] || modelValue;

    if (fieldType === FIELD_TYPE.BOOLEAN) {
      let val = renderUtils.getBoolValue(text);
      text = options.find((item) => item.value === val)?.label ?? '';
    }
    return text;
  };

  const modelValue = computed(() => {
    let text = value;

    if (valueType === PaperWidgeValueType.Field) {
      text = getFieldValue(text, props.pageFormState);
    }
    return Array.isArray(text) ? text.join() : text;
  });

  /**
   * 多字段值
   */
  const modelValueMulti = computed(() => {
    if (type === PaperWidgeType.TimeDiff) {
      const startValue = startField.field
        ? getFieldValue(startField.field, props.pageFormState)
        : null;
      const endValue = endField.field ? getFieldValue(endField.field, props.pageFormState) : null;
      return [startValue, endValue];
    } else if (type === PaperWidgeType.Diagonal) {
      // 分栏组件的多字段值处理
      const bindFields = (props.widget as PaperWidget.Diagonal).bindFields;
      if (bindFields) {
        return bindFields.map((item) => {
          if (!item) {
            return null;
          }
          return getFieldValue(item.field, props.pageFormState);
        });
      }
    }
    return null;
  });

  watch(
    [() => modelValue.value, () => currentPageFormState.value],
    () => {
      if (valueType === PaperWidgeValueType.Formula) {
        calculateFormula(modelValue.value!, props.pageFormState, currentPageFormState.value).then(
          (formulaValue) => {
            readonlyValue.value = formulaValue;
          },
        );
      } else {
        readonlyValue.value = modelValue.value;
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style scoped></style>
