<template>
  <ExclusiveProp v-if="!flowSelectedId" :node="node" />
  <CaseProp v-else :node="node" :caseId="flowSelectedId" :key="node.id" />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import CaseProp from './caseProp.vue';
  import ExclusiveProp from './exclusiveProp.vue';
  import { useGctFlow } from '@gct/flow';

  defineProps<{
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnParallel;
  }>();

  const { flowSelectedId } = useGctFlow();
</script>
<style lang="less" scoped></style>
