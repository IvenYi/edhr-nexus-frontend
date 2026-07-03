<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.pageDesigner.globalEvent')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-alert :message="t('sys.pageDesigner.tipGlobal')" type="warning" show-icon />
    <a-form
      ref="eventFormRef"
      :model="formState"
      :label-col="{ span: 0 }"
      :wrapper-col="{ span: 24 }"
      autocomplete="off"
    >
      <a-form-item label="" name="code">
        <code-editor
          v-model:value="formState.code"
          language="javascript"
          ref="editorRef"
          :theme="Theme.VS"
          style="height: 100%"
        >
          <template #title>
            <span class="title-header">{{ t(`sys.pageDesigner.${eventType}`) }}</span>
          </template>
        </code-editor>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { type FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import { Theme } from '/@/components/code-editor/useMonacoEditor';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['ok', 'register']);
  const eventFormRef = ref<FormInstance>();
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const editorRef = ref();
  const formState = ref({
    code: '',
  });
  const eventType = ref('');
  //打开弹框传参
  const [registerInner] = useModalInner(async (data) => {
    data && onDataReceive(data);
    await nextTick();
    editorRef.value?.reload(data.code);
  });
  const onDataReceive = (data) => {
    eventType.value = data.eventType;
    formState.value = { code: data.code };
  };
  const handleClose = () => {};
  const handleOk = () => {
    editorRef.value.handleFormatCodeClick();
    const error = editorRef.value.getEditorMarkers().filter((i) => i.severity >= 8);
    if (error.length) {
      createMessage.warning(t('sys.pageDesigner.codeError'));
      return;
    } else {
      emit('ok', { eventType: eventType.value, code: formState.value.code });
    }
  };
</script>

<style lang="less" scoped></style>
