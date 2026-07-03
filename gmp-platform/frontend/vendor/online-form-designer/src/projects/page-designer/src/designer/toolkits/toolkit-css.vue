<template>
  <div class="js-toolkit-box">
    <code-editor
      v-model:value="cssCode"
      language="css"
      ref="editorRef"
      style="height: 100%"
      @blur="getEditorValue"
      @editorMounted="onEditorMounted"
    />
  </div>
</template>

<script setup lang="ts" name="toolkit-css">
  import { computed, ref, watch } from 'vue';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import { useScope } from '/@page-designer/hooks/useScope';
  import { insertCustomCssToHead } from '/@/utils/lowcode/utils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { scopeCss, scopeId } = useScope();
  const { modalDesignState, modalInfo } = useDesigner();
  const { createMessage } = useMessage();
  const { t } = useI18n();

  const editorRef = ref();

  function setEditorTheme() {
    editorRef.value.setEditorTheme();
  }

  const getEditorValue = () => {
    if (editorRef.value.getEditorMarkers().length) {
      createMessage.warning(t('sys.pageDesigner.codeError'));
      return;
    } else {
      saveCss();
    }
  };
  const saveCss = () => {
    //如果是模态框设计状态下 则要传入当前模态框ID
    insertCustomCssToHead(cssCode.value, modalDesignState.value ? modalInfo.value.id : '');
  };
  const cssCode = computed({
    set(val: string) {
      scopeCss.value = val;
    },
    get() {
      return scopeCss.value;
    },
  });

  watch(scopeId, () => {
    if (editorRef.value?.isMonacoReady === true) {
      editorRef.value.reload(cssCode.value);
    }
  });

  function onEditorMounted(): void {
    setEditorTheme();
    if (scopeId.value) {
      editorRef.value.reload(cssCode.value);
    }
  }

</script>

<style lang="less" scoped>
  .js-toolkit-box {
    display: flex;
    flex-direction: column;
    height: 100%;

    .js-panel-title {
      flex: none;
      padding: 0 8px 8px 14px;
      color: #333;
      font-size: 14px;
      font-weight: 700;
      line-height: 30px;
    }
  }
</style>
