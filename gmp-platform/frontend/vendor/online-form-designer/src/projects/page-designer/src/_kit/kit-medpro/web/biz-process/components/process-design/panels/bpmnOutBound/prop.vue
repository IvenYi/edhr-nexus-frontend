<template>
  <BpmnInBoundProp :node="node" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import BpmnInBoundProp from '../bpmnInBound/prop.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnOutBound;
  }>();
</script>
<style lang="less" scoped></style>
