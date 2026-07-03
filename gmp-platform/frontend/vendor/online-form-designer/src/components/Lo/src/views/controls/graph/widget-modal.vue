<template>
  <div class="lo-control__widget-modal">
    <i class="iconfont icon-motaikuang1"></i>
    <span> {{ nodeData.title || '模态框' }}</span>
    <node-tools />
  </div>
</template>

<script lang="ts" setup>
  import NodeTools from '../tools/index.vue';
  import { useNode } from '../../../hooks/useNode';

  const { nodeData } = useNode();
</script>

<style lang="less"></style>
