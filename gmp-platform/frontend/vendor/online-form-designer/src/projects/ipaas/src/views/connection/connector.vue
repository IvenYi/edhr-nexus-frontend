<template>
  <basic-page>
    <ConnectorDesignerWrapper>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.ipaas.connector')">
          <div class="h-full pr-20px">
            <ConnectionSetting :userActions="userActions" />
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.integration.callLog')">
          <div class="h-full p-20px">
            <ConnectionLog tab-key="2" :active-key="activeKey" :userActions="userActions" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </ConnectorDesignerWrapper>
  </basic-page>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import ConnectionSetting from './modules/connector-setting.vue';
  import ConnectionLog from './modules/connector-log.vue';
  import { ConnectorDesignerWrapper } from './modules/connector-designer';
  import { ref, computed } from 'vue';
  import { getPermissionByKey } from '/@/projects/web-render/src/utils/UserappPermissions';

  const { t } = useI18n();
  const activeKey = ref<'1' | '2'>('1');

  const isIpaasFlowPage = computed(() => {
    return window.location.href.includes('ipaas-connector');
  }) 

  const userActions = computed(() => {
    return {
      AddCate: getPermission('AddCate'),
      RenameCate: getPermission('RenameCate'),
      DeleteCate: getPermission('DeleteCate'),
      AddConnector: getPermission('AddConnector'),
      Import: getPermission('Import'),
      Export: getPermission('Export'),
      Config: getPermission('Config'),
      Edit: getPermission('Edit'),
      Delete: getPermission('Delete'),
      ClearLog: getPermission('ClearLog'),
    }
  })
  
  function getPermission(key) {
    if (!isIpaasFlowPage.value) return true;
    const page = 'ipaas-connector';
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
</style>
