<template>
  <a-popover
    v-if="nodeInst"
    placement="rightTop"
    overlayClassName="task-node-status__popover"
    class="absolute -top-7px -right-7px rounded-[50%] p-3px"
    :overlay-style="{ zIndex: 9999 }"
  >
    <template #content>
      <div class="task-node-status__content">
        <component
          :is="componentMap[node?.type]"
          :nodeInst="nodeInst"
          :node="node"
          class="node-popover-comp-item"
        />
      </div>
    </template>
    <div>
      <div
        class="rounded-[50%] h-14px w-14px text-white text-12px ks-row-center-middle"
        :class="'task-node-status__bg--' + nodeInst.approveStatus"
      >
        <i
          class="iconfont icon-tijiao1 task-node-status__icon"
          v-if="nodeInst.approveStatus === FlowNodeInstStatus.COMPLETED"
        ></i>
        <i
          class="iconfont icon-gengduo task-node-status__icon"
          v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.RUNNING"
        ></i>
        <i
          class="iconfont icon-gengduo task-node-status__icon"
          v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.EXCEPTION"
        ></i>
        <i
          class="iconfont icon-gengduo task-node-status__icon"
          v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.PENDING"
        ></i>
      </div>
    </div>
  </a-popover>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { ProcessPathResponse } from '/@/apis/gct-apaas/model';
  import type { IGctBpmnNode } from '../types';
  import { FlowNodeInstStatus } from '../../../enums';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import { BpmnNodeTypeEnum } from '../enums';
  import componentMap from './node-inst-status-content';

  // import bpmnApproval from './node-inst-status-content/bpmnApproval.vue';
  // import bpmnTransaction from './node-inst-status-content/bpmnTransaction.vue';

  // const modules: any = import.meta.glob('./node-inst-status-content/*.vue');
  // const componentMap = Object.keys(modules).reduce((obj, path) => {
  //   const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
  //   obj[name] = defineAsyncComponent(modules[path]);
  //   return obj;
  // }, {});

  const props = defineProps<{
    node: IGctBpmnNode;
  }>();

  // const componentMap = {
  //   [BpmnNodeTypeEnum.BpmnApproval]: bpmnApproval,
  //   [BpmnNodeTypeEnum.BpmnTransaction]: bpmnTransaction,
  // };

  const defComponent = computed(() => {
    return componentMap[props.node.type];
  });

  const { nodeInstStatusMap } = useGctFlow();

  const nodeInst = computed<ProcessPathResponse | null>(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
    return inst;
  });

  console.log('nodeInst', props.node);
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
    &__bg--PENDING {
      background-color: #eec65e;
    }
    &__color--PENDING {
      color: #eec65e;
    }
    &__bg--EXCEPTION {
      background-color: var(--ant-warning-color);
    }
    &__color--EXCEPTION {
      color: var(--ant-warning-color);
    }
    &__icon {
      font-size: 12px;
      line-height: 1;
    }
  }
</style>
<style lang="scss">
  .node-popover-comp-item {
    & > .ks-row {
      & > div {
        &:first-child {
          color: #5a5f6b;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          white-space: nowrap;
        }

        &:last-child {
          color: #1a1d23;
          word-break: break-all;
        }
      }
    }

    .item-label {
      color: #5a5f6b;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }

    .item-value {
      color: #1a1d23;
      word-break: break-all;
    }
  }
</style>
