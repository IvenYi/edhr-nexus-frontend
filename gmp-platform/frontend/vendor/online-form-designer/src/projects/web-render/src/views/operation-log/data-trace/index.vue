<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="$t('sys.systemModule')">
        <data-trace-list :isFront="true" appId="USER_DEFINED" />
      </a-tab-pane>
      <a-tab-pane key="2" :tab="$t('sys.appModel')">
        <model-trace-list :isFront="true" appId="APPFRONT" />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import DataTraceList from './components/data-trace-list.vue';
  import ModelTraceList from './components/model-trace-list.vue';

  const activeKey = ref('1');
</script>
<style lang="less" scoped>
  :deep(.ant-tabs > .ant-tabs-nav .ant-tabs-nav-wrap) {
    padding-left: 20px;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }
</style>
