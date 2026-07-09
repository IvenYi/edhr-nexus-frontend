<template>
  <FieldTimePicker
    :class="['field-timepicker']"
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :format="enableCustomFormat ? customFormat : format"
    :timeType="timeType"
    :onChange="onChange"
    is-select
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </FieldTimePicker>
</template>

<script setup lang="ts" name="online-form-timepicker-render-render">
  import { reactive } from 'vue';
  import { useNocodeFormWidget, type ITimepicker } from '@gct/nocode-base';
  import { FieldTimePicker, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: ITimepicker;
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

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const { showRequired, showDisabled, showReadonly, showFieldName, placeholder, fieldType } =
    useMobileAttrs(props.widget);

  const { timeType, format, enableCustomFormat, customFormat } = reactive(props.widget.props);
</script>
