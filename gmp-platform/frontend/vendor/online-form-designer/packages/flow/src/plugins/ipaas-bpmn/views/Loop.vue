<template>
  <div
    class="flex flex-col items-center"
    :style="{
      '--node-color': '#4c26cf',
    }"
  >
    <div class="gf__node">
      <NodeTools :node="node" />
      <NodeTooltips :node="node" />
      <NodeInstStatus :node="node" />
      <NodeInfoPopover :node="node" :config-data="node?.data?.bizData?.nodeConfig">
        <div
          class="gct-bpmn__loop gct-flow__node gct-flow__node--loop"
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
            <i class="iconfont icon-binghangfenzhi"></i>
          </div>
          <div class="flex-1 ell">
            <div class="ell">
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <span
                class="text-[#212528] font-500"
                :title="node?.data?.bizData?.nodeName || '循环节点'"
              >
                {{ node?.data?.bizData?.nodeName || '循环节点' }}
              </span>
            </div>
            <div class="text-[#5C5C5C] ell mt-4px" title="指定循环方式，循环执行">
              {{ '指定循环方式，循环执行' }}
            </div>
          </div>
        </div>
      </NodeInfoPopover>
      <div
        class="absolute bottom-2px right-4px text-14px text-[#4c26cf] cursor-pointer"
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
      ></div>
      <loopFlowEntrySvg :nodes="node.children" :height="40" :radius="10" :size="302" />

      <div class="gf__flows loop-flows">
        <div class="gf__flow relative">
          <div
            class="gf__line--with-actions loop-left-lineå"
            :class="{
              'inst-finished': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED,
            }"
          >
          </div>
          <div class="group1">
            <span class="node-text">循环执行</span>
          </div>
          <div
            class="gf__line-pad"
            :class="{
              'inst-finished': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED,
            }"
          ></div>
        </div>
        <div :key="item.id" v-for="(item, index) in node.children" class="gf__flow">
          <div
            class="gf__line--with-actions"
            :class="{
              'inst-finished': nodeInstStatusMap[item.id]?.status === FlowNodeInstStatus.COMPLETED,
            }"
          >
            <LineActions
              v-if="!isReadonly"
              :list="item.children"
              :parent="node"
              :is-flow-start="true"
            />
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

      <loopFlowExitSvg :node="node" :nodes="node.children" :size="302" />
    </template>
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
  import loopFlowEntrySvg from '../../../comps/loopFlowEntrySvg.vue';
  import loopFlowExitSvg from '../../../comps/loopFlowExitSvg.vue';
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnLoop;
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
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__loop {
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
  .group1 {
    position: absolute;
    top: calc(50% - 10px);
    width: 23px;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    --line-color: var(--border-color);
    user-select: none;
    .line-arrow {
      transform: rotateZ(180deg);
      width: 1px;
    }
    .node-text {
      writing-mode: tb;
      margin-top: 8px;
      background-color: #e6e9ef;
      padding: 4px 0;
      border-radius: 4px;
    }
  }
  .loop-flows {
    min-height: 80px;
  }
</style>
