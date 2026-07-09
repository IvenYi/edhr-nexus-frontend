<template>
  <div
    class="flex flex-col items-center"
    :style="{
      '--node-color': '#FF980E',
    }"
  >
    <div class="gf__node">
      <NodeTools :node="node" />
      <NodeTooltips :node="node" />
      <div
        class="gct-bpmn__parallel"
        :class="{
          selected: nodeSelectedId === node.id,
        }"
        @click="onClick(node)"
      >
        <div>
          <i class="iconfont lh-[1em] icon-binghangfenzhi"></i>
        </div>
        <div :title="node.data?.name" class="flex-1 ell">{{ node.data?.name }}</div>
      </div>
    </div>

    <div
      class="gf__line"
      :class="{
        'inst-finished': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED,
      }"
    ></div>
    <NodeBranchEntrySvg :nodes="node.children" :height="20" :radius="10" />

    <div class="gf__flows">
      <div :key="item.id" v-for="(item, index) in node.children" class="gf__flow">
        <div
          class="gf__line--with-actions"
          :class="{
            'inst-finished': nodeInstStatusMap[item.id]?.status === FlowNodeInstStatus.COMPLETED,
          }"
        >
          <LineActions v-if="!isReadonly" :list="item.children" :is-flow-start="true" />
        </div>
        <LineArrow
          v-if="item.children.length"
          :class="{
            'inst-finished': nodeInstStatusMap[item.id]?.status === FlowNodeInstStatus.COMPLETED,
          }"
        />

        <NodeFlow
          :node="node"
          :flow="item"
          :flow-index="index"
          :flow-size="node.children!.length"
          :parent-id="item.id"
        />
        <div
          class="gf__line-pad"
          :class="{
            'inst-finished': isFinished(item, nodeInstStatusMap),
          }"
        ></div>
      </div>
    </div>

    <NodeBranchExitSvg :node="node" :nodes="node.children" />

    <div
      class="gf__line"
      :class="{
        'inst-finished': isFinished(node, nodeInstStatusMap),
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode, IGctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeFlow from '../../../nodes/NodeFlow.vue';
  import LineArrow from '../../../comps/LineArrow.vue';
  import LineActions from '../../../comps/LineActions.vue';
  import { GctFlowNode } from '../../../types';
  import NodeBranchEntrySvg from '../../../comps/NodeBranchEntrySvg.vue';
  import NodeBranchExitSvg from '../../../comps/NodeBranchExitSvg.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';

  defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnInclusiveS;
  }>();

  const { onNodeClick, nodeSelectedId, setFlowSelected, isReadonly, nodeInstStatusMap } =
    useGctFlow();

  const onClick = (node: GctFlowNode.Basic) => {
    onNodeClick(node);
    setFlowSelected();
  };
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__parallel {
      --color: var(--node-color);
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
