<template>
  <div
    class="flex flex-col items-center"
    :style="{
      '--node-color': isInclusiveNode ? '#FF980E' : '#088c49',
    }"
  >
    <div v-if="!isPrevBpmnJudge" class="gf__node">
      <NodeTools :node="node" />
      <NodeTooltips :node="node" />
      <div
        class="gct-bpmn__exclusive"
        :class="{
          selected: nodeSelectedId === node.id,
        }"
        @click="onClick(node)"
      >
        <div>
          <i
            class="iconfont lh-[1em]"
            :class="[isInclusiveNode ? 'icon-binghangfenzhi' : 'icon-fenzhi']"
          ></i>
        </div>
        <div :title="node.data?.name" class="flex-1 ell">{{ node.data?.name }}</div>
      </div>
    </div>

    <NodeBranchEntrySvg :nodes="node.children" />

    <div class="gf__flows">
      <div :key="item.id" v-for="(item, index) in node.children" class="gf__flow">
        <LineArrow
          :class="{
            'inst-finished': [FlowNodeInstStatus.RUNNING, FlowNodeInstStatus.COMPLETED].includes(
              nodeInstStatusMap[item.id]?.status,
            ),
          }"
        />

        <div v-if="isPrevBpmnJudge">{{ item.caseCfg?.name }}</div>
        <div v-else class="gct-bpmn__case-card" @click="onCaseClick(node, item.id)">
          <NodeTooltips :node="item" />
          <template v-if="index + 1 === node.children.length">
            <div class="gct-bpmn__case-card--title">否则</div>
            <div class="gct-bpmn__case-card--description flex items-center">
              <div class="color-[#797A7D] ell w-full">
                当<span class="color-[#252525] ml-4px mr-4px">上述节点都不满足</span>时
              </div>
            </div>
          </template>
          <template v-else>
            <div class="gct-bpmn__case-card--title">条件{{ index + 1 }}</div>
            <div class="gct-bpmn__case-card--description flex items-center">
              <div class="color-[#252525] ell w-full" :title="item.caseCfg?.name">
                {{ item.caseCfg?.name }}
              </div>
            </div>
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

    <div v-if="isInclusiveNode" class="gf__line"></div>
  </div>
</template>

<script setup lang="ts">
  import type { GctBpmnNode, IGctBpmnNode } from '../types';
  import { BpmnNodeTypeEnum } from '../enums';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeFlow from '../../../nodes/NodeFlow.vue';
  import LineArrow from '../../../comps/LineArrow.vue';
  import LineActions from '../../../comps/LineActions.vue';
  import { computed } from 'vue';
  import { caseIfGenerator } from '../models/bpmnExclusive';
  import { GctFlowNode } from '../../../types';
  import NodeBranchEntrySvg from '../../../comps/NodeBranchEntrySvg.vue';
  import NodeBranchExitSvg from '../../../comps/NodeBranchExitSvg.vue';
  import { FlowNodeInstStatus } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnInclusiveS;
  }>();

  const { onNodeClick, nodeSelectedId, setFlowSelected, isReadonly, nodeInstStatusMap } =
    useGctFlow();

  const i18nAddTitle = computed(() => $t('sys.add'));

  const i18nDeleteTitle = computed(() => $t('sys.delete'));

  const isInclusiveNode = computed(() => {
    return props.node.type === BpmnNodeTypeEnum.BpmnInclusiveS;
  });

  const isPrevBpmnJudge = computed(() => {
    return props.prev?.type === BpmnNodeTypeEnum.BpmnJudge;
  });

  // const nodeInstFinished = computed(
  //   () => nodeInstStatusMap.value[props.node.id]?.status === 'finished',
  // );

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
    if (node.children.slice(-1)[0].id === flowId) {
      setFlowSelected();
    } else {
      setFlowSelected(flowId);
    }
  };
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__exclusive {
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

    &__case-card {
      --color: var(--node-color);
      width: 212px;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      position: relative;

      &--title {
        color: var(--color);
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
