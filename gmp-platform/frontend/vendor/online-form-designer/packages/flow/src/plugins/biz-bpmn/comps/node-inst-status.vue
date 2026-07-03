<template>
  <div class="absolute top-0px -right-20px">
    <div
      v-if="nodeInst.status === FlowNodeInstStatus.COMPLETED"
      class="h-16px w-16px rounded-[50%] text-white text-12px ks-row-center-middle"
      :class="'task-node-status__bg--' + nodeInst.status"
    >
      <check-outlined />
      <!-- <info-outlined v-if="nodeInst.statusMsg === FlowNodeInstStatus.RUNNING" /> -->
    </div>
    <i
      v-if="nodeInst.status === FlowNodeInstStatus.RUNNING"
      class="iconfont icon-jinhangzhongw text-[#3168ec] lh-1"
    ></i>
    <i
      v-if="nodeInst.status === FlowNodeInstStatus.EXCEPTION"
      class="iconfont icon-jinggao text-#F54547 text-18px! top--4px relative"
    ></i>
    <i
      v-if="nodeInst.status === FlowNodeInstStatus.PENDING"
      class="iconfont icon-gengduo text-[#fff] lh-1 inline-block bg-[#eec65e] px2px py6px rounded-50% text-12px! relative top--3px"
    ></i>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import { FlowNodeInstStatus } from '@gct/flow/src/enums';
  import { IGctBpmnNode } from '../types';

  const props = defineProps<{
    node: IGctBpmnNode;
  }>();

  const bizFlowKey = inject('bizFlowKey') as string;
  const { nodeInstStatusMap } = useGctFlow(bizFlowKey);

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id];
    return inst || {};
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
      width: 240px;
      padding: 12px 10px 10px;
    }
    &__bg--COMPLETED {
      background-color: #309c41;
    }
    &__color--COMPLETED {
      color: #309c41;
    }
    &__bg--RUNNING {
      background-color: #3168ec;
    }
    &__color--RUNNING {
      color: #3168ec;
    }
  }
</style>
