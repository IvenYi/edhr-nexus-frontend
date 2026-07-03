<template>
  <basic-page :use-bg-color="true">
    <div class="org-seat-header">
      <h2 class="text-16px lh-[24px] color-[#000] font-600 mb-4px">
        {{ t('sys.menu.seatManagement') }}
      </h2>
      <p class="text-12px lh-[18px] color-[#797A7D] mb-0">
        {{ t('sys.org.orgSeatInfo') }}
      </p>
    </div>
    <div class="org-seat-content">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.org.platSeat')">
          <seat-container type="platform" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.org.suiteSeat')">
          <seat-container type="suite" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>
<script setup lang="ts" name="user-seat">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SeatContainer from './components/seat-container.vue';

  const { t } = useI18n();

  const activeKey = ref('1');
</script>
<style lang="less" scoped>
  .org-seat-header {
    padding: 24px;
    border-bottom: 1px solid #e0e3ea;
  }
  .org-seat-content {
    padding: 24px;
  }
  :deep(.ant-tabs-nav) {
    margin: 0;
  }
</style>
