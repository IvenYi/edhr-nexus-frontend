<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :renderScript="renderScript"
    :annotationInfo="annotationInfo"
  >
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
    >
    </number-cell-comp-field>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-inputdouble-render">
  import { computed, h, reactive } from 'vue';
  import { isNil } from 'lodash-es';
  import BigNumber from 'bignumber.js';
  import {
    useNocodeFormWidget,
    DecimalDisplayMode,
    useWidgetStaticAttrs,
    type IInputDouble,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import NumberCellCompField from '../../_common_/base-cell-comp-field/number-cell-comp-field.vue';
  import { useRangeValidate } from '../inputnumber/hooks/useRangeValidate';

  const props = defineProps<{
    modelValue?: string;
    widget: IInputDouble;
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

  const { showDisabled, placeholder } = useWidgetStaticAttrs(props.widget);

  const { outOfRange } = useRangeValidate(props, value);

  const { upSup, downSub, displayMode } = reactive(props.widget.props);

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
    if (!isNil(val) && val !== '' && displayMode && displayMode === DecimalDisplayMode.PERCENT) {
      return new BigNumber(val).multipliedBy(100) + '%';
    }
    return val;
  }
</script>
