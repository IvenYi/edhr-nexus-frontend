<template>
  <div :class="ns.b()">
    <div id="json-editor-container" style="height: 500px"></div>
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { message } from 'ant-design-vue';

  const ns = useNamespace('import-json-modal');
  const props = withDefaults(
    defineProps<{
      json?: string;
    }>(),
    {
      json: '',
    },
  );

  /** 是否修改过 */
  let monaco: any = null;
  let editor: any = null;
  let model: any = null;

  onMounted(async () => {
    monaco = await window.monacoLoader.loadMonaco();
    model = monaco.editor.createModel(props.json, 'json');
    editor = monaco.editor.create(document.getElementById('json-editor-container')!, {
      model,
      automaticLayout: true,
    });
  });

  onBeforeUnmount(() => {
    if (editor) {
      editor.dispose();
    }
    if (model) {
      model.dispose();
    }
  });

  useModal(async () => {
    let allowClose = false;
    let json: any = undefined;
    if (!model) {
      console.warn('[ImportJsonModal] Monaco editor model is not available on modal close');
      return {
        ok: false,
        data: [],
      };
    }
    const curStr = model.getValue();
    try {
      json = JSON.parse(curStr);
      allowClose = true;
    } catch (error) {
      message.error('JSON格式错误');
    }
    return {
      ok: allowClose,
      data: [json],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(import-json-modal) {
    padding-top: 12px;
  }
</style>
