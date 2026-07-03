<template>
  <component
    :is="cmp[bindCompStyleType]"
    v-model="value"
    :label="showFieldName"
    :disabled="showDisabled || showReadonly"
    :required="showRequired"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :show-word-limit="maxlength ? true : false"
    :rules="rules"
    @input="onChange"
    @blur="onBlur"
    @clearValue="onClear"
  >
    <template #label-left>
      <FieldTypeIcon :type="fieldType" />
    </template>
  </component>
</template>

<script setup lang="ts" name="online-form-input-field-render">
  import { computed, reactive } from 'vue';
  import { BindCmpStyleEnum, useNocodeFormWidget, type IInput } from '@gct/nocode-base';
  import { FieldInput, FieldTextarea, FieldTypeIcon } from '../../_common_';
  import { useMobileAttrs } from '../../../hooks';

  const cmp = {
    [BindCmpStyleEnum.CMP_TEXT]: FieldInput,
    [BindCmpStyleEnum.CMP_TEXTAREA]: FieldTextarea,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: IInput;
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

  const { value, onChange, onBlur, onPressEnter } = useNocodeFormWidget(props, emit);

  const {
    showRequired,
    showDisabled,
    bindCompStyleType,
    placeholder,
    showFieldName,
    fieldType,
    showReadonly,
  } = useMobileAttrs(props.widget);

  const { maxlength, regex, regexHint } = reactive(props.widget.props);

  const rules = computed(() => {
    if (regex) {
      return [
        {
          pattern: new RegExp(regex),
          message: regexHint,
          trigger: ['onChange', 'onBlur'],
          validateEmpty: false,
        },
      ];
    }
    return undefined;
  });

  const onClear = () => {
    emit('update:modelValue', undefined);
    onChange();
  };
</script>
