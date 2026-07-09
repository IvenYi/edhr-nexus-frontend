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
      <NodeInfoPopover :node="node" :config-data="node?.data?.bizData?.nodeConfig">
        <div
          class="gct-bpmn__parallel gct-flow__node gct-flow__node--parallel"
          :class="[
            nodeInstStatusMap[node.id]?.status,
            {
              selected: nodeSelectedId === node.id,
              'inst-mode': isInstMode,
            },
          ]"
          @click="onClick(node)"
        >
          <div class="gct-flow__node-icon">
            <!-- <icon-park type="api-app" /> -->
            <i class="iconfont icon-binghangfenzhi"></i>
          </div>
          <div class="flex-1 ell">
            <div class="ell">
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <span
                class="text-[#212528] font-500"
                :title="node?.data?.bizData?.nodeName || '并行节点'"
              >
                {{ node?.data?.bizData?.nodeName || '并行节点' }}
              </span>
            </div>
            <div class="text-[#5C5C5C] ell mt-4px" title="并发执行所有的分支操作">
              {{ '并发执行所有的分支操作' }}
            </div>
          </div>
        </div>
      </NodeInfoPopover>
      <div
        class="absolute bottom-2px right-4px text-14px text-[#FF980E] cursor-pointer"
        @click="onExpandChange"
      >
        <up-outlined v-if="!node.fold" />
        <down-outlined v-else />
      </div>
    </div>
    <template v-if="!node.fold">
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
      <NodeBranchEntrySvg :nodes="node.children" :height="40" :radius="10" :size="302" />

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
              nodeInstStatusMap[item.id]?.status === FlowNodeInstStatus.COMPLETED &&
                'inst-finished',
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

      <NodeBranchExitSvg :node="node" :nodes="node.children" :size="302" />
    </template>

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
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';
  import { caseGenerator } from '../models/parallel';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnParallel;
  }>();

  const { gctFlowDataMap, onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap, isReadonly } =
    useGctFlow();

  const onClick = (node: GctFlowNode.Basic) => {
    onNodeClick(node);
    // setFlowSelected();
  };

  const onExpandChange = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.fold = !props.node.fold;
  };

  const onAddCase = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.push(caseGenerator());
  };
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__parallel {
      --color: var(--node-color);
      // border: 1px solid #e8ebf0;
      // background-color: #fff;
      height: var(--node-height);
      // width: var(--node-width);
      border-radius: 4px;
      display: flex;
      // padding: 0 16px;
      align-items: center;
      justify-content: center;
      color: #212528;

      &.selected {
        // border-color: var(--color);
      }

      & > div:first-child {
        // height: 48px;
        // width: 48px;
        // border-radius: 4px;
        // margin-right: 8px;
        color: var(--color);
        background-color: rgba(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-binghangfenzhi {
        font-size: 24px;
      }
    }
  }
</style>
