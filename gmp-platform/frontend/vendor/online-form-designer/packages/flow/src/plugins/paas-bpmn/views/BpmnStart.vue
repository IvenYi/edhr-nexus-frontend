<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTooltips :node="node" />

    <div
      :title="t(getI18nName(node.data)) || node.data?.name"
      class="gct-bpmn__start h-36px w-66px rounded-18px color-white text-center lh-36px ell pl-10px pr-10px"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
      :style="{
        '--color': FlowNodeInstStatusColor[nodeInstStatusMap[node.id]?.status] || '#3168ec',
      }"
      >{{ t(getI18nName(node.data)) || node.data?.name }}</div
    >
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useGctPaasBpmn } from '../hooks/useGctBpmn';
  import { FlowNodeInstStatusColor } from '../../../enums';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    node: GctBpmnNode.BpmnStart;
  }>();

  const { t } = useI18n();
  const { onNodeClick, nodeSelectedId, nodeInstStatusMap } = useGctFlow();
  const { getI18nName } = useGctPaasBpmn();
</script>

<style lang="less" scoped>
  .gct-bpmn__start {
    background: var(--color);
    transition: all 0.3s;

    &:hover {
      background: hsl(from var(--color) h s 65%);
    }
    &.selected {
      background: hsl(from var(--color) h s 45%);
    }
  }
</style>
