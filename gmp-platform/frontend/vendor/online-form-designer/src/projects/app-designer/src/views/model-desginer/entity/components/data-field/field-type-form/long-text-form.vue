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
    :label="`${t('sys.model.lengthLimit')}`"
    name="range"
    :rules="[
      {
        validator: (rule, value) => validateLengthRange(rule, value, formData),
        message: t('sys.model.maxGTMin'),
      },
    ]"
  >
    <number-range
      v-model:range-min="formData.specificConfig.minValue"
      v-model:range-max="formData.specificConfig.maxValue"
      :disabled="isEdit"
      :max-obj="maxObj"
      :placeholderType="t('sys.model.length')"
      @change="handleRangeChange"
    />
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item
    v-show="!isCustom"
    :label="`${t('sys.defaultValue')}`"
    :name="['defaultValue', 'value']"
    :rules="[
      { validator: (rule, value) => validateFieldDefaultForLength(rule, value, formData, maxObj) },
    ]"
  >
    <a-input v-model:value="formData.defaultValue.value" :placeholder="t('sys.inputText')" />
  </a-form-item>
</template>

<script setup lang="ts" name="long_text">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { NumberRange } from '/@/components/NumberRange';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import {
    validateLengthRange,
    validateFieldDefaultForLength,
  } from '/@app-designer/views/model-desginer/utils/validate';
  import { FormInstance } from 'ant-design-vue';
  import { isEmpty } from 'lodash-es';

  const { t } = useI18n();
  const maxObj = { start: 100 };

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
      if (isEmpty(value)) {
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
