<template>
  <svg :width="entrySvgDef.width" :height="entrySvgDef.height">
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
        <polygon points="0 0, 6 2.5, 0 5" fill="#d7d7d7" />
      </marker>
    </defs>
    <path
      class="gf__svg-line"
      :class="{
        'inst-finished': p.finished,
      }"
      v-for="p in entrySvgDef.paths"
      :id="p.id"
      :key="p.id"
      :d="p.d"
      marker-end="url(#arrowhead)"
    />
  </svg>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import type { GctFlowNode } from '../types/index';
  import { useGctFlow } from '../hooks/useGctFlow';
  import { getLoopEntrySvgDef } from '../utils/svg-def';
  import { FlowNodeInstStatus } from '../enums';

  const props = defineProps<{
    nodes: GctFlowNode.Flow[];
    height?: number;
    radius?: number;
    size?: number;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { nodeInstStatusMap } = useGctFlow(uniqueFlowKey);

  const entrySvgDef = computed(() => {
    const def = getLoopEntrySvgDef(props.nodes, {
      ...props,
    });
    def.paths.forEach((item, index) => {
      console.log('form index map 2', props.nodes[index].id);
      const flowFinished = [FlowNodeInstStatus.COMPLETED, FlowNodeInstStatus.RUNNING].includes(
        nodeInstStatusMap.value[props.nodes[index].id]?.status,
      );
      item.no = flowFinished ? 100 : 0;
      item.finished = flowFinished;
    });
    def.paths.sort((a, b) => a.no - b.no);
    return def;
  });
</script>

<style></style>
