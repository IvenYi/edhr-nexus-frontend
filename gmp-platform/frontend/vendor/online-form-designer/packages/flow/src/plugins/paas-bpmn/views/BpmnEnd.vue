<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTooltips :node="node" />

    <div
      :title="t(getI18nName(node.data)) || node.data?.name"
      class="h-36px w-66px bg-[#666] rounded-18px color-white text-center lh-36px ell pl-10px pr-10px"
    >
      {{ t(getI18nName(node.data)) || node.data?.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useGctPaasBpmn } from '../hooks/useGctBpmn';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    node: GctBpmnNode.BpmnEnd;
  }>();

  const { t } = useI18n();
  const { onNodeClick } = useGctFlow();
  const { getI18nName } = useGctPaasBpmn();
</script>

<style></style>
