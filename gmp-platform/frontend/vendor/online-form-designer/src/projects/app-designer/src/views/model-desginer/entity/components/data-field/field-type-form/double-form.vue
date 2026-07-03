<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    v-show="!isCustom"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <a-form-item
    :label="`${t('sys.model.valueLimit')}`"
    name="range"
    :rules="[
      {
        validator: (rule, value) => validateLengthRange(rule, value, formData),
        message: t('sys.model.numMaxGTMin'),
      },
    ]"
  >
    <number-range
      v-model:range-min="formData.specificConfig.minValue"
      v-model:range-max="formData.specificConfig.maxValue"
      :disabled="isEdit"
      :placeholderType="t('sys.model.num')"
      @change="handleRangeChange"
      :maxObj="{ start: 999999999999999, end: 999999999999999 }"
    />
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item
    v-show="!isCustom"
    :label="`${t('sys.defaultValue')}`"
    :name="['defaultValue', 'value']"
    :rules="[{ validator: (rule, value) => validateFieldDefaultForValue(rule, value, formData) }]"
  >
    <double-input
      :max="999999999999999"
      v-model:double-value="formData.defaultValue.value"
      :placeholder="t('sys.inputText')"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="double">
  import { PropType, reactive, watch, ref } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { NumberRange } from '/@/components/NumberRange';
  import { DoubleInput } from '/@/components/DoubleInput';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import {
    validateLengthRange,
    validateFieldDefaultForValue,
  } from '/@app-designer/views/model-desginer/utils/validate';
  import { FormInstance } from 'ant-design-vue';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    // 是否是自定义字段，设计器-表单中使用
    isCustom: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  watch(
    () => formData.defaultValue.value,
    (value) => {
      if (value === null || value === undefined) {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
      } else {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.FIXED;
      }
    },
  );

  const handleRangeChange = () => {
    props.formRef.validateFields(['range', ['defaultValue', 'value']]);
  };
</script>

<style lang="less" scoped></style>
