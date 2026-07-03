<template>
  <NodeComp :node="node" :style="{ '--n-color': '#31B7EC' }">
    <template #icon>
      <i class="iconfont icon-shangliaozhihangjiedian lh-[1em]"></i>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnMaterialLoading;
  }>();
</script>

<style lang="less" scoped></style>
