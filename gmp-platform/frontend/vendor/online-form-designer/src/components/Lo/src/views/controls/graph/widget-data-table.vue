<template>
  <div class="lo-control__widget-modal">
    <i class="iconfont icon-biaoge"></i>
    <span>{{ nodeData.title || '数据表格' }}</span>
    <node-tools
  /></div>
</template>

<script lang="ts" setup>
  import NodeTools from '../tools/index.vue';
  import { useNode } from '../../../hooks/useNode';

  const { nodeData } = useNode();
</script>

<style lang="less"></style>
