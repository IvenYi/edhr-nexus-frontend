<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <div class="ks-row-center">
      <div
        class="gf__line"
        :class="{
          'inst-finished': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED,
        }"
      ></div>
    </div>
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />

    <div
      class="gct-bpmn__join"
      :class="{
        selected: nodeSelectedId === node.id,
        'inst-mode': isInstMode,
        'is-pending': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.PENDING,
      }"
      :style="{
        '--color': FlowNodeInstStatusColor[nodeInstStatusMap[node.id]?.status] || '#ff980e',
      }"
    >
      <div>
        <i class="iconfont icon-juhejiedian lh-[1em]"></i>
      </div>
      <div :title="i18nTitle" class="flex-1 ell">
        {{ $t(getI18nName(node.data)) || node.data?.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import { useGctPaasBpmn } from '../hooks/useGctBpmn';
  import { FlowNodeInstStatus, FlowNodeInstStatusColor } from '../../../enums';

  const props = defineProps<{
    node: GctBpmnNode.BpmnJoin;
  }>();

  const i18nTitle = computed(() => $t(getI18nName(props?.node.data)) || props?.node.data?.name);

  const { onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap } = useGctFlow();
  const { getI18nName } = useGctPaasBpmn();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__join {
      // --color: #ff980e;
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
