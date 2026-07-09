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
      <NodeInstStatus :node="node" />
      <div
        class="gct-bpmn__parallel gct-flow__node gct-flow__node--parallel"
        :class="[
          nodeInstStatusMap[node.id]?.status,
          {
            selected: nodeSelectedId === node.id,
            'inst-mode': isInstMode,
            'is-pending': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.PENDING,
          },
        ]"
        @click="onClick(node)"
      >
        <div>
          <i class="iconfont icon-binghangfenzhi"></i>
        </div>
        <div class="flex-1 ell">
          <div class="ell">
            <!-- <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span> -->
            <span :title="t(getI18nName(node.data)) || node.data?.name">
              {{ t(getI18nName(node.data)) || node.data?.name }}
            </span>
          </div>
        </div>
      </div>
      <!-- 展开/收起 -->
      <!-- <div
        class="absolute bottom-2px right-4px text-14px text-[#FF980E] cursor-pointer"
        @click="onExpandChange"
      >
        <up-outlined v-if="!node.fold" />
        <down-outlined v-else />
      </div> -->
    </div>
    <div
      class="gf__line relative"
      :class="{
        'inst-finished': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED,
      }"
    >
      <div
        v-if="!isReadonly"
        class="text-[#797A7D] text-[12px] absolute left--49px top-27px bg-[#fff] cursor-pointer border-[#E8EBF0] border-1px border-solid lh-18px px13px py3px rounded-4px"
        style="white-space: nowrap"
        @click="onAddCase"
      >
        添加并行分支
      </div>
    </div>
    <NodeBranchEntrySvg :nodes="node.children" />

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
          :class="[
            nodeInstStatusMap[item.id]?.status === FlowNodeInstStatus.COMPLETED && 'inst-finished',
          ]"
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

    <!-- <div
      class="gf__line"
      :class="{
        'inst-finished': isFinished(node, nodeInstStatusMap),
      }"
    ></div> -->
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
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';
  import { caseGenerator } from '../models/bpmnParallelReal.ts';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGctBizBpmn } from '../hooks/useGctBpmn';
  import { inject } from 'vue';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnParallelReal;
  }>();

  const { t } = useI18n();
  const bizFlowKey = inject('bizFlowKey') as string;
  const { gctFlowDataMap, onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap, isReadonly } =
    useGctFlow(bizFlowKey);

  const { getI18nName } = useGctBizBpmn();
  const onClick = (node: GctFlowNode.Basic) => {
    onNodeClick(node);
    // setFlowSelected();
  };

  // const onExpandChange = () => {
  //   // eslint-disable-next-line vue/no-mutating-props
  //   props.node.fold = !props.node.fold;
  // };

  const onAddCase = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.push(caseGenerator());
  };
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__parallel {
      --color: #ff980e;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 46px;
      padding: 0 16px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;
      background-color: #fff;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      &.inst-mode {
        border-color: var(--color);

        &.is-pending {
          background-color: #fafafa;
          color: #666;
        }
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

      .icon-binghangfenzhi {
        // font-size: 24px;
      }
    }
  }
</style>
