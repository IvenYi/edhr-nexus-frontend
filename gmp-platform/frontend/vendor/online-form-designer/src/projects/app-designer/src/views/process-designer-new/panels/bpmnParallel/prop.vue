<template>
  <Prop :node="node" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import Prop from '../bpmnExclusive/prop.vue';

  defineProps<{
    node: GctBpmnNode.BpmnParallel;
  }>();
</script>
<style lang="less" scoped></style>
