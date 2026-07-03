<template>
  <editor ref="editorRef" v-if="ready" />
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue';
  // import editor from '/@/components/Expression/views/editor.vue';
  import { ExpressionEditor as editor } from '/@/components/Expression/components';
  import { useExpression } from '/@/components/Expression/hooks/useExpression';

  const { openIframe } = useExpression(false);

  const ready = ref<boolean>(false);
  const editorRef = ref();

  watch(editorRef, (value) => {
    if (value && window.GCT_EXPRESSION_WINDOW)
      Object.assign(window.GCT_EXPRESSION_WINDOW, {
        ...value,
      });
  });

  onMounted(() => {
    ready.value = true;
    if (window.GCT_EXPRESSION_WINDOW) {
      openIframe(window.GCT_EXPRESSION_WINDOW.options);
    } else {
      window.GCT_EXPRESSION_WINDOW = {
        openIframe,
      };
    }
  });
</script>

<style lang="less">
  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
