<template>
  <div class="content p12px" v-html="parsedContent"></div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { marked } from 'marked';

  const parsedContent = ref();
  /** 获取markdown文件内容并展示 */
  const getMarkdownContet = async () => {
    try {
      const response = await fetch('/doc/自定义页面插件开发指南.md');
      const markdownText = await response.text();
      parsedContent.value = marked(markdownText);
    } catch (error) {
      console.error('Error loading or parsing Markdown file:', error);
    }
  };
  getMarkdownContet();
</script>
