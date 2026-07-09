<template>
  <basic-page-render>
    <div class="process-intervention-wrapper">
      <a-tabs v-model:activeKey="activeTabKey" class="process-intervention-tabs">
        <a-tab-pane v-for="tab in tabList" :key="tab.key" :tab="tab.name">
          <component :is="tab.component" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { useDocumentTask } from '/@web-render/views/edhr-application/render/approval-process-intervention/useDocumentTask';

  const { activeTabKey, tabList } = useDocumentTask();
</script>

<style lang="less">
  .process-intervention-wrapper {
    display: flex;
    height: 100%;
    overflow: hidden;

    .ant-tabs.process-intervention-tabs {
      width: 100%;
      height: 100%;
      .ant-tabs-nav {
        margin: 0;
        &::before {
          border-color: #e0e3ea;
        }
        .ant-tabs-nav-wrap {
          margin-left: 12px;
          .ant-tabs-tab {
            padding: 12px 16px;
            line-height: 20px;

            & + .ant-tabs-tab {
              margin: 0 0 0 24px;
            }
          }
        }
      }

      .ant-tabs-content {
        height: 100%;
      }
    }
  }
</style>
