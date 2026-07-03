<template>
  <svg :width="entrySvgDef.width" :height="entrySvgDef.height">
    <path
      class="gf__svg-line"
      :class="{
        'inst-finished': p.finished,
      }"
      v-for="p in entrySvgDef.paths"
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
  import { getEntrySvgDef } from '../utils/svg-def';
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
    const def = getEntrySvgDef(props.nodes, {
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
