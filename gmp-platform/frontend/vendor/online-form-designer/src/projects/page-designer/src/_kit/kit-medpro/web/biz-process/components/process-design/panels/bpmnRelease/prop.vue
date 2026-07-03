<template>
  <BpmnInspectionProp :node="node" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import BpmnInspectionProp from '../bpmnInspection/prop.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnRelease;
  }>();
</script>
<style lang="less" scoped></style>
