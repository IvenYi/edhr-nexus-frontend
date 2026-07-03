<template>
  <FieldDatePicker
    :class="['field-datepicker', { 'is-out-of-range': outOfRange }]"
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :format="enableCustomFormat ? customFormat : format"
    :dateType="dateType"
    :onChange="onChange"
    is-select
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </FieldDatePicker>
</template>

<script setup lang="ts" name="online-form-datepicker-field-render">
  import { reactive } from 'vue';
  import { useNocodeFormWidget, type IDatepicker } from '@gct/nocode-base';
  import { useRangeValidate } from './hooks/useRangeValidate';
  import { FieldDatePicker, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

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

  const { showRequired, showDisabled, showReadonly, showFieldName, placeholder, fieldType } =
    useMobileAttrs(props.widget);

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const { dateType, format, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const { outOfRange } = useRangeValidate(props, value);
</script>
