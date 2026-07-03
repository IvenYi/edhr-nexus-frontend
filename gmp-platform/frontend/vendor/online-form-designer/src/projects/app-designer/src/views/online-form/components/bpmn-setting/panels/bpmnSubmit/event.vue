<template>
  <BpmnEventConfig v-model:value="data.events" :supportEventTypes="NodeEventTypesMap[node.type]" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { BpmnEventConfig } from '/@online-form/approval';
  import { NodeEventTypesMap } from '../../constant';

  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';

  const props = defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const data = computed(() => props.node.data!);
</script>

<style></style>
