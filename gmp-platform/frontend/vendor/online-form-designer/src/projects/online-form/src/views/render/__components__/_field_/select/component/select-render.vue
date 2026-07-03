<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <ref-select
      ref="selectRef"
      :widget="widget"
      v-model:value="value"
      :formData="formData"
      :realFieldId="realFieldId"
      @change="onChange(getOptionLabel)"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-select-render">
  import { computed, ref } from 'vue';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import {
    PlatformEnum,
    renderUtils,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
  } from '@gct/nocode-base';
  import RefSelect from './ref-select.vue';
  import type { ISelect } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: ISelect;
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

  const { onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { field, fieldType, dataRelationShip } = useWidgetStaticAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.REF_MULTI || fieldType === FIELD_TYPE.DEVICE_REF_MULTI;

  const selectRef = ref();

  const value = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, multiple));
    },
  });

  const readonlyCallback = (val) => {
    if (dataRelationShip?.platformType === PlatformEnum.INTEGRATION_PAAS_DP) {
      return val;
    }
    return renderUtils.getLabJsonValue(props.formData, field);
  };

  function getOptionLabel(val) {
    if (val) {
      const options = selectRef.value?.getOptions();
      return renderUtils.getSelectOptions({
        value: val,
        multiple: multiple,
        options,
        key: 'label',
      }).labelJson;
    }
  }
</script>
