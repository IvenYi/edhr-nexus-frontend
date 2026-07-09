<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :renderScript="renderScript"
    :annotationInfo="annotationInfo"
  >
    <CellSelect
      v-if="bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST"
      :widget="widget"
      v-model:value="value"
      :showDisabled="showDisabled"
      :showRequired="showRequired || showBorder"
      :realFieldId="realFieldId"
      @change="onChange"
      @blur="onBlur"
      @focus="$attrs.onFocus"
      @pressEnter="onPressEnter"
    />

    <DoubleInput
      v-else
      ref="doubleInputRef"
      :class="[
        'cell-basic-input',
        !(renderScript || enableStepCounter) && 'basic-input-number',
        (showRequired || showBorder) && 'is-show-required',
        realFieldId,
      ]"
      v-model:double-value="value"
      :isSeparator="false"
      :digits="realPrecision"
      :rules="rulesForRounding"
      :disabled="showDisabled"
      v-bind="inputNumberAttr"
      @change="onChange"
      @blur="onBlur"
      @focus="$attrs.onFocus"
      :onEnter="onPressEnter"
      :renderScript="renderScript"
      :enableStepCounter="enableStepCounter"
    >
      <template #step-down>
        <span class="step-btn" @click.stop="onInternalStep(false)">
          <i class="align-middle iconfont icon-a--"></i>
        </span>
      </template>
      <template #step-up>
        <span class="step-btn" @click.stop="onInternalStep(true)">
          <i class="align-middle iconfont icon-a-"></i>
        </span>
      </template>
    </DoubleInput>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-inputnumber-render">
  import { computed, reactive, h, ref, onBeforeMount, onBeforeUnmount } from 'vue';
  import BigNumber from 'bignumber.js';
  import {
    RangeValidateMode,
    DecimalDisplayMode,
    BindCmpStyleEnum,
    useCalculateFormula,
    useCurrentPageFormState,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    useFormulaExpWatcher,
  } from '@gct/nocode-base';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { isNil } from 'lodash-es';
  import CellSelect from './cell-select.vue';
  import { DoubleInput } from '/@/components/DoubleInput';
  import type { InputNumberProps } from 'ant-design-vue';
  import type { IInputNumber } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string | number;
    widget: IInputNumber;
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
    enableStepCounter,
    stepCounter = 1,
  } = reactive(props.widget.props);

  const {
    showRequired,
    showDisabled,
    placeholder,
    bindCompStyleType,
    realPrecision,
    rulesForRounding,
  } = useWidgetStaticAttrs(props.widget);

  const doubleInputRef = ref();
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

  const inputNumberAttr = computed(() => {
    const currencyAttr = {};

    let attr: InputNumberProps = {
      precision: realPrecision,
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

  const onInternalStep = (up: boolean) => {
    console.log('inputValue.value', value.value);
    const newValue = Number(value.value || 0) + (up ? stepCounter : -stepCounter);

    doubleInputRef.value?.onChangeValue({ target: { value: newValue } });
  };

  function readonlyCallback(val) {
    if (!isNil(val) && val !== '') {
      if (displayMode && displayMode === DecimalDisplayMode.PERCENT) {
        return (
          new BigNumber(BigNumber(val).toFixed(realPrecision, rulesForRounding || 1)).multipliedBy(
            100,
          ) + '%'
        );
      }

      return new BigNumber(val).toFixed(realPrecision, rulesForRounding || 1);
    }
    return '';
  }
</script>

<style scoped lang="less">
  :deep(.ant-input-number.cell-basic-input.basic-input-number) {
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

    &.is-show-required.flashing-border {
      .ant-input-number-input {
        animation: flashBorder 2s infinite;
      }
    }
  }

  :deep(.ant-input-number-group-wrapper.cell-basic-input) {
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
      font-size: var(--size, 12px);

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

      .step-btn {
        display: inline-block;
        background: #e9e9e9;
        width: 24px;
        height: 28px;
        border-radius: 2px;
        cursor: pointer;
        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }

    &.is-show-required.flashing-border {
      .ant-input-number-input {
        animation: flashBorder 2s infinite;
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
