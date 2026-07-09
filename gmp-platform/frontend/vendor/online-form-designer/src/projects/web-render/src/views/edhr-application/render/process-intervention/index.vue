<template>
  <basic-page-render>
    <div v-if="isShowControl" class="process-intervention-wrapper">
      <a-tabs v-model:activeKey="activeKey" class="process-intervention-tabs">
        <a-tab-pane key="1" tab="表单流程">
          <DocTab />
        </a-tab-pane>
        <a-tab-pane key="2" tab="审批流程">
          <ControlTab />
        </a-tab-pane>
      </a-tabs>
    </div>
    <DocTab v-else />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DocTab from './doc-tab.vue';
  import ControlTab from './control-tab/control-tab.vue';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

  const { t } = useI18n();

  const activeKey = ref('1');

  const { businessSetting } = useBusinessSetting();

  const isShowControl = computed(() => {
    return !!businessSetting.enableDocControl;
  });
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
