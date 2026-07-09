<template>
  <NocodeField
    :class="['field-double-input', { 'is-out-of-range': outOfRange }]"
    v-model="value"
    :label="showFieldName"
    :required="showRequired"
    :disabled="showDisabled || showReadonly"
    :placeholder="placeholder"
    @click="showPopup"
    @clearValue="onClear"
    clearable
    readonly
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </NocodeField>
</template>

<script setup lang="ts" name="online-form-inputdouble-field-render">
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import { useNocodeFormWidget, type IInputDouble } from '@gct/nocode-base';
  import { NocodeField, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';
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

  const { value, onChange, onBlur, onPressEnter } = useNocodeFormWidget(props, emit);

  const { showRequired, showDisabled, showReadonly, showFieldName, placeholder, fieldType } =
    useMobileAttrs(props.widget);

  const { openNumKeyPopup } = createNumKeyboardPopup({});

  const { outOfRange } = useRangeValidate(props, value);

  const onClear = () => {
    emit('update:modelValue', null);
    onChange();
  };

  function showPopup(e) {
    if (showReadonly.value || showDisabled.value) return;
    const res: any = {};

    openNumKeyPopup({
      val: value.value,
      extra: '.',
      minmax: res,
      callback(a: any) {
        value.value = a;
        onChange();
      },
      onBlur() {
        onBlur();
      },
      onEnter: onPressEnter,
    });
  }
</script>
