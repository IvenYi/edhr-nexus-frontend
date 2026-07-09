<template>
  <div class="biz-approval">
    <template v-if="nodeInst.approveStatus === FlowNodeInstStatus.PENDING">
      <component :is="customRenderPopover" />
    </template>
    <div
      v-else
      class="absolute right-12px top-10px"
      :class="'task-node-status__color--' + nodeInst.approveStatus"
      >{{ i18nTitle }}</div
    >
    <template v-if="nodeInst.approveStatus === FlowNodeInstStatus.COMPLETED">
      <div v-if="!Array.isArray(userNodeInstRunning) && userNodeInstRunning">
        <div v-for="item in userNodeInstRunning.rangeUser" :key="item.key">{{ item.label }}</div>
        <div class="mt8px">
          <pre style="width: 100%; white-space: pre-wrap; word-break: break-all">{{
            userNodeInstRunning.message
          }}</pre>
        </div>
      </div>
      <template v-else>
        <div class="flex items-center">
          <img
            class="h-32px w-32px rounded-[50%] mr-8px"
            :src="`/minio/${userNodeInstCompleted.avatar}`"
            alt=""
            srcset=""
          />
          <div class="text-18px mt-2px">{{ userNodeInstCompleted.createUserName }}</div>
        </div>
        <div class="mt-12px">
          <div class="text-12px" v-if="userNodeInstCompleted.opinion">{{
            userNodeInstCompleted.opinion
          }}</div>
          <div class="text-12px">{{ userNodeInstCompleted.createTime }}</div>
        </div>
      </template>
    </template>
    <template v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.RUNNING">
      <div v-for="item in userNodeInstRunning" :key="item.key">{{ item.label }}</div>
    </template>
    <template v-else-if="nodeInst.approveStatus === FlowNodeInstStatus.EXCEPTION">
      <div>无人员组织</div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { FlowNodeInstStatus } from '@gct/flow/src/enums';
  import { GctBpmnNode } from '../../types';
  import { useGctFlow } from '@gct/flow/src/hooks/useGctFlow';

  const props = defineProps<{
    nodeInst: any;
    node: GctBpmnNode.BpmnTransaction;
  }>();

  const { nodeInstStatusMap } = useGctFlow();

  /** 自定义气泡绘制 */
  const customRenderPopover = computed(() => {
    return nodeInstStatusMap.value[props.node.id]?.renderPopover;
  });

  const userNodeInstCompleted = computed(() => {
    const data = props.nodeInst.processPathUsers;
    return data ? data[0] : null;
  });

  const i18nTitle = computed(() => {
    return $t(`sys.bpmn.flowNodeInstStatus.${props.nodeInst.approveStatus}`);
  });

  const userNodeInstRunning = computed(() => {
    const data = props.nodeInst.rangeUserExchange;
    if (data) {
      const result = JSON.parse(data);
      (Array.isArray(result) ? result : result.rangeUser).forEach((item) => {
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
