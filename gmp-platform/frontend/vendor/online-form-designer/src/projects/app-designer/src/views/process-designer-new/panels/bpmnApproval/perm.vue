<template>
  <div class="p12px">
    <FieldPermission :data="node.data!" :key="node.id" />
  </div>
</template>
<script setup lang="ts">
  import FieldPermission from '../../components/field-permission.vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';

  defineProps<{
    node: GctBpmnNode.BpmnSubmit;
  }>();
</script>
<style lang="less" scoped></style>
