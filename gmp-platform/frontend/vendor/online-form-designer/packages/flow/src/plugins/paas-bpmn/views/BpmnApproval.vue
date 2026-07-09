<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />
    <NodeInstStatus :node="node" />

    <NodePopover :node="node">
      <template #default>
        <div
          class="gct-bpmn__approval"
          :class="{
            selected: nodeSelectedId === node.id,
            'inst-mode': isInstMode,
            'is-pending': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.PENDING,
          }"
          :style="{
            '--color': FlowNodeInstStatusColor[nodeInstStatusMap[node.id]?.status] || '#3168ec',
          }"
        >
          <div>
            <i class="iconfont icon-shenpi1 lh-[1em]"></i>
          </div>
          <div :title="node.data?.name" class="flex-1 ell">{{ node.data?.name }}</div>
        </div>
      </template>
    </NodePopover>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import NodePopover from '../comps/node-popover.vue';
  import { FlowNodeInstStatus, FlowNodeInstStatusColor } from '../../../enums';

  defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const { onNodeClick, nodeSelectedId, nodeInstStatusMap, isInstMode } = useGctFlow();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__approval {
      // --color: #3168ec;
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

      &.inst-mode {
        border-color: var(--color);

        &:hover {
          background-color: hsl(from var(--color) h s 95%);
        }

        &.is-pending {
          background-color: #fafafa;
          color: #666666;
        }
      }

      & > div:first-child {
        height: 20px;
        width: 20px;
        border-radius: 4px;
        margin-right: 8px;
        color: var(--color);
        background-color: rgba(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
