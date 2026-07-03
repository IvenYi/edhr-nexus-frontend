<template>
  <div
    class="flex flex-col items-center"
    :style="{
      '--node-color': isParallelNode ? '#FF980E' : '#088c49',
    }"
  >
    <div class="gf__node">
      <NodeTools :node="node" />
      <NodeTooltips :node="node" />
      <div
        class="gct-bpmn__exclusive"
        :class="{
          selected: nodeSelectedId === node.id,
          'inst-mode': isInstMode,
          'is-pending': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.PENDING,
        }"
        :style="{
          '--color':
            FlowNodeInstStatusColor[nodeInstStatusMap[node.id]?.status] ||
            (isParallelNode ? '#FF980E' : '#088c49'),
        }"
        @click="onClick(node)"
      >
        <div>
          <i
            class="iconfont lh-[1em]"
            :class="[isParallelNode ? 'icon-binghangfenzhi' : 'icon-fenzhi']"
          ></i>
        </div>
        <div :title="i18nTitle" class="flex-1 ell">
          {{ $t(getI18nName(node.data)) || node.data?.name }}
        </div>
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

        <div
          class="gct-bpmn__case-card"
          :class="{
            'inst-mode': isInstMode,
            'is-pending': nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.PENDING,
          }"
          :style="{
            '--case-color':
              FlowNodeInstStatusColor[nodeInstStatusMap[item.id]?.status] || '#e8ebf0',
          }"
          @click="onCaseClick(node, item.id)"
        >
          <NodeTooltips :node="item" />
          <template v-if="index + 1 === node.children.length">
            <div
              class="gct-bpmn__case-card--title"
              :class="{ 'inst-mode': isInstMode }"
              :style="{
                '--color': isInstMode
                  ? FlowNodeInstStatusColor[nodeInstStatusMap[item.id]?.status] || '#666666'
                  : isParallelNode
                  ? '#FF980E'
                  : '#088c49',
              }"
              >{{ $t('sys.process.else') }}</div
            >
            <div class="gct-bpmn__case-card--description flex items-center">
              <div class="color-[#797A7D] ell w-full">
                当<span class="color-[#252525] ml-4px mr-4px">上述条件都不满足</span>时
              </div>
            </div>
          </template>
          <template v-else>
            <div
              class="gct-bpmn__case-card--title"
              :style="{
                '--color': isInstMode
                  ? FlowNodeInstStatusColor[nodeInstStatusMap[item.id]?.status] || '#666666'
                  : isParallelNode
                  ? '#FF980E'
                  : '#088c49',
              }"
            >
              {{ $t('sys.process.condition') }}{{ index + 1 }}
            </div>
            <div class="gct-bpmn__case-card--description flex items-center">
              <!-- <CaseTranslate :data="item.caseCfg?.json" /> -->
              <div class="color-[#252525] ell w-full" :title="item.caseCfg?.name">
                {{ $t(getI18nName(item.caseCfg)) || item.caseCfg?.name }}
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
          <LineActions
            v-if="!isReadonly"
            :list="item.children"
            :is-flow-start="true"
            :parent="node"
            :flow="item"
          />
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
  import NodeBranchEntrySvg from '../../../comps/NodeBranchEntrySvg.vue';
  import NodeBranchExitSvg from '../../../comps/NodeBranchExitSvg.vue';
  import { computed } from 'vue';
  import { caseIfGenerator } from '../models/bpmnExclusive';
  import { GctFlowNode } from '../../../types';
  import { useGctPaasBpmn } from '../hooks/useGctBpmn';
  import { FlowNodeInstStatus, FlowNodeInstStatusColor } from '../../../enums';
  import { isFinished } from '../../../utils/svg-def';
  // import CaseTranslate from '../comps/case-translate.vue';

  const props = defineProps<{
    prev?: IGctBpmnNode;
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnParallel;
  }>();

  const {
    onNodeClick,
    nodeSelectedId,
    setFlowSelected,
    isReadonly,
    isInstMode,
    nodeInstStatusMap,
  } = useGctFlow();
  const { getI18nName } = useGctPaasBpmn();

  const i18nTitle = computed(() => $t(getI18nName(props?.node.data)) || props?.node.data?.name);

  const i18nAddTitle = computed(() => $t('sys.add'));

  const i18nDeleteTitle = computed(() => $t('sys.delete'));

  const isParallelNode = computed(() => {
    return props.node.type === BpmnNodeTypeEnum.BpmnParallel;
  });

  const handleCaseAdd = (index: number) => {
    const newCase = caseIfGenerator(props.node.children.length);
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 46px;
      padding: 0 16px;
      // --color: var(--node-color);
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
        background-color: rgba(from var(--color) r g b / 10%);
        color: var(--color);
      }
    }

    &__case-card {
      display: flex;
      position: relative;
      flex-direction: column;
      // --color: var(--node-color);
      width: 212px;
      padding: 12px 16px;
      border: 1px solid var(--case-color);
      border-radius: 4px;
      background-color: #fff;

      &.inst-mode {
        &.is-pending {
          background-color: #fafafa;
        }
      }

      &--title {
        flex: none;
        color: var(--color);
      }

      &--description {
        height: 32px;
        margin-top: 4px;
        padding: 2px 8px;
        border-radius: 2px;
        background-color: #f7f8fa;
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    color: white;
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
