<template>
  <!-- <a-popover v-if="nodeInst" placement="rightTop" overlayClassName="task-node-status__popover">
    <template #content>
      <div class="task-node-status__content ks-row">
        <div class="ks-col task-node-status__content-message">
          <template v-if="nodeInst.approveStatus === FlowNodeInstStatus.EXCEPTION">
            {{ nodeInst.message }}
          </template>
        </div>
        <div
          class="pl4px w45px"
          :class="'text-right task-node-status__color--' + nodeInst.approveStatus"
          >{{ $t(`sys.bpmn.flowNodeInstStatus.${nodeInst.approveStatus}`) }}</div
        >
      </div>
    </template>
  </a-popover> -->
  <div v-if="nodeInst" class="absolute -right-20px rounded-[50%]">
    <div
      class="rounded-[50%] h-16px w-16px text-white text-12px ks-row-center-middle lh-16px"
      :class="'task-node-status__bg--' + nodeInst.approveStatus"
    >
      <check-outlined v-if="nodeInst.approveStatus === FlowNodeInstStatus.COMPLETED" />
      <ellipsis-outlined v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.RUNNING" />
      <i
        v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.EXCEPTION"
        class="iconfont icon-jinggao text-#F54547 text-18px!"
      ></i>
      <!-- <ellipsis-outlined v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.EXCEPTION" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '../types';
  import { FlowNodeInstStatus } from '../../../enums';
  import { useGctFlow } from '../../../hooks/useGctFlow';

  const props = defineProps<{
    node: GctBpmnNode.BpmnConnector;
  }>();

  const { nodeInstStatusMap } = useGctFlow();

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
    return inst;
  });

  const userNodeInstCompleted = computed(() => {
    const data = nodeInst.value.processPathUsers;
    return data ? data[0] : null;
  });

  const userNodeInstRunning = computed(() => {
    const data = nodeInst.value.rangeUserExchange;
    if (data) {
      const result = JSON.parse(data);
      result.forEach((item) => {
        if (item.key.startsWith('DYN_')) {
          const [type] = item.key.split(':');
          item.label = $t(`sys.bpmn.dynamicUser.${type}`) + `(${item.value})`;
        } else {
          item.label = item.value;
        }
      });
      return result;
    }
    return null;
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
      white-space: nowrap;

      &-message {
        word-break: break-all;
        white-space: pre-wrap;
      }
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
    &__bg--EXCEPTION {
      background-color: transparent;
    }
    &__color--EXCEPTION {
      // color: var(--ant-warning-color);
    }
  }
</style>
