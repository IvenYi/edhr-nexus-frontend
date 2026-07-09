<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeKey" animated>
      <a-tab-pane :key="ApiManageEnum.API_GROUP" :tab="t('sys.integration.apiGrouping')">
        <api-group v-show="!isApiDetail" ref="ApiGroupRef" @goApiDetial="goApiDetial" />
        <api-group-detail
          v-if="isApiDetail"
          :appInfo="appInfo"
          ref="ApiGroupDetailRef"
          @goBack="goBack"
        />
      </a-tab-pane>
      <a-tab-pane :key="ApiManageEnum.KEY_MANAGEMENT" :tab="t('sys.integration.keyManagement')">
        <key-management ref="KeyManagementRef" />
      </a-tab-pane>
      <a-tab-pane :key="ApiManageEnum.CALL_LOG" :tab="t('sys.integration.callLog')">
        <call-log ref="CallLogRef" />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script setup lang="ts" name="api-management">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ApiManageEnum } from './enum';
  import ApiGroup from './components/api-group.vue';
  import ApiGroupDetail from './components/api-group-detail.vue';
  import KeyManagement from './components/key-management.vue';
  import CallLog from './components/call-log.vue';

  const { t } = useI18n();
  const activeKey = ref('API_GROUP');
  const ApiGroupRef = ref();
  const KeyManagementRef = ref();
  const CallLogRef = ref();
  const isApiDetail = ref(false);
  const appInfo = ref();

  const goApiDetial = ({ id, name, appTag }) => {
    isApiDetail.value = true;
    appInfo.value = { id, name, appTag };
  };

  const goBack = () => {
    isApiDetail.value = false;
  };
</script>

<style lang="less" scoped>
  :deep(.ant-tabs) {
    .ant-tabs-nav .ant-tabs-tab:first-child {
      margin-left: 20px;
    }
    height: 100%;
    .ant-tabs-content {
      height: 100%;
      .ant-tabs-tabpane {
        padding: 0 16px;
      }
    }
  }
</style>
