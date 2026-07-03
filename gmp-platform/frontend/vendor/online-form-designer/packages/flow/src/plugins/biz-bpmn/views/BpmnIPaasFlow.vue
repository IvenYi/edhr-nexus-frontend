<template>
  <NodeComp :node="node" :style="{ '--n-color': '#3168ec' }" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnIPassFlow;
  }>();
</script>
<style lang="less" scoped></style>
