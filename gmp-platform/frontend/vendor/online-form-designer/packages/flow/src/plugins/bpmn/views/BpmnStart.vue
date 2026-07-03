<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTooltips :node="node" />

    <div
      :title="node.data?.name"
      class="gct-bpmn__start h-36px w-66px rounded-18px color-white text-center lh-36px ell pl-10px pr-10px"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
      >{{ node.data?.name }}</div
    >
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';

  defineProps<{
    node: GctBpmnNode.BpmnStart;
  }>();

  const { onNodeClick, nodeSelectedId } = useGctFlow();
</script>

<style lang="less" scoped>
  .gct-bpmn__start {
    background: #3168ec;
    transition: all 0.3s;

    &:hover {
      background: #4476ee;
    }
    &.selected {
      background: #1246c4;
    }
  }
</style>
