<template>
  <FieldSelect
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :options="options"
    :multiple="multiple"
    :filterFn="filterFn"
    :onChange="onChange"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </FieldSelect>
</template>

<script setup lang="ts" name="online-form-userpicker-field-render">
  import { FIELD_TYPE } from '@gct/runtime';
  import { useNocodeFormWidget, type IUserpicker } from '@gct/nocode-base';
  import { FieldSelect, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

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

  const { value, onChange } = useNocodeFormWidget(props, emit);

  const {
    placeholder,
    fieldType,
    showFieldName,
    showRequired,
    showDisabled,
    showReadonly,
    options,
  } = useMobileAttrs(props.widget);

  const multiple = fieldType === FIELD_TYPE.USER_MULTI;

  const filterFn = (query: string, option: any) => {
    const item = option._item || {};
    const searchStr = query.toLowerCase();
    return (
      (item.fullname && item.fullname.toLowerCase().includes(searchStr)) ||
      (item.username && item.username.toLowerCase().includes(searchStr)) ||
      (item.empNo && String(item.empNo).toLowerCase().includes(searchStr))
    );
  };
</script>
