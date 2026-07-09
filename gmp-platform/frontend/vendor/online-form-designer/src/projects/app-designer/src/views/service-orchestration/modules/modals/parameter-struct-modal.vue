<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('参数配置')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <json-editor :list="jsonEditorData" />
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import JsonEditor from './json-editor.vue';
  // import { useScript } from '/@app-designer/views/script-editor/hooks/useScript';

  const emit = defineEmits(['ok', 'register']);

  // const FormRef = ref<FormInstance>();

  // const reg = /^\d{1,2}\.\d{1,6}$/;

  let jsonEditorData = ref();

  const { t } = useI18n();
  // const { saveAs } = useScript();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (data === undefined) return;
    jsonEditorData.value = data;
  });

  // const formState = reactive({
  //   version: '',
  // });

  const handleClose = () => {
    // formState.version = '';
    closeModal();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      // await FormRef.value!.validate();
      // await saveAs(formState.version);
      changeOkLoading(false);
      closeModal();
    } catch (err) {
      changeOkLoading(false);
    }
  };
</script>

<style scoped lang="less"></style>
