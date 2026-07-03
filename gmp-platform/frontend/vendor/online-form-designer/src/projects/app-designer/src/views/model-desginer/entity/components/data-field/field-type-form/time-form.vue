<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'value']">
    <a-select
      v-model:value="formData.defaultValue.value"
      :placeholder="t('sys.chooseText')"
      @change="onSelectChange"
      allowClear
    >
      <a-select-option :value="FieldSysVarDefaultValueEnum.NULL">{{
        t('sys.none')
      }}</a-select-option>
      <a-select-option :value="FieldSysVarDefaultValueEnum.SYS_TIME">{{
        t('sys.sysTime')
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="time">
  import { PropType, computed, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import {
    FieldDefaultValueTypeEnum,
    FieldSysVarDefaultValueEnum,
  } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  const initData = () => {
    return {
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
      },
    };
  };

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const onSelectChange = (val) => {
    if (val === FieldSysVarDefaultValueEnum.SYS_TIME) {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.SYS_VAR;
    } else {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
    }
  };

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
