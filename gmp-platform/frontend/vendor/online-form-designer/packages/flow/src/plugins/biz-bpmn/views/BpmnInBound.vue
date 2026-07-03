<template>
  <NodeComp :node="node" :style="{ '--n-color': '#1DB94C' }">
    <template #icon>
      <i class="iconfont icon-rukuzhihang-liuchengjiedian lh-[1em]"></i>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnInBound;
  }>();
</script>

<style lang="less" scoped></style>
