<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />
    <NodeInstStatus :node="node" />

    <div
      class="gct-bpmn__transaction"
      :class="{
        selected: nodeSelectedId === node.id,
      }"
    >
      <div>
        <i class="iconfont icon-fangfa lh-[1em]"></i>
      </div>
      <div :title="node.data?.name" class="flex-1 ell">{{ node.data?.name }}</div>
      <div
        class="tag-mode ell w28px overflow-hidden"
        :class="[node.data?.interactiveMode === 'async' && 'async']"
        :title="modeName"
      >
        {{ modeName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '../types';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { useGctFlow } from '../../../hooks/useGctFlow';

  const props = defineProps<{
    node: GctBpmnNode.BpmnTransaction;
  }>();

  const modeName = computed(() => {
    return $t(
      `sys.ipaas.responseMethod.${props.node?.data?.interactiveMode?.toUpperCase() || 'ASYNC'}`,
    );
  });
  const { onNodeClick, nodeSelectedId } = useGctFlow();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__transaction {
      --color: #31b7ec;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 120px;
      height: 46px;
      padding: 0 16px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;
      background-color: #fff;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      & > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        background-color: rgb(from var(--color) r g b / 10%);
        color: var(--color);
      }
    }
  }

  .tag-mode {
    padding: 0 4px;
    border-radius: 4px;
    background-color: #06f;
    color: #fff;
    font-size: 10px;

    &.async {
      background-color: #efa432;
    }
  }
</style>
