<template>
  <basic-page-render>
    <div class="audit-center-wrapper">
      <a-tabs v-model:activeKey="activeTabKey" class="audit-center-tabs">
        <a-tab-pane v-for="tab in tabList.filter((n) => n.ifShow)" :key="tab.key" :tab="tab.name">
          <component :is="tab.component" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
  import ControlTab from '/@web-render/views/edhr-application/render/approval-doc-task/index.vue';
  import ChangeTab from '/@web-render/views/edhr-application/render/change-task/index.vue';
  import CheckTab from '/@web-render/views/medpro-application/render/check-task/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { businessSetting } = useBusinessSetting();
  const { t } = useI18n();

  const tabList = computed(() => {
    console.log(businessSetting)
    return [
      {
        key: 'check',
        name: t('表单审核'),
        component: CheckTab,
        ifShow: true,
      },
      {
        key: 'tmpl',
        name: t('模板审核'),
        component: ControlTab,
        ifShow: !!businessSetting?.enableDocControl,
      },
      {
        key: 'change',
        name: t('变更审核'),
        component: ChangeTab,
        ifShow: true,
      },
    ];
  });

  const activeTabKey = ref('check');
</script>

<style lang="less">
  .audit-center-wrapper {
    height: 100%;
    overflow: hidden;

    .ant-tabs.audit-center-tabs {
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
