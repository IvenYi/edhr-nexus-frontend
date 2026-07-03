<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.editor.compare')"
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
        <div
          ><span class="mr-5px">对比版本</span>
          <a-select
            v-if="compareMode === DiffEnum.VERSION"
            class="w-80px"
            size="small"
            v-model:value="targetVerisonId"
          >
            <a-select-option v-for="item in scriptVersionList" :key="item.id">{{
              item.version
            }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="diff-modal__container"></div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useScript } from '/@app-designer/views/script-editor/hooks/useScript';
  import { useEmitter } from '/@app-designer/views/script-editor/hooks/useEmitter';
  import { DiffEnum } from '/@app-designer/views/script-editor/types/enum';

  const { t } = useI18n();
  const { DEFAULT_CONTENT, scriptVersionList, loadScriptVersionInfo, loadScriptHistoryInfo } =
    useScript();
  const { getCode } = useEmitter();

  let monaco: any = null;
  let diffEditor: any = null;
  let originalModel: any = null;
  let modifiedModel: any = null;
  const compareMode = ref<DiffEnum>(DiffEnum.VERSION);
  const targetVerisonId = ref();
  const targetHistoryId = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data?.mode) {
      compareMode.value = data?.mode;
      if (!diffEditor) initDiffEditor();
      if (compareMode.value === DiffEnum.VERSION) {
        targetVerisonId.value = scriptVersionList.value[0].id;
      } else if (compareMode.value === DiffEnum.HISTORY) {
        targetHistoryId.value = data?.historyId;
      }
    }
  });

  const setModelContent = async (modifyContent) => {
    if (!monaco) {
      console.warn('[DiffModal] Monaco editor is not available for setModelContent');
      return;
    }
    const sourceContent = await getCode({
      showError: false,
      ignoreError: true,
    });
    originalModel = monaco.editor.createModel(sourceContent);
    modifiedModel = monaco.editor.createModel(modifyContent);
    diffEditor &&
      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
  };

  watch(
    targetVerisonId,
    async (value) => {
      if (value) {
        const res = await loadScriptVersionInfo(value);
        setModelContent(res?.content || DEFAULT_CONTENT);
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    targetHistoryId,
    async (value) => {
      if (value) {
        const res = await loadScriptHistoryInfo(value);
        setModelContent(res?.content || DEFAULT_CONTENT);
      }
    },
    {
      immediate: true,
    },
  );

  const handleClose = () => {
    targetVerisonId.value = null;
    targetHistoryId.value = null;
    closeModal();
  };

  const initDiffEditor = async () => {
    monaco = await window.monacoLoader.loadMonaco();
    diffEditor = monaco.editor.createDiffEditor(document.querySelector('.diff-modal__container'), {
      // You can optionally disable the resizing
      enableSplitViewResizing: false,
    });

    setModelContent('');
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
