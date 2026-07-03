<template>
  <div class="code-section">
    <div class="code-section__header">
      <span class="code-section__title">{{ title }}</span>
    </div>
    <VirtualJsonViewer
      class="code-section__list"
      :data-title="title"
      :json="json"
      :max-height="maxHeight - 49"
    />
  </div>
</template>

<script lang="ts" setup name="code-section">
  import VirtualJsonViewer from './virtual-json-viewer.vue';

  withDefaults(
    defineProps<{
      json: any | string;
      title: string;
      /** 代码区域的最大高度 */
      maxHeight?: number;
    }>(),
    {
      maxHeight: 800,
    },
  );
</script>

<style lang="less" scoped>
  .code-section {
    position: relative;
    &__header {
      height: 35px;
    }
    &__title {
      display: inline-block;
      padding: 0 10px;
      font-weight: 500;
      background: #e1e1e1;
      border-bottom-right-radius: 4px;
    }
    padding-bottom: 14px;
    margin-bottom: 20px;
    background: #f6f6f6;
  }
</style>
