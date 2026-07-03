<template>
  <div class="lo-control__tool-request">
    <i class="iconfont icon-fasongqingqiu"></i>
    <span>{{ nodeData.title || '模型请求' }}</span>
    <node-tools />
  </div>
</template>

<script lang="ts" setup>
  import NodeTools from '../tools/index.vue';
  import { useNode } from '../../../hooks/useNode';

  const { nodeData } = useNode();
</script>

<style lang="less"></style>
