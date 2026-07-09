<template>
  <NodeProp :node="node" />
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import NodeProp from '../bpmnExclusive/prop.vue';

  defineProps<{
    node: GctBpmnNode.BpmnExclusive;
  }>();
</script>

<style></style>
