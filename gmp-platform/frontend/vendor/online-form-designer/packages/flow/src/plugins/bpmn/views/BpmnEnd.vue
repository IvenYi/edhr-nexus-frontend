<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTooltips :node="node" />

    <div
      :title="node.data?.name"
      class="h-36px w-66px bg-[#666] rounded-18px color-white text-center lh-36px ell pl-10px pr-10px"
    >
      {{ node.data?.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';

  defineProps<{
    node: GctBpmnNode.BpmnEnd;
  }>();

  const { onNodeClick } = useGctFlow();
</script>

<style></style>
