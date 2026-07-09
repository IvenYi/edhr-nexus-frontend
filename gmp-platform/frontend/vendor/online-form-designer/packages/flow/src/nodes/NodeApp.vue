<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />

    <component
      v-if="nodeRenderMap[node.type]"
      :key="node.id"
      :is="nodeRenderMap[node.type]"
      v-bind="$props"
    />
    <div v-else class="gct-flow__node gct-flow__node--app flex items-center">
      <div class="gct-flow__node-icon">
        <icon-park type="api-app" />
      </div>
      <div class="gct-flow__node-content">
        <div>N{{ gctFlowDataMap[node.id].idx + 1 }}.--</div>
        <div>--</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import { useGctFlow } from '../hooks/useGctFlow';
  import NodeTools from '../comps/NodeTools.vue';
  import NodeTooltips from '../comps/NodeTooltips.vue';
  import { inject } from 'vue';

  defineProps<{
    node: GctFlowNode.App;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { onNodeClick, nodeRenderMap, gctFlowDataMap } = useGctFlow(uniqueFlowKey);
</script>

<style lang="less" scoped></style>
