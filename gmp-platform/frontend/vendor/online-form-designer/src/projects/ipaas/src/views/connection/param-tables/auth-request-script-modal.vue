<template>
  <a-modal
    :class="[ns.b()]"
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    :mask-closable="false"
    :keyboard="false"
    width="1040px"
    :title="t('sys.ipaas.scriptEditor')"
    :body-style="{
      padding: 0,
      'padding-top': '16px',
    }"
    :ok-text="t('sys.okText')"
    :cancel-text="t('sys.cancelText')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="w-full h-60vh" ref="CodeContainerRef"></div>
  </a-modal>
</template>

<script lang="ts" setup name="auth-request-script-modal">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onBeforeUnmount, onMounted, ref } from 'vue';

  const { t } = useI18n();
  const ns = useNamespace('auth-request-script-modal');
  const CodeContainerRef = ref();
  let monaco: any = null;
  let monacoEditor: any = null;
  const visible = ref<boolean>(true);

  const props = withDefaults(
    defineProps<{
      value?: string;
      onOk?: any;
    }>(),
    {},
  );

  const DefaultContent =
    '/**\n' +
    ' * @param {IScriptArgs} args - 参数\n' +
    ' */\n' +
    'function main(args) {\n' +
    '  \n' +
    '  return {\n' +
    '    \n' +
    '  }\n' +
    '}';

  onMounted(async () => {
    monaco = await window.monacoLoader.loadMonaco();
    monacoEditor = monaco.editor.create(CodeContainerRef.value, {
      value: props.value ? decodeURIComponent(props.value) : DefaultContent,
      language: 'javascript',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });
  });

  onBeforeUnmount(() => {
    if (monacoEditor) {
      monacoEditor.dispose();
    }
  });

  const handleCancel = () => {
    visible.value = false;
  };

  const handleOk = async () => {
    if (!monacoEditor) {
      console.warn('[ScriptEditorModal] Monaco editor is not available on handleOk');
      return;
    }
    const jsCode = monacoEditor.getValue();
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(encodeURIComponent(jsCode));
    }
    visible.value = false;
  };
</script>

<style lang="scss" scoped>
  $auth-request-script-modal: ();

  @include b(auth-request-script-modal) {
    @include set-component-css-var(auth-request-script-modal, $auth-request-script-modal);
  }
</style>
