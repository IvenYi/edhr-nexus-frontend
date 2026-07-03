<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />
    <NodeInstStatus :node="node" />

    <NodePopover v-model:visible="visiblePopover" :node="node">
      <div
        class="gct-bpmn__message"
        :class="[
          nodeSelectedId === node.id && 'selected',
          nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED && 'isFinished',
        ]"
        @mouseenter="visiblePopover = true"
      >
        <div>
          <slot name="icon"></slot>
        </div>
        <div :title="t(getI18nName(node.data)) || node.data?.name" class="flex-1 ell">
          {{ t(getI18nName(node.data)) || node.data?.name }}
        </div>
        <div>
          <slot name="extra"></slot>
        </div>
      </div>
    </NodePopover>
  </div>
</template>

<script setup lang="ts">
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGctBizBpmn } from '../hooks/useGctBpmn';
  import { GctFlowNode } from '../../../types';
  import NodePopover from '../comps/node-popover.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { BizNodeInstStatus } from '../enums';
  import { FlowNodeInstStatus } from '../../../enums';
  import { inject, ref } from 'vue';

  defineProps<{
    node: GctFlowNode.Basic;
  }>();

  const bizFlowKey = inject('bizFlowKey') as string;
  const { onNodeClick, nodeSelectedId, nodeInstStatusMap } = useGctFlow(bizFlowKey);
  const { t } = useI18n();
  const { getI18nName } = useGctBizBpmn();
  const visiblePopover = ref(false);
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__message {
      --color: var(--n-color);

      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--n-width, 120px);
      height: 46px;
      padding: 0 16px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;
      background-color: #fff;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      &.isFinished {
        border-color: #309c41;
      }

      & > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border-radius: 4px;
        background-color: rgb(from var(--color) r g b / 10%);
        color: var(--color);
      }
    }
  }
</style>
