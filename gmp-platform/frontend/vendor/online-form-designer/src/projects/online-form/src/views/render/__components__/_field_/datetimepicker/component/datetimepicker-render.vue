<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <DatePicker
      :class="[
        'cell-basic-datetimepicker',
        (showRequired || showBorder) && 'is-show-required',
        outOfRange && 'datepicker-out-of-range',
        realFieldId,
      ]"
      v-model:value="value"
      :disabled="showDisabled"
      v-bind="separatorAttr"
      @change="onChange"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
      style="width: 100%"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-datetimepicker-render">
  import { reactive, computed, ref, onBeforeMount, onBeforeUnmount } from 'vue';
  import { DatePicker } from 'ant-design-vue';
  import { isNil } from 'lodash-es';
  import dayjs from 'dayjs';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import {
    DateFormat,
    RangeValidateMode,
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    useCurrentPageFormState,
    useCalculateFormula,
    useFormulaExpWatcher,
  } from '@gct/nocode-base';
  import datePickerLocaleCn from 'ant-design-vue/es/date-picker/locale/zh_CN';

  import type { DatePickerProps } from 'ant-design-vue';
  import type { IDateTimepicker } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IDateTimepicker;
    formData: Object;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { currentPageFormState } = useCurrentPageFormState();
  const { calculateFormula, getMergeParseInfos } = useCalculateFormula();

  const { value, onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const {
    dateType,
    format,
    enableCustomFormat,
    customFormat,
    minDate,
    minDateFormulaExpr,
    maxDate,
    maxDateFormulaExpr,
    enableRangeValidate,
    maxDateValidateMode,
    minDateValidateMode,
  } = reactive(props.widget.props);

  const { showRequired, showDisabled, placeholder } = useWidgetStaticAttrs(props.widget);

  const minFormulaValue = ref();
  const maxFormulaValue = ref();
  let onStop;

  const hasFixedMax = computed(
    () => maxDateValidateMode === RangeValidateMode.Fixed_Number && !isNil(maxDate),
  );
  const hasVarMax = computed(
    () =>
      maxDateValidateMode === RangeValidateMode.Variable_Validate && !isNaN(maxFormulaValue.value),
  );
  const hasFixedMin = computed(
    () => minDateValidateMode === RangeValidateMode.Fixed_Number && !isNil(minDate),
  );
  const hasVarMin = computed(
    () =>
      minDateValidateMode === RangeValidateMode.Variable_Validate && !isNaN(minFormulaValue.value),
  );

  const showBorder = computed(() => {
    return (
      enableRangeValidate &&
      (hasFixedMax.value || hasVarMax.value || hasFixedMin.value || hasVarMin.value)
    );
  });

  const maxTimestamp = computed<number | undefined>(() => {
    if (hasFixedMax.value) {
      return dayjs(maxDate).unix();
    }
    if (hasVarMax.value) {
      return maxFormulaValue.value;
    }
    return undefined;
  });

  const minTimestamp = computed<number | undefined>(() => {
    if (hasFixedMin.value) {
      return dayjs(minDate).unix();
    }
    if (hasVarMin.value) {
      return minFormulaValue.value;
    }
    return undefined;
  });

  const outOfRange = computed(() => {
    if (!enableRangeValidate) return false;

    // console.log({ max, min, maxTimestamp: maxTimestamp.value, minTimestamp: minTimestamp.value })
    return renderUtils.isOutOfRange(value.value, minTimestamp.value, maxTimestamp.value);
  });

  const separatorAttr = computed(() => {
    let attr: DatePickerProps = {
      allowClear: true,
      placeholder,
      valueFormat: DateFormat[dateType].valueFormat,
      format: enableCustomFormat ? customFormat : format,
      showTime: { format: dateType },
      locale: datePickerLocaleCn,
    };
    return attr;
  });

  const onCalculateFormula = (type) => {
    if (type === 'min') {
      return calculateFormula(minDateFormulaExpr!, props.formData, currentPageFormState.value);
    } else if (type === 'max') {
      return calculateFormula(maxDateFormulaExpr!, props.formData, currentPageFormState.value);
    }
  };

  onBeforeMount(() => {
    if (!enableRangeValidate) return;

    const needMinValidateCalc =
      !!minDateFormulaExpr && minDateValidateMode === RangeValidateMode.Variable_Validate;
    const needMaxValidateCalc =
      !!maxDateFormulaExpr && maxDateValidateMode === RangeValidateMode.Variable_Validate;

    const parseInfos = getMergeParseInfos({
      minFormulaExpr: needMinValidateCalc ? minDateFormulaExpr : '',
      maxFormulaExpr: needMaxValidateCalc ? maxDateFormulaExpr : '',
    });

    const { setupWatchesFromMerged, stop } = useFormulaExpWatcher({
      props: props,
      currentPageFormState,
      needMinValidateCalc,
      needMaxValidateCalc,
      onCalculateFormula,
      onMinComputed: (v) => (minFormulaValue.value = v),
      onMaxComputed: (v) => (maxFormulaValue.value = v),
      debounceMs: 200,
    });

    setupWatchesFromMerged(parseInfos);
    onStop = stop;
  });

  onBeforeUnmount(() => {
    onStop?.();
  });

  function readonlyCallback(val) {
    if (val) {
      return dayjs(val).format(enableCustomFormat ? customFormat : format);
    }
  }
</script>

<style scoped lang="less">
  .cell-basic-datetimepicker {
    width: var(--cmp-width) !important;
    min-width: 30px;
    height: fit-content;
    padding: 2px;
    border-radius: 2px;
    outline: none;
    border-color: var(--required-border-color, #e9e9e9);
    background-color: var(--required-background-color, transparent);
    &:hover {
      border-color: var(--required-border-hover-color, var(--ant-primary-color));
    }

    :deep(&.ant-picker-disabled) {
      background: #f5f5f5;
    }
    :deep(&.ant-picker-focused) {
      box-shadow: none;
    }
    :deep(.ant-picker-input > input) {
      font-size: var(--size, 12px);
      height: 22px;
      background-color: transparent;
    }

    &.datepicker-out-of-range {
      :deep(.ant-picker-input > input) {
        color: var(--ant-error-color);
      }
    }
  }
</style>
