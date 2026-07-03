<template>
  <div class="ks-column justify-center txn-flow-path">
    <TxnDesignFlowPath
      v-if="processId"
      :onlyFlow="true"
      :type="BizFlowModule.Edhr"
      :id="processId"
    />
    <BizBpmnRuntime v-else-if="instId" :txnId="txnId" :instId="instId" />
    <a-empty v-else :image="NoTxn" />
  </div>
</template>

<script setup lang="ts" name="biz-flow-path">
  import { onMounted, onUnmounted } from 'vue';
  import BizBpmnRuntime from '/@/components/BpmnRuntime/biz/index.vue';
  import TxnDesignFlowPath from '/@page-designer/_kit/kit-medpro/web/biz-process/components/process-design/index.vue';
  import NoTxn from '/@/assets/svg/no-txn.svg';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { BizFlowModule } from '@gct/flow/src/plugins/biz-bpmn/enums';

  defineProps<{
    processId?: string;
    instId?: string;
    txnId: string;
  }>();

  const { mitt } = useMitt();

  onMounted(() => {
    mitt.on('TXN_NODE_POPOVER_CLICK', onNodePopoverClick);
  });

  onUnmounted(() => {
    mitt.off('TXN_NODE_POPOVER_CLICK', onNodePopoverClick);
  });

  function onNodePopoverClick(data: any) {
    console.log('txn-popover-click-----', data);
  }

  defineExpose({});
</script>

<style scoped lang="less">
  :deep(.ant-empty-description) {
    color: #999999 !important;
  }
</style>
