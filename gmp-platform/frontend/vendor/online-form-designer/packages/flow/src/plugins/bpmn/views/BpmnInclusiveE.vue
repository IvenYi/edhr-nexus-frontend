<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />

    <div
      class="gct-bpmn__join"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
    >
      <div>
        <i class="iconfont icon-juhejiedian lh-[1em]"></i>
      </div>
      <div :title="node.data?.name" class="flex-1 ell">{{ node.data?.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';

  defineProps<{
    node: GctBpmnNode.BpmnEnd;
  }>();

  const { onNodeClick, nodeSelectedId } = useGctFlow();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__join {
      --color: #ff980e;
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
        background-color: rgba(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
