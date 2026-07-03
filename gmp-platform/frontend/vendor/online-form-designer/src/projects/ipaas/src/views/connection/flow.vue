<template>
  <basic-page id="connection-flow-page">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('sys.integration.flow')">
        <FlowEntry :userActions="userActions" />
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.integration.callLog')">
        <div class="h-full p-20px">
          <FlowCallLog tab-key="2" :active-key="activeKey" :userActions="userActions" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref, computed } from 'vue';
  import FlowEntry from './modules/flow-entry/index.vue';
  import FlowCallLog from './modules/flow-call-log.vue';
  import { getPermissionByKey } from '/@/projects/web-render/src/utils/UserappPermissions';

  const activeKey = ref<'1' | '2' | '3'>('1');
  const { t } = useI18n();

  const isIpaasFlowPage = computed(() => {
    return window.location.href.includes('ipaas-flow');
  }) 

  const userActions = computed(() => {
    return {
      AddCate: getPermission('AddCate'),
      RenameCate: getPermission('RenameCate'),
      DeleteCate: getPermission('DeleteCate'),
      AddIpaas: getPermission('AddIpaas'),
      Import: getPermission('Import'),
      Export: getPermission('Export'),
      Edit: getPermission('Edit'),
      Design: getPermission('Design'),
      Delete: getPermission('Delete'),
      Recall: getPermission('Recall'),
    }
  })

  function getPermission(key) {
    if (!isIpaasFlowPage.value) return true;
    const page = 'ipaas-flow';
    return !!getPermissionByKey(page, key);
  }
</script>

<style lang="less" scoped>
  .ant-tabs {
    height: 100%;

    :deep(> .ant-tabs-content-holder > .ant-tabs-content) {
      height: 100%;
    }

    :deep(> .ant-tabs-nav .ant-tabs-tab:first-child) {
      margin-left: 20px;
    }

    :deep(> .ant-tabs-nav) {
      margin: 0;
    }
  }

  #connection-flow-page {
    :deep(.basic-page__body) {
      position: relative;
    }
  }
</style>
