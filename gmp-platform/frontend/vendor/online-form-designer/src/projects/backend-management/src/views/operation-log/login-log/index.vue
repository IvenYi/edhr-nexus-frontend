<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="企业后台">
        <LoginLogList platform="ENTERPRISE" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="租户后台">
        <TenantLog />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import LoginLogList from './components/login-log-list.vue';
  import TenantLog from './components/tenant-log.vue';

  const activeKey = ref('1');
</script>
<style lang="less" scoped>
  :deep(.ant-tabs > .ant-tabs-nav .ant-tabs-nav-wrap) {
    padding-left: 20px;
  }
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }
  :deep(.ant-tabs),
  :deep(.ant-tabs-content-holder),
  :deep(.ant-tabs-content) {
    height: 100%;
  }
</style>
