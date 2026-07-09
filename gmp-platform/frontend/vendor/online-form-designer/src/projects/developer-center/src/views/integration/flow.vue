<template>
  <basic-page>
    <a-tabs v-model:activeKey="activeTab" class="h-full tabs-wrap">
      <a-tab-pane key="1" :tab="t('sys.integration.flow')">
        <FlowList />
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.integration.connectedAccount')" force-render>
        <ConnectionAccount v-if="activeTab === '2'" />
      </a-tab-pane>
      <a-tab-pane key="3" :tab="t('sys.integration.connectedLog')">
        <ConnectionLog v-if="activeTab === '3'" />
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref } from 'vue';

  import FlowList from './components/flowComp/flow-list.vue';
  import ConnectionAccount from './components/flowComp/connection-account.vue';
  import ConnectionLog from './components/flowComp/connection-log.vue';

  const activeTab = ref<'1' | '2' | '3'>('1');
  const { t } = useI18n();
</script>

<style lang="less" scoped>
  :deep(.tabs-wrap) {
    border: 1px solid @gct-modal-border-color;
    border-radius: 4px;
  }
  :deep(.tabs-wrap.ant-tabs-top > .ant-tabs-nav) {
    margin-bottom: 0;

    &:before {
      border-color: @gct-modal-border-color;
    }
    .ant-tabs-nav-wrap {
      padding-left: 16px;

      .ant-tabs-tab {
        font-size: 16px;
        padding: 16px;
        & + .ant-tabs-tab {
          margin-left: 24px;
        }
      }
    }
  }
  :deep(.tabs-wrap .ant-tabs-content) {
    height: 100%;
  }
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
</style>
