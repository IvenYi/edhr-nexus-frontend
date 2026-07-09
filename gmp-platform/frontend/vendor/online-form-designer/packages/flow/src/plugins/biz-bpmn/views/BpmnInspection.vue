<template>
  <NodeComp :node="node" :style="{ '--n-color': '#F58C00' }">
    <template #icon>
      <i class="iconfont icon-jianyanzhihang-liuchengjiedian lh-[1em]"></i>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnInspection;
  }>();
</script>

<style lang="less" scoped></style>
