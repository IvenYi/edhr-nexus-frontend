<template>
  <div class="h-full">
    <DataCollectionOnlineFormOperator
      v-if="selfId"
      class="paas-si-form-builder-container h-full flex"
      :selfId="selfId"
      :isViewPage="isViewPage"
      :isDataCollect="isDataCollect"
      :paramExtraProps="{ _gct_useDynRowHeight_: isViewPage }"
      :keep="keep"
      :showRightBtns="isDataCollect ? ['Submit', 'Save', 'Cancel', 'Approve'] : undefined"
      @btn-click-callback="handleAction"
    />
    <div v-else>No Data</div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import DataCollectionOnlineFormOperator from '../render/operator/data-collection-online-form-opeator.vue';
  // import OnlineFormOperator from '../render/operator/online-form-operator.vue';

  const route = useRoute();
  // selfId: record.ofInstanceId, 审核
  // selfId: record.id, 填报
  // VhUU8FEgxgUPlDaX
  const selfId = ref<string>(route.query.ofInstanceId as string);
  const isViewPage = ref<boolean>(route.query.isViewPage === 'true');
  const keep = ref<boolean>(route.query.keep === 'true');
  const isDataCollect = ref<boolean>(route.query.isDataCollect === 'true');

  const tenantId = ref<string | null>(route.query.tenantId);

  if (tenantId.value) {
    sessionStorage.setItem('customRequestHeader', JSON.stringify({ 'tenant-id': tenantId.value }));
  }

  function handleAction(btn) {
    window.parent.postMessage(
      { type: 'parent', cmd: 'TMP_MOBILE_FORM_BUTTON_ACTION', payload: { btnType: btn.type } },
      '*',
    );
  }
</script>

<style lang="less" scoped></style>
