<template>
  <EventConfig :node="node!" />
</template>

<script setup lang="ts">
  import EventConfig from '../../components/event-config.vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';

  defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();
</script>

<style></style>
