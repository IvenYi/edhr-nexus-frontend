<template>
  <svg :width="exitSvgDef.width" :height="exitSvgDef.height">
    <path
      class="gf__svg-line"
      :class="{
        'inst-finished': p.finished,
      }"
      v-for="p in exitSvgDef.paths"
      :id="p.id"
      :key="p.id"
      :d="p.d"
    />
  </svg>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import type { GctFlowNode } from '../types/index';
  import { useGctFlow } from '../hooks/useGctFlow';
  import { getLoopExitSvgDef, isFinished } from '../utils/svg-def';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodes: GctFlowNode.Basic[];
    size?: number;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { nodeInstStatusMap } = useGctFlow(uniqueFlowKey);

  // const activeIds = computed(() => {
  //  return  props.nodes
  // });

  const exitSvgDef = computed(() => {
    const def = getLoopExitSvgDef(props.nodes, { ...props });
    def.paths.forEach((item, index) => {
      const flowFinished = isFinished(props.nodes[index], nodeInstStatusMap.value);
      item.no = flowFinished ? 100 : 0;
      item.finished = flowFinished;
    });
    def.paths.sort((a, b) => a.no - b.no);
    return def;
  });
</script>

<style></style>
