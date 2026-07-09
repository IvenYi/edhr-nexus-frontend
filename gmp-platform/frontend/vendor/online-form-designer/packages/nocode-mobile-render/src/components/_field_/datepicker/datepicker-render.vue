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
      :class="{ 'is-out-of-range': outOfRange }"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="placeholder || '请选择日期'"
      :callback="readonlyCallback"
    >
      <template #suffixIcon>
        <i class="iconfont icon-riqi2 text-14px" />
      </template>
    </base-cell-comp-field>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-datepicker-render">
  import { reactive } from 'vue';
  import dayjs from 'dayjs';
  import { useNocodeFormWidget, useWidgetStaticAttrs, type IDatepicker } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';
  import { useRangeValidate } from './hooks/useRangeValidate';

  const props = defineProps<{
    modelValue?: string;
    widget: IDatepicker;
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

  const { format, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const { showDisabled, placeholder } = useWidgetStaticAttrs(props.widget);

  const { outOfRange } = useRangeValidate(props, value);

  function readonlyCallback(val) {
    if (val) {
      return dayjs(val).format(enableCustomFormat ? customFormat : format);
    }
  }
</script>
