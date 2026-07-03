<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(readonly ? '冲突详情' : '冲突解决')"
    centered
    width="80vw"
    :maskClosable="false"
    :afterClose="handleClose"
    :showCancelBtn="false"
    :showOkBtn="false"
  >
    <div ref="VersionMergeDiffRef">
      <div v-if="!readonly" class="diff-btns">
        <a-button type="primary" @click="() => handleChoose(MergeDiffReusltEnum.SOURCE)">{{
          isImport ? '使用源分支' : '使用源版本'
        }}</a-button>
        <a-button type="primary" @click="() => handleChoose(MergeDiffReusltEnum.TARGET)">{{
          isImport ? '使用目标分支' : '使用目标版本'
        }}</a-button>
      </div>
      <div class="diff-editor"></div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, watch, inject, ComputedRef } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { MergeConflictDTO } from '/@/apis/gct-platform/model';
  import jsonFormat from 'json-format';
  import { MergeDiffReusltEnum } from '../../constant/interface';

  defineProps<{
    readonly?: boolean;
  }>();

  const emit = defineEmits(['choose']);

  const isImport: ComputedRef<boolean> | undefined = inject('isImport');

  const { t } = useI18n();

  let monaco: any = null;
  let diffData: MergeConflictDTO | null = null;
  const VersionMergeDiffRef = ref();
  let diffEditor: any = null;
  let originalModel: any = null;
  let modifiedModel: any = null;

  const [registerInner, { closeModal }] = useModalInner((data: MergeConflictDTO) => {
    if (!data) return;
    diffData = data;
    setModelContent(data.sourceContent, data.targetContent);
  });

  watch(VersionMergeDiffRef, async (value: HTMLElement) => {
    if (!value) return;

    // 加载 Monaco Editor
    monaco = await window.monacoLoader.loadMonaco();

    diffEditor = monaco.editor.createDiffEditor(value.querySelector('.diff-editor'), {
      // You can optionally disable the resizing
      enableSplitViewResizing: false,
      wordWrap: 'on',
      wrappingIndent: 'deepIndent',
      automaticLayout: true,
    });
  });

  const setModelContent = async (source, target) => {
    if (!monaco) {
      monaco = await window.monacoLoader.loadMonaco();
    }

    originalModel = monaco.editor.createModel(
      jsonFormat(JSON.parse(source), {
        type: 'space',
        size: 2,
      }),
    );
    modifiedModel = monaco.editor.createModel(
      jsonFormat(JSON.parse(target), {
        type: 'space',
        size: 2,
      }),
    );
    diffEditor &&
      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
  };

  const handleClose = () => {
    originalModel && originalModel.dispose();
    modifiedModel && modifiedModel.dispose();
    originalModel = null;
    modifiedModel = null;
    diffData = null;
  };

  const handleChoose = (result: MergeDiffReusltEnum) => {
    emit('choose', result, diffData);
    closeModal();
  };
</script>

<style scoped lang="less">
  .diff-editor {
    height: 70vh;
  }

  .diff-btns {
    position: relative;
    margin-bottom: 10px;
    .ant-btn {
      &:nth-child(1) {
        transform: translateX(46px);
      }
      &:nth-child(2) {
        position: absolute;
        left: 50%;
        transform: translateX(30px);
      }
    }
  }
</style>
