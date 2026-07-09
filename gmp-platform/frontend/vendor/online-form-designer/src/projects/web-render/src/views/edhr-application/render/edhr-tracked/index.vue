<template>
  <basic-page-render>
    <div class="edhr-tracked-wrapper">
      <a-tabs v-model:activeKey="activeKey" class="edhr-tracked-tabs">
        <a-tab-pane key="1" :tab="t('sys.webRender.edhrApplication.forwardTrace')">
          <Trace :reverse="false" />
        </a-tab-pane>
        <a-tab-pane
          key="2"
          :tab="t('sys.webRender.edhrApplication.reverseTrace')"
          v-if="edhrTrackedUsePerms.Reverse"
        >
          <Trace :reverse="true" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Trace from './trace.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';

  const { t } = useI18n();

  const activeKey = ref('1');

  const edhrTrackedUsePerms = usePagePermissions('edhr-tracked');
</script>

<style lang="less">
  .edhr-tracked-wrapper {
    display: flex;
    height: 100%;
    overflow: hidden;

    .ant-tabs.edhr-tracked-tabs {
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
