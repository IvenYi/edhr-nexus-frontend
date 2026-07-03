<template>
  <div :id="containerId" :class="[ns.b()]"> </div>
</template>

<script lang="ts" setup name="diff-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uuid2 } from '/@/utils/uuid';
  import { onBeforeUnmount, onMounted, watch } from 'vue';

  const containerId = 'diff_editor_container_' + uuid2(32);
  const { t } = useI18n();
  const ns = useNamespace('diff-editor');

  const props = withDefaults(
    defineProps<{
      /** 左侧原始值 */
      origin: string;
      /** 右侧对比值（可更新） */
      value?: string;
      /** 文本的语言 */
      textLanguage: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: any): void;
  }>();

  let monaco: any = null;
  let diffEditor: any = null;
  let originalModel: any = null;
  let modifiedModel: any = null;

  async function initDiffEditor() {
    monaco = await window.monacoLoader.loadMonaco();
    originalModel = monaco.editor.createModel('', props.textLanguage);
    modifiedModel = monaco.editor.createModel('', props.textLanguage);

    diffEditor = monaco.editor.createDiffEditor(
      document.querySelector(`#${containerId}`) as HTMLElement,
      {
        automaticLayout: true, // 自动调整布局
        enableSplitViewResizing: false, // 禁止调整左右面板宽度
        theme: 'vs-dark', // 主题样式
        readOnly: false, // 只读模式
        renderSideBySide: true, // 并排显示差异
      },
    );
    modifiedModel.onDidChangeContent(() => {
      // 只变更事件
      emit('update:value', modifiedModel!.getValue());
    });
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    watch(
      () => props.origin,
      async (origin) => {
        if (originalModel) {
          originalModel.setValue(origin || '');
        }
      },
      { immediate: true },
    );

    watch(
      () => props.value,
      async (value) => {
        if (modifiedModel) {
          const currentStr = modifiedModel.getValue();
          if (value !== currentStr) {
            // 防止值相同的时候触发修改,丢失撤回功能
            modifiedModel.setValue(value || '');
          }
        }
      },
      { immediate: true },
    );
  }

  onMounted(() => {
    initDiffEditor();
  });

  // 清理资源
  onBeforeUnmount(() => {
    if (diffEditor) {
      diffEditor.dispose();
    }
    // 销毁模型
    if (originalModel) {
      originalModel.dispose();
    }
    if (modifiedModel) {
      modifiedModel.dispose();
    }
  });
</script>

<style lang="scss" scoped>
  $diff-editor: ();

  @include b(diff-editor) {
    @include set-component-css-var(diff-editor, $diff-editor);
    height: 70vh;
  }
</style>
