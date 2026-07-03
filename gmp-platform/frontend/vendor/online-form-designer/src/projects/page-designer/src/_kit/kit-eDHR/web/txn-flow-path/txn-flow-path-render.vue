<template>
  <div class="ks-column justify-center">
    <TxnDesignFlowPath v-if="processId" :onlyFlow="true" type="edhr" :id="processId" />
    <BizBpmnRuntime v-else-if="instId" :txnId="txnId" :instId="instId" />
    <a-empty v-else :image="NoTxn" />
  </div>
</template>

<script setup lang="ts" name="gct-biz-flow-path-render">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { type ITxnFlowPath } from './schema';
  import BizBpmnRuntime from '/@/components/BpmnRuntime/biz/index.vue';
  import TxnDesignFlowPath from '/@page-designer/_kit/kit-medpro/web/biz-process/components/process-design/index.vue';
  import NoTxn from '/@/assets/svg/no-txn.svg';
  import { getPageEvent } from '../../../../components/widgets/hooks/hooks';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const props = defineProps<{ widget: ITxnFlowPath }>();

  const Event = getPageEvent();
  const instId = ref();
  const txnId = ref();
  const processId = ref();

  const { mitt } = useMitt();

  const setValue = (params: { txnId?: string; instId?: string; processId?: string } = {}) => {
    // txnId?: string; // 事务实例 ID
    // instId?: string; // 流程实例 id
    // processId?: string; // 流程 id
    instId.value = params.instId;
    txnId.value = params.txnId;
    processId.value = params.processId;
    console.log('setValue', params);
  };

  onMounted(() => {
    mitt.on('TXN_NODE_POPOVER_CLICK', onNodePopoverClick);
  });

  onUnmounted(() => {
    mitt.off('TXN_NODE_POPOVER_CLICK', onNodePopoverClick);
  });

  function onNodePopoverClick(data: any) {
    console.log('txn-popover-click-----', data);
    Event.runEventByName('onNodePopoverClick', props.widget.events, data);
  }

  defineExpose({
    setValue,
  });
</script>

<style scoped lang="less">
  :deep(.ant-empty-description) {
    color: #999999 !important;
  }
</style>
