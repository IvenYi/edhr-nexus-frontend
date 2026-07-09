<template>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane :key="TabEnum.Field" :tab="t('sys.model.dataField')">
      <recycle-bin-fields />
    </a-tab-pane>
    <a-tab-pane :key="TabEnum.Model" :tab="t('sys.entityModel')">
      <recycle-bin-models />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import RecycleBinModels from './recycle-bin-models.vue';
  import RecycleBinFields from './recycle-bin-fields.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  enum TabEnum {
    Model,
    Field,
  }
  const activeTab = ref<TabEnum>(TabEnum.Field);
  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .ant-tabs {
    height: 100%;

    :deep(.ant-tabs-nav) {
      padding-left: 16px;
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }
    :deep(.ant-tabs-tabpane) {
      padding: 0 16px 16px 16px;
    }
  }
</style>
