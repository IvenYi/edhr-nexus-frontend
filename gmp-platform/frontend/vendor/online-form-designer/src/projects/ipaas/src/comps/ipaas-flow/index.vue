<template>
  <div class="w100% h100%">
    <FlowDiagram @node-create="nodeCreate" :readonly="readonly" />
  </div>
</template>
<script setup lang="ts">
  import { defineAsyncComponent } from 'vue';
  import { FlowDiagram, useGctFlow, FlowNodeTypeEnum } from '@gct/flow';

  defineProps<{
    nodeCreate?: Function;
    nodeClick?: Function;
    readonly?: boolean;
  }>();

  const { registerNodeRender } = useGctFlow();

  registerNodeRender({
    [FlowNodeTypeEnum.App]: defineAsyncComponent(() => import('./node-render/NodeApp.vue')),
  });
</script>
<style lang="less" scoped></style>
