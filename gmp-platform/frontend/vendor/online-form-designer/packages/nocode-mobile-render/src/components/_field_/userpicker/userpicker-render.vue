<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <base-cell-comp-field
      v-model:value="value"
      show-suffix-icon
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="placeholder"
      :multiple="multiple"
      :callback="readonlyCallback"
    >
      <template #suffixIcon>
        <i class="iconfont icon-pad_arrow_down text-14px" />
      </template>
    </base-cell-comp-field>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-userpicker-render">
  import { computed, watch } from 'vue';
  import { isNil } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import {
    renderUtils,
    useWidgetStaticAttrs,
    PlatformEnum,
    useNocodeFormWidget,
    type IUserpicker,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';

  const props = defineProps<{
    modelValue?: string;
    widget: IUserpicker;
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

  const { realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { placeholder, fieldType, field, showDisabled, options, dataRelationShip } =
    useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.USER_MULTI;

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, multiple));
    },
  });

  watch(
    () => props.modelValue,
    () => {
      if (!isNil(props.modelValue)) {
        const newLb = JSON.stringify(
          renderUtils.getSelectOptions({
            value: props.modelValue,
            multiple,
            options,
            key: 'label',
          }).labels,
        );
        const oldLb = props.formData[`${field}_lb_`];
        if (oldLb !== newLb) {
          props.formData[`${field}_lb_`] = newLb;
        }
      }
    },
    {
      immediate: true,
    },
  );

  function readonlyCallback(val) {
    if (val) {
      if (dataRelationShip?.platformType === PlatformEnum.INTEGRATION_PAAS_DP) {
        return val;
      }

      return renderUtils.getLabJsonValue(props.formData, field);
    }
  }
</script>
