<template>
  <div
    class="flex flex-col items-center"
    :style="{
      '--node-color': '#088c49',
    }"
  >
    <div class="gf__node">
      <NodeTools :node="node" />
      <NodeTooltips :node="node" />
      <NodeInstStatus :node="node" />
      <NodeInfoPopover :node="node" :config-data="node?.data?.bizData?.nodeConfig">
        <div
          class="gct-bpmn__exclusive gct-flow__node gct-flow__node--exclusive"
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
            <i class="iconfont lh-[1em]" :class="['icon-fenzhi']"></i>
          </div>
          <div class="flex-1 ell">
            <div :title="node.data?.name" class="ell">
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <span class="text-[#212528] font-500" :title="node.data?.bizData?.nodeName">
                {{ node.data?.bizData?.nodeName }}
              </span>
            </div>
            <div class="ell mt4px text-[#5c5c5c]" title="通过条件判断执行不同分支">{{
              '通过条件判断执行不同分支'
            }}</div>
          </div>
        </div>
      </NodeInfoPopover>
      <div
        class="absolute bottom-2px right-4px text-14px text-[#088c49] cursor-pointer"
        @click="onExpandChange"
      >
        <up-outlined v-if="!node.fold" />
        <down-outlined v-else />
      </div>
      <div
        v-show="!node.fold && !isReadonly"
        class="text-[#797A7D] text-[12px] absolute left-50% bottom--43px translate-x--50% bg-[#fff] cursor-pointer border-[#E8EBF0] border-1px border-solid lh-18px px13px py3px rounded-4px"
        style="white-space: nowrap"
        @click="handleCaseAdd(node.children.length - 2)"
      >
        添加条件分支
      </div>
    </div>
    <template v-if="!node.fold">
      <NodeBranchEntrySvg :nodes="node.children" :size="302" />

      <div class="gf__flows">
        <div :key="item.id" v-for="(item, index) in node.children" class="gf__flow">
          <LineArrow
            :class="[
              [FlowNodeInstStatus.RUNNING, FlowNodeInstStatus.COMPLETED].includes(
                nodeInstStatusMap[item.id]?.status,
              ) && 'inst-finished',
            ]"
          />

          <div
            class="gct-bpmn__case-card"
            :class="[nodeInstStatusMap[item.id]?.status, { 'inst-mode': isInstMode }]"
            @click="onCaseClick(node, item.id)"
          >
            <NodeTooltips :node="item" />
            <NodeInstStatus :node="item" style="top: 0" />
            <template v-if="index + 1 === node.children.length">
              <div class="gct-bpmn__case-card--title ell">
                <span
                  class="bg-[#E7F4ED] text-[#088C49] px6px h24px inline-flex rounded-4px ks-row-center-middle mr8px"
                >
                  ELSE
                </span>
                <span class="text-[#797A7D] mr4px">N{{ gctFlowDataMap[item.id].idx + 1 }}.</span>
                <span :title="item.data?.bizData?.nodeName">
                  {{ item.data?.bizData?.nodeName }}
                </span>
              </div>
              <!-- <div class="gct-bpmn__case-card--description flex items-center">
                <div class="color-[#797A7D] ell w-full">
                  当<span class="color-[#252525] ml-4px mr-4px">上述节点都不满足</span>时
                </div>
              </div> -->
            </template>
            <template v-else>
              <div class="gct-bpmn__case-card--title ell">
                <span
                  class="bg-[#E7F4ED] text-[#088C49] px6px h24px inline-flex rounded-4px ks-row-center-middle mr8px"
                >
                  {{ index === 0 ? 'IF' : 'ELSE IF' }}
                </span>
                <span class="text-[#797A7D] mr4px">N{{ gctFlowDataMap[item.id].idx + 1 }}.</span>
                <span :title="item.data?.bizData?.nodeName">
                  {{ item.data?.bizData?.nodeName }}
                </span>
              </div>
              <!-- <div class="gct-bpmn__case-card--description flex items-center">
                <div class="color-[#252525] ell w-full" :title="item.data?.bizData?.nodeName">
                  {{ item.data?.bizData?.nodeName }}
                </div>
              </div> -->
            </template>

            <div class="case-tools" v-if="!isReadonly">
              <div
                v-if="index + 1 < node.children.length"
                @click.stop="handleCaseAdd(index)"
                class="case-tool__item primary"
                :title="i18nAddTitle"
              >
                <file-add-outlined class="text-12px" />
              </div>
              <div
                v-if="index + 1 < node.children.length && node.children.length > 2"
                @click.stop="handleCaseDelete(index)"
                class="case-tool__item error"
                :title="i18nDeleteTitle"
              >
                <i class="iconfont icon-shanchu1 lh-1em important-text-12px"></i>
              </div>
            </div>
          </div>

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
  import { caseIfGenerator } from '../models/exclusive';
  import { GctFlowNode } from '../../../types';
  import NodeBranchEntrySvg from '../../../comps/NodeBranchEntrySvg.vue';
  import NodeBranchExitSvg from '../../../comps/NodeBranchExitSvg.vue';
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';
  import { computed, ref } from 'vue';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnExclusive;
  }>();

  const {
    onNodeClick,
    nodeSelectedId,
    setFlowSelected,
    isReadonly,
    nodeInstStatusMap,
    gctFlowDataMap,
    isInstMode,
  } = useGctFlow();

  const i18nAddTitle = computed(() => $t('sys.add'));

  const i18nDeleteTitle = computed(() => $t('sys.delete'));

  const handleCaseAdd = (index: number) => {
    const newCase = caseIfGenerator();
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index + 1, 0, newCase);
  };

  const handleCaseDelete = (index: number) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 1);
  };

  const onClick = (node: GctFlowNode.Basic) => {
    onNodeClick(node);
    setFlowSelected();
  };

  const onCaseClick = (node: GctFlowNode.Basic, flowId: string) => {
    onNodeClick(node);
    setFlowSelected(flowId);
  };

  const onExpandChange = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.fold = !props.node.fold;
  };
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__exclusive {
      --color: var(--node-color);
      // border: 1px solid #e8ebf0;
      // background-color: #fff;
      height: var(--node-height);
      // width: 120px;
      border-radius: 4px;
      display: flex;
      // padding: 0 16px;
      align-items: center;
      justify-content: center;
      color: #212528;

      &.selected {
        border-color: var(--color);
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
    }

    &__case-card {
      --color: var(--node-color);
      width: 200px;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      padding: 12px;
      display: flex;
      flex-direction: column;
      position: relative;

      &.COMPLETED {
        border-color: #088c49;
      }

      &--title {
        color: #666666;
        flex: none;
      }
      &--description {
        margin-top: 4px;
        height: 32px;
        background-color: #f7f8fa;
        border-radius: 2px;
        padding: 2px 8px;
      }

      &:hover .case-tools {
        display: flex;
      }
    }
  }

  .case-tools {
    display: none;
    position: absolute;
    top: -1px;
    right: 0;
    padding: 2px 0;
    transform: translateY(-100%);
  }

  .case-tool__item {
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 4px;
    cursor: pointer;

    &:not(:last-child) {
      margin-right: 6px;
    }

    &.primary {
      background: #3168ec;
    }
    &.error {
      background: var(--ant-error-color);
    }
  }
</style>
