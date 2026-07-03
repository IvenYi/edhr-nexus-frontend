<template>
  <div class="absolute top-0px -right-20px">
    <div
      v-if="nodeInst.statusMsg === FlowNodeInstStatus.COMPLETED"
      class="h-16px w-16px rounded-[50%] text-white text-12px ks-row-center-middle"
      :class="'task-node-status__bg--' + nodeInst.statusMsg"
    >
      <check-outlined />
      <!-- <info-outlined v-if="nodeInst.statusMsg === FlowNodeInstStatus.RUNNING" /> -->
    </div>
    <i
      v-if="nodeInst.statusMsg === FlowNodeInstStatus.RUNNING"
      class="iconfont icon-jinhangzhongw text-[#3168ec] lh-1"
    ></i>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { IGctBpmnNode } from '../types';
  import { FlowNodeInstStatus } from '../../../enums';
  import { useGctFlow } from '../../../hooks/useGctFlow';

  const props = defineProps<{
    node: IGctBpmnNode;
  }>();

  const { nodeInstStatusMap } = useGctFlow();

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
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
