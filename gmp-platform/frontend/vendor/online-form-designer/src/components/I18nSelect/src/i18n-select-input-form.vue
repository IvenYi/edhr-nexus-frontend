<template>
  <a-form-item :name="formItemName" v-bind="fromItemExtraProps">
    <i18n-select-input
      v-bind="$attrs"
      v-model:i18nText="i18nText"
      :inputExtraProps="inputExtraProps"
      :i18nConfig="i18nConfig"
      :attr="Array.isArray(formItemName) ? formItemName.join('.') : formItemName"
      :placeholderText="$t('sys.inputText')"
    />
  </a-form-item>
  <a-form-item name="i18nConfig" hidden>
    <span>{{ i18nConfig }}</span>
  </a-form-item>
</template>
<script setup lang="ts" name="i18n-select-input-form">
  import { computed } from 'vue';
  import type { FormInstance, FormItemProps, InputProps } from 'ant-design-vue';
  import I18nSelectInput from './i18n-select-input.vue';

  interface Props {
    formItemName: string | string[];
    fromItemExtraProps?: FormItemProps;
    inputExtraProps?: InputProps;
    i18nConfig?: string;
    text?: string;
    formRef?: FormInstance;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['update:text']);

  const i18nText = computed<string>({
    get() {
      return props.text ?? '';
    },
    set(value: string) {
      emit('update:text', value);
      props.formRef?.validateFields([props.formItemName]);
    },
  });
</script>
