<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />

    <div
      class="gct-bpmn__message"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
    >
      <div>
        <i class="iconfont icon-liuchengbiaodan lh-[1em]"></i>
      </div>
      <div :title="t(getI18nName(node.data)) || node.data?.name" class="flex-1 ell">
        {{ t(getI18nName(node.data)) || node.data?.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGctBizBpmn } from '../hooks/useGctBpmn';
  import { inject } from 'vue';

  defineProps<{
    node: GctBpmnNode.BpmnForm;
  }>();

  const bizFlowKey = inject('bizFlowKey') as string;
  const { onNodeClick, nodeSelectedId } = useGctFlow(bizFlowKey);
  const { t } = useI18n();
  const { getI18nName } = useGctBizBpmn();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__message {
      --color: #3168ec;
      border: 1px solid #e8ebf0;
      background-color: #fff;
      height: 46px;
      width: 120px;
      border-radius: 4px;
      display: flex;
      padding: 0 16px;
      align-items: center;
      justify-content: center;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      & > div:first-child {
        height: 20px;
        width: 20px;
        border-radius: 4px;
        margin-right: 8px;
        color: var(--color);
        background-color: rgb(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
