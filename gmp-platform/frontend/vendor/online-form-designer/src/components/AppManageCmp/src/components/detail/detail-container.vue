<template>
  <div class="detail-container">
    <a-tabs
      v-model:activeKey="tabActiveKey"
      class="detail-container-tabs"
      :destroyInactiveTabPane="true"
      type="card"
    >
      <a-tab-pane v-for="tab in AppDetailTabsMenuOptions" :key="tab.id" :tab="tab.title">
        <component
          :is="components[tab.id]"
          :pid="pid"
          :tenantId="tenantId"
          :tabActiveKey="tabActiveKey"
          :detail="detail"
          :platformType="platformType"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts" name="detail-container">
  import { ref, computed } from 'vue';
  import OperationLog from './operation-log.vue';
  import MemberList from './member-list.vue';
  import DeploymentLog from './deployment-log.vue';
  import AppVersion from './app-version.vue';
  import License from './license.vue';
  import AppInfo from './app-info.vue';
  import { AppDetailTabEnum, PlatformEnum, SourceTypeEnum } from '../../constant/interface';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface Props {
    /** 应用id */
    pid: string;
    /** 租户id */
    tenantId: string;
    /** 应用详情信息 */
    detail: AppResponse;
    platformType: PlatformEnum;
    isOnlyBI?: boolean;
  }

  const props = defineProps<Props>();

  const { t } = useI18n();

  const AppDetailTabsMenuOptions = computed(() => {
    let tabMenu = [
      {
        id: AppDetailTabEnum.AppInfo,
        title: t('sys.developer.appCenter.appInfo'),
      },
      {
        id: AppDetailTabEnum.MemberList,
        title: t('sys.developer.appCenter.memberList'),
      },
      {
        id: AppDetailTabEnum.AppVersion,
        title:
          props.detail.sourceType === SourceTypeEnum.IMPORT
            ? t('sys.app.branch.index')
            : t('sys.app.version.index'),
      },
      {
        id: AppDetailTabEnum.DeploymentLog,
        title: t('sys.developer.appCenter.deploymentLog'),
      },
    ];
    if (props?.detail?.type === 'BI') {
      if (props.isOnlyBI) {
        return [
          {
            id: AppDetailTabEnum.AppInfo,
            title: t('sys.developer.appCenter.appInfo'),
          },
        ];
      }
      return [
        {
          id: AppDetailTabEnum.AppInfo,
          title: t('sys.developer.appCenter.appInfo'),
        },
        {
          id: AppDetailTabEnum.MemberList,
          title: t('sys.developer.appCenter.memberList'),
        },
      ];
    }
    if (!props.detail.suiteKey) {
      return tabMenu;
    }
    // else if (props.detail.suiteKey === 'eDHR') {
    //   return [
    //     {
    //       id: AppDetailTabEnum.AppInfo,
    //       title: t('sys.developer.appCenter.appInfo'),
    //     },
    //     {
    //       id: AppDetailTabEnum.License,
    //       title: t('sys.license.info'),
    //     },
    //   ];
    // }
    else {
      return [
        ...tabMenu,
        {
          id: AppDetailTabEnum.License,
          title: t('sys.license.info'),
        },
      ];
    }
  });

  const components = {
    [AppDetailTabEnum.AppInfo]: AppInfo,
    [AppDetailTabEnum.MemberList]: MemberList,
    [AppDetailTabEnum.DeploymentLog]: DeploymentLog,
    [AppDetailTabEnum.OperationLog]: OperationLog,
    [AppDetailTabEnum.AppVersion]: AppVersion,
    [AppDetailTabEnum.License]: License,
  };

  const tabActiveKey = ref<AppDetailTabEnum>(AppDetailTabEnum.AppInfo);
</script>
<style lang="less" scoped>
  .detail-container {
    position: relative;
    background-color: #fff;
    border-radius: 2px;
    height: 100%;
    padding: 0 20px;
  }
</style>
<style lang="less">
  .detail-container-tabs {
    overflow: hidden;
    height: 100%;
    .ant-tabs-nav {
      margin-bottom: 0;
      .ant-tabs-nav-wrap {
        .ant-tabs-tab {
          margin-left: 0 !important;
          border-left: 1px solid #f0f0f0;

          & + .ant-tabs-tab {
            border-left: none;
          }
        }
      }
    }
    .ant-tabs-content {
      border: 1px solid #f0f0f0;
      border-top: none;
      overflow: hidden;
      height: 100%;
    }
  }
</style>
