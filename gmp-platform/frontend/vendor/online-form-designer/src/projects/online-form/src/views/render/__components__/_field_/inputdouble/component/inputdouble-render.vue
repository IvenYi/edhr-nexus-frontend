<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :renderScript="renderScript"
    :annotationInfo="annotationInfo"
  >
    <DoubleInput
      :class="[
        'cell-basic-input-double',
        !renderScript && 'basic-input-double',
        (showRequired || showBorder) && 'is-show-required',
        realFieldId,
      ]"
      v-model:double-value="value"
      :isSeparator="false"
      :disabled="showDisabled"
      v-bind="inputDoubleAttr"
      @change="onChange"
      @blur="onBlur"
      @focus="$attrs.onFocus"
      :onEnter="onPressEnter"
      :renderScript="renderScript"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-inputdouble-render">
  import { computed, reactive, h, ref, onBeforeMount, onBeforeUnmount } from 'vue';
  import { isNil } from 'lodash-es';
  import BigNumber from 'bignumber.js';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { DoubleInput } from '/@/components/DoubleInput';
  import {
    DecimalDisplayMode,
    RangeValidateMode,
    useWidgetStaticAttrs,
    useCurrentPageFormState,
    useCalculateFormula,
    useNocodeFormWidget,
    useFormulaExpWatcher,
  } from '@gct/nocode-base';

  import type { IInputDouble } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: IInputDouble;
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

  const { value, onChange, onBlur, onPressEnter, realFieldId, annotationInfo } =
    useNocodeFormWidget(props, emit);

  const {
    minValue,
    minFormulaExpr,
    maxValue,
    maxFormulaExpr,
    upSup,
    downSub,
    enableRangeValidate,
    maxValidateMode,
    minValidateMode,
    displayMode,
  } = reactive(props.widget.props);

  const { showRequired, showDisabled, placeholder } = useWidgetStaticAttrs(props.widget);

  const minFormulaValue = ref();
  const maxFormulaValue = ref();
  let onStop;

  const showBorder = computed(() => {
    if (enableRangeValidate) {
      return (
        (maxValidateMode === RangeValidateMode.Fixed_Number && !isNil(maxValue)) ||
        (minValidateMode === RangeValidateMode.Fixed_Number && !isNil(minValue)) ||
        (maxValidateMode === RangeValidateMode.Variable_Validate &&
          !isNaN(maxFormulaValue.value)) ||
        (minValidateMode === RangeValidateMode.Variable_Validate && !isNaN(minFormulaValue.value))
      );
    }
    return false;
  });

  const inputDoubleAttr = computed(() => {
    const currencyAttr = {};
    let attr = {
      placeholder,
      controls: false,
      ...currencyAttr,
    };

    if (enableRangeValidate) {
      if (maxValidateMode === RangeValidateMode.Fixed_Number) {
        Object.assign(attr, {
          max: maxValue,
        });
      }

      if (maxValidateMode === RangeValidateMode.Variable_Validate) {
        Object.assign(attr, {
          max: maxFormulaValue.value,
        });
      }

      if (minValidateMode === RangeValidateMode.Fixed_Number) {
        Object.assign(attr, {
          min: minValue,
        });
      }

      if (minValidateMode === RangeValidateMode.Variable_Validate) {
        Object.assign(attr, {
          min: minFormulaValue.value,
        });
      }
    }

    return attr;
  });

  const renderScript = computed(() => {
    if (upSup) {
      return h('sup', { class: 'up-sup' }, upSup);
    }
    if (downSub) {
      return h('sub', { class: 'down-sub' }, downSub);
    }
    return undefined;
  });

  const onCalculateFormula = (type) => {
    if (type === 'min') {
      return calculateFormula(minFormulaExpr!, props.formData, currentPageFormState.value);
    } else if (type === 'max') {
      return calculateFormula(maxFormulaExpr!, props.formData, currentPageFormState.value);
    }
  };

  onBeforeMount(() => {
    if (!enableRangeValidate) return;

    const needMinValidateCalc =
      !!minFormulaExpr && minValidateMode === RangeValidateMode.Variable_Validate;
    const needMaxValidateCalc =
      !!maxFormulaExpr && maxValidateMode === RangeValidateMode.Variable_Validate;

    const parseInfos = getMergeParseInfos({
      minFormulaExpr: needMinValidateCalc ? minFormulaExpr : '',
      maxFormulaExpr: needMaxValidateCalc ? maxFormulaExpr : '',
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
      returnType: 'number',
    });

    setupWatchesFromMerged(parseInfos);
    onStop = stop;
  });

  onBeforeUnmount(() => {
    onStop?.();
  });

  function readonlyCallback(val) {
    if (!isNil(val) && val !== '' && displayMode && displayMode === DecimalDisplayMode.PERCENT) {
      return new BigNumber(val).multipliedBy(100) + '%';
    }
    return val;
  }
</script>

<style scoped lang="less">
  :deep(.ant-input-number.cell-basic-input-double.basic-input-double) {
    width: var(--cmp-width, 100%) !important;
    min-width: 30px;
    height: 28px;
    font-size: var(--size, 12px);
    vertical-align: middle;
    background-color: transparent;
    outline: 0;
    border: none;
    border-radius: 2px;
    .ant-input-number-input {
      padding: 4px;
      height: 28px;
      border: 1px solid #e9e9e9;
      border-color: var(--required-border-color, #e9e9e9);
      background-color: var(--required-background-color, transparent);
      &:hover {
        border-color: var(--required-border-hover-color, var(--ant-primary-color));
      }
    }
  }

  :deep(.ant-input-number-group-wrapper.cell-basic-input-double) {
    width: var(--cmp-width, 100%) !important;
    min-width: 30px;
    height: 28px;
    font-size: var(--size, 12px);
    vertical-align: middle;
    background-color: transparent;
    outline: 0;
    .ant-input-number {
      border: none;
      border-radius: 2px;

      .ant-input-number-input {
        padding: 4px;
        height: 28px;
        border: 1px solid #e9e9e9;
        border-color: var(--required-border-color, #e9e9e9);
        background-color: var(--required-background-color, transparent);
        &:hover {
          border-color: var(--required-border-hover-color, var(--ant-primary-color));
        }
      }
    }

    .ant-input-number-group-addon {
      background: #fff;
      padding: 0;
      font-size: 16px;
      /** 先注释掉间距 */
      // padding-left: 2px;
      border: none;
      sub.down-sub {
        bottom: -0.65em;
      }
      sup.up-sup {
        top: -0.7em;
      }
    }
  }

  :deep(.ant-input-number-disabled) {
    background-color: #f5f5f5 !important;
    color: rgba(0, 0, 0, 0.25) !important;
    .ant-input-number-input {
      &:hover {
        border-color: #e9e9e9 !important;
      }
    }
  }
</style>
