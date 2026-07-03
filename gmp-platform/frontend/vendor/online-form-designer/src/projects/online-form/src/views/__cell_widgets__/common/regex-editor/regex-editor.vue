<template>
  <a-button
    block
    size="small"
    class="regex-editor"
    @click="openModal"
    :type="!!props.modelValue ? 'primary' : undefined"
    >{{ `${t('sys.pageDesigner.add')}${t('sys.pageDesigner.regex')}` }}</a-button
  >
</template>

<script setup lang="ts" name="regex-editor">
  import { useI18n } from '/@/hooks/web/useI18n';
  import RegexEditorModal from './regex-editor-modal.vue';
  import { EditorValueType } from './editor';

  const { t } = useI18n();
  const props = defineProps<{
    modelValue?: EditorValueType;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: EditorValueType): void;
  }>();

  const openModal = async () => {
    console.log('sdfsdd');
    const result = await gct.openUtil.modal(
      RegexEditorModal,
      {
        value: props.modelValue,
      },
      {
        title: $t('sys.pageDesigner.regConfig'),
        width: 640,
        minHeight: 250,
        showFooter: true,
        okText: t('sys.okText'),
        cancelText: t('sys.cancelText'),
      },
    );
    if (result.ok) {
      console.log($t('sys.model.modifySuccess'), result);
      const data = result.data?.[0] || {};
      emit('update:modelValue', { regex: data.regex, regexHint: data.regexHint });
    }
  };
</script>

<style lang="less" scoped>
  .regex-editor {
    height: 26px;
  }
</style>
