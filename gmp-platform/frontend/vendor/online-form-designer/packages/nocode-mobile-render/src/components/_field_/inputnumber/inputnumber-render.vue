<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :renderScript="renderScript"
    :annotationInfo="annotationInfo"
  >
    <template v-if="bindCompStyleType === BindCmpStyleEnum.CMP_SELECT_LIST">
      <base-cell-comp-field
        v-model:value="value"
        show-suffix-icon
        :show-disabled="showDisabled"
        :real-field-id="realFieldId"
        :placeholder="placeholder"
        :callback="readonlyCallback"
      >
        <template #suffixIcon>
          <i class="iconfont icon-pad_arrow_down text-14px"></i>
        </template>
      </base-cell-comp-field>
    </template>
    <template v-else>
      <number-cell-comp-field
        v-model:value="value"
        :base-extra-props="{
          class: { 'is-out-of-range': outOfRange },
        }"
        :show-disabled="showDisabled"
        :real-field-id="realFieldId"
        :placeholder="placeholder"
        :callback="readonlyCallback"
        :render-script="renderScript"
        :enable-step-counter="enableStepCounter"
      />
    </template>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-inputnumber-render">
  import { reactive, computed, h } from 'vue';
  import { isNil } from 'lodash-es';
  import BigNumber from 'bignumber.js';
  import {
    DecimalDisplayMode,
    BindCmpStyleEnum,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    type IInputNumber,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import NumberCellCompField from '../../_common_/base-cell-comp-field/number-cell-comp-field.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';
  import { useRangeValidate } from './hooks/useRangeValidate';

  const props = defineProps<{
    modelValue?: string;
    widget: IInputNumber;
    formData: any;

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

  const { value, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { upSup, downSub, displayMode, enableStepCounter } = reactive(props.widget.props);

  const { showDisabled, placeholder, bindCompStyleType, realPrecision, rulesForRounding } =
    useWidgetStaticAttrs(props.widget);

  const { outOfRange } = useRangeValidate(props, value);

  const renderScript = computed(() => {
    if (upSup) {
      return h('sup', { class: 'up-sup' }, upSup);
    }
    if (downSub) {
      return h('sub', { class: 'down-sub' }, downSub);
    }
    return undefined;
  });

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
