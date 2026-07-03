<template>
  <a-popover v-if="nodeInst" placement="rightTop" overlayClassName="task-node-status__popover">
    <template #content>
      <div class="rounded-8px overflow-hidden" :style="{ width: `${width ?? 263}px` }">
        <div
          class="header px12px py8px bg-[#FAFAFA] border-b-[1px] border-b-[#F0F0F0] ks-row-middle flex-nowrap"
        >
          <div class="ell ks-col text-[#212528] ks-row">
            <div class="ell" :title="node.data?.name">{{ node.data?.name }}</div>
            <div v-show="node.type === BpmnNodeTypeEnum.BpmnApproval">
              （{{ $t(`sys.process.processApproveWay.${node.data?.approveWay}`) }}）
            </div>
          </div>
          <div class="node-status text-[12px]" :class="`node-status-${nodeInst.statusMsg}`">
            {{ $t(`sys.process.flowNodeInstStatus.${nodeInst.statusMsg}`) }}
          </div>
        </div>
        <component :is="nodeMap[node.type]" :data="nodeInst" />
      </div>
    </template>
    <slot></slot>
  </a-popover>
  <slot v-else></slot>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { IGctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import { BpmnNodeTypeEnum } from '../enums';
  import BpmnApproval from './node-popover-content/BpmnApproval.vue';
  import BpmnMessage from './node-popover-content/BpmnMessage.vue';
  import BpmnJs from './node-popover-content/BpmnJs.vue';

  const props = defineProps<{
    node: IGctBpmnNode;
    width?: number;
  }>();

  const { nodeInstStatusMap } = useGctFlow();

  const nodeMap = {
    [BpmnNodeTypeEnum.BpmnApproval]: BpmnApproval,
    [BpmnNodeTypeEnum.BpmnMessage]: BpmnMessage,
    [BpmnNodeTypeEnum.BpmnJs]: BpmnJs,
  };

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
    return inst;
  });
</script>

<style lang="less">
  .task-node-status {
    &__popover {
      .ant-popover-inner-content {
        padding: 0;
      }
    }
    &__content {
      position: relative;
    }
  }

  .node-status {
    color: #8f8f8f;
    &::before {
      width: 4px;
      height: 4px;
      content: ' ';
      display: inline-block;
      border-radius: 50%;
      margin-right: 4px;
      background-color: #8f8f8f;
      vertical-align: middle;
    }
    &-RUNNING {
      &::before {
        background-color: #3168ec;
      }
      color: #3168ec;
    }
    &-COMPLETED {
      color: #309c41;
    }
  }
</style>
