<template>123</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';

  defineProps<{
    node: GctBpmnNode.BpmnParallelReal;
  }>();
</script>
<style lang="less" scoped></style>
