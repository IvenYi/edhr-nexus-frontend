<template>
  <BpmnBizDocumentProp :node="node" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import BpmnBizDocumentProp from '../bpmnBizDocument/prop.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnInBound;
  }>();
</script>
<style lang="less" scoped></style>
