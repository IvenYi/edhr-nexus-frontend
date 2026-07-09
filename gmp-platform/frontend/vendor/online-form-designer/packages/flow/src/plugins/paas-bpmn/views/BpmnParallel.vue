<template>
  <BpmnExclusive :pre="pre" :node="node" />
</template>
<script setup lang="ts">
  import BpmnExclusive from './BpmnExclusive.vue';
  import type { IGctBpmnNode, GctBpmnNode } from '../types';

  defineProps<{
    pre?: IGctBpmnNode;
    node: GctBpmnNode.BpmnParallel;
  }>();
</script>
<style lang="less" scoped></style>
