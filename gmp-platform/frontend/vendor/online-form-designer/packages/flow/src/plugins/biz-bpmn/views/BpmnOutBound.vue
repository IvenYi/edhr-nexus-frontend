<template>
  <NodeComp :node="node" :style="{ '--n-color': '#FF2C55' }">
    <template #icon>
      <i class="iconfont icon-chukuzhihang-liuchengjiedian lh-[1em]"></i>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnOutBound;
  }>();
</script>

<style lang="less" scoped></style>
