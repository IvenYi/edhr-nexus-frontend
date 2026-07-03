<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.pageDesigner.pageDiff')"
    centered
    width="80vw"
    :maskClosable="false"
    :afterClose="handleClose"
    :showCancelBtn="false"
    :showOkBtn="false"
  >
    <div>
      <div class="diff-modal__versions">
        <div>当前版本</div>
        <div><span class="mr-5px">对比版本</span> </div>
      </div>
      <div class="diff-modal__container"></div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, toRaw, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useEditorConsoleInner } from '/@/components/code-editor/useEditorConsole';
  import { usePage } from '../../hooks/usePage';

  const { t } = useI18n();

  let monaco: any = null;
  let diffEditor: any = null;
  let originalModel: any = null;
  let modifiedModel: any = null;

  const { project, loadLabelDesignHistoryInfo } = usePage();
  const { formatJson2Notes } = useEditorConsoleInner();

  const targetHistoryId = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      if (!diffEditor) initDiffEditor();
      targetHistoryId.value = data.hid;
    }
  });

  async function initDiffEditor() {
    monaco = await window.monacoLoader.loadMonaco();
    diffEditor = monaco.editor.createDiffEditor(
      document.querySelector('.diff-modal__container') as HTMLElement,
      {
        // You can optionally disable the resizing
        enableSplitViewResizing: false,
        automaticLayout: true, // 自动布局,
      },
    );

    setModelContent('');
  }

  async function setModelContent(modifyContent) {
    if (!monaco) {
      console.warn('[DiffModal] Monaco editor is not available for setModelContent');
      return;
    }
    console.log(toRaw(project.value));
    originalModel = monaco.editor.createModel(
      formatJson2Notes(toRaw(project.value)),
      'json/string',
    );
    modifiedModel = monaco.editor.createModel(formatJson2Notes(modifyContent), 'json/string');
    diffEditor &&
      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
  }

  watch(
    targetHistoryId,
    async (value) => {
      if (value) {
        const res = await loadLabelDesignHistoryInfo(value);
        setModelContent(res?.designerJson);
      }
    },
    {
      immediate: true,
    },
  );

  const handleClose = () => {
    targetHistoryId.value = null;
    closeModal();
  };
</script>

<style scoped lang="less">
  .diff-modal {
    &__versions {
      & > div {
        display: inline-block;
        width: 50%;
        box-sizing: border-box;
        margin-bottom: 16px;
        font-weight: bold;
      }
    }
    &__container {
      height: 70vh;
    }
  }
</style>
