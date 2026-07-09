<template>
  <div ref="monacoEditorElement"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, onUnmounted } from 'vue';
  import { loadGrammars, loadTheme } from 'monaco-volar';
  import { setupMonacoEnv, loadOnigasm } from '../composables/useMonacoEnvironment';

  const monacoEditorElement = ref<HTMLElement>();
  const emit = defineEmits(['update:value', 'change', 'blur', 'focus']);

  export interface Prop {
    value?: string;
  }

  let monaco: typeof Monaco | null = null;
  let editorInstance!: Monaco.editor.IStandaloneCodeEditor;

  const props = withDefaults(defineProps<Prop>(), {
    value: '',
  });

  const codeValue = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v || '');
    },
  });

  const afterReady = (theme: string) => {
    if (!monaco) {
      console.warn('[Editor] Monaco editor is not available for afterReady');
      return;
    }

    const model = monaco.editor.createModel(
      codeValue.value,
      'vue',
      monaco.Uri.parse('file:///demo.vue'),
    );
    editorInstance = monaco.editor.create(monacoEditorElement.value!, {
      theme,
      model,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false,
      },
      inlineSuggest: {
        enabled: false,
      },
      'semanticHighlighting.enabled': true,
    });

    loadGrammars(monaco, editorInstance);
    editorInstance.onDidChangeModelContent(() => {
      const errs = getErrors();
      if (errs.length) return;
      const newValue = editorInstance.getValue();
      codeValue.value = newValue;
      emit('change', newValue);
    });

    editorInstance.onDidBlurEditorText(() => {
      const errs = getErrors();
      if (errs.length) return;
      const newValue = editorInstance.getValue();
      codeValue.value = newValue;
      emit('blur', newValue);
    });

    editorInstance.onDidFocusEditorText(() => {
      emit('focus');
    });
    console.log('VueEditor ready');
  };

  onMounted(async () => {
    console.log('VueEditor onMounted');
    monaco = await window.monacoLoader.loadMonaco();

    // 按顺序执行，确保 Volar 环境完全初始化
    try {
      await setupMonacoEnv(); // 必须先完成
      await loadOnigasm();
      const theme = await loadTheme(monaco.editor);
      afterReady(theme.light);
    } catch (error) {
      console.error('[Editor] Failed to initialize:', error);
    }
  });

  onUnmounted(() => {
    dispose();
  });

  function getErrors() {
    if (!monaco) return [];
    const errs = monaco.editor.getModelMarkers({
      owner: 'vue',
    });
    return errs;
  }

  function dispose() {
    if (!editorInstance || !monaco) return;
    console.log(monaco.editor.getModels());
    monaco.editor.getModels().forEach((model) => model.dispose());
    editorInstance.dispose();
  }

  defineExpose({
    getErrors,
    getVueInstance() {
      return editorInstance;
    },
  });
</script>
<style lang="pcss"></style>
