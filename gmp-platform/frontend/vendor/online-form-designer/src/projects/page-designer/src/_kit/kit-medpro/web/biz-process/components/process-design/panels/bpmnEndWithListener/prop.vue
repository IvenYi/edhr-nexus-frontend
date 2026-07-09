<template>
  <EndNodeProp :node="node" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import EndNodeProp from '../bpmnEnd/prop.vue';

  defineProps<{
    node: GctBpmnNode.BpmnEndWithListener;
  }>();
</script>
<style lang="less" scoped></style>
