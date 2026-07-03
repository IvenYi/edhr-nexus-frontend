<template>
  <a-form-item :label="`${t('sys.boolOpt')}`" required>
    <i18n-select-input-form
      :formRef="formRef"
      :formItemName="['specificConfig', 'true']"
      :fromItemExtraProps="{
        label: t('sys.real'),
        colon: false,
        rules: [{ required: true, message: t('sys.model.boolNameRequired') }],
      }"
      :inputExtraProps="{ showCount: true, maxlength: 32 }"
      v-model:text="formData.specificConfig.true"
      v-model:i18nConfig="formData.i18nConfig"
    />
    <i18n-select-input-form
      :formRef="formRef"
      :formItemName="['specificConfig', 'false']"
      :fromItemExtraProps="{
        label: t('sys.fake'),
        colon: false,
        rules: [{ required: true, message: t('sys.model.boolNameRequired') }],
      }"
      :inputExtraProps="{ showCount: true, maxlength: 32 }"
      v-model:text="formData.specificConfig.false"
      v-model:i18nConfig="formData.i18nConfig"
    />
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item
    v-if="props.formState.key !== 'operating_state_'"
    :label="`${t('sys.defaultValue')}`"
    :name="['defaultValue', 'value']"
  >
    <a-select v-model:value="formData.defaultValue.value" :placeholder="t('sys.chooseText')">
      <a-select-option :value="true">{{
        formData.specificConfig.true || t('sys.real')
      }}</a-select-option>
      <a-select-option :value="false">{{
        formData.specificConfig.false || t('sys.fake')
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="boolean">
  import { PropType, reactive, watch } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance } from 'ant-design-vue';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    boolSupportTree: { type: Boolean, default: false },
  });
  console.log('props.formState', props.formState);
  const formData = reactive<FieldFormState>(props.formState);

  const initData = () => {
    return {
      specificConfig: {
        true: t('sys.real'),
        false: t('sys.fake'),
      },
      defaultValue: {
        type: FieldDefaultValueTypeEnum.FIXED,
        value: true,
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

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped>
  ::v-deep {
    .ant-form-item-label > label.ant-form-item-required.ant-form-item-no-colon::before {
      display: none;
    }
  }
</style>
