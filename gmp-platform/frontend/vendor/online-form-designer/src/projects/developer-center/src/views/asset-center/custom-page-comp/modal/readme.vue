<template>
  <a-drawer title="README.md" :closable="false" :width="width" :visible="visible" @close="onClose">
    <template #extra>
      <fullscreen-outlined v-if="width === '50%'" @click="onHandlerWidth('100%')" />
      <fullscreen-exit-outlined v-else @click="onHandlerWidth('50%')" />
      <close-outlined class="ml-16px" @click="onClose" />
    </template>
    <div class="mb-16px">{{ props.version }}</div>
    <div class="content p12px bg-[#E6E9EF]" v-html="parsedContent"></div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue';
  import { marked } from 'marked';

  const props = defineProps<{
    markdownFile: string;
    version: string;
  }>();

  const visible = ref();

  const width = ref('50%');

  const onClose = () => {
    visible.value = false;
    width.value = '50%';
  };

  const onHandlerWidth = (num) => {
    width.value = num;
  };

  const parsedContent = ref();

  /** 获取markdown文件内容并展示 */
  const getMarkdownContet = async () => {
    try {
      const response = await fetch('/minio/' + props.markdownFile);
      const markdownText = await response.text();
      parsedContent.value = marked(markdownText);
    } catch (error) {
      console.error('Error loading or parsing Markdown file:', error);
    }
  };

  watch(
    () => props.markdownFile,
    (val) => {
      if (val) {
        getMarkdownContet();
      }
    },
    {
      immediate: true,
    },
  );

  defineExpose({
    visible,
  });
</script>
<style lang="less" scoped>
  .content {
    height: calc(100vh - 141px);
  }
</style>
