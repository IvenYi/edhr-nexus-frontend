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
  import { useGctBizBpmn } from '../hooks/useGctBpmn';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { inject } from 'vue';

  defineProps<{
    node: GctBpmnNode.BpmnEnd;
  }>();

  const { t } = useI18n();
  const bizFlowKey = inject('bizFlowKey') as string;
  const { onNodeClick } = useGctFlow(bizFlowKey);
  const { getI18nName } = useGctBizBpmn();
</script>

<style></style>
