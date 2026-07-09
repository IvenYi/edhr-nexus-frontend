<template>
  <basic-page :use-bg-color="false">
    <div class="app-setting">
      <a-tabs v-model:activeKey="activeKey" v-if="hasBILicense">
        <a-tab-pane :key="AppTypeEnum.PRO" :tab="t(AppTypeI18nMap[AppTypeEnum.PRO])">
          <a-alert message="仅显示已发布的应用。" type="info" show-icon banner>
            <template #icon><InfoCircleOutlined /></template>
          </a-alert>
          <app-setting-panel :type="AppTypeEnum.PRO" :list="proApps" />
        </a-tab-pane>
        <a-tab-pane :key="AppTypeEnum.BI" :tab="t(AppTypeI18nMap[AppTypeEnum.BI])" force-render>
          <app-setting-panel :type="AppTypeEnum.BI" :list="biApps" />
        </a-tab-pane>
        <!-- <a-tab-pane :key="AppTypeEnum.MICRO" :tab="t(AppTypeI18nMap[AppTypeEnum.MICRO])">
      </a-tab-pane> -->
      </a-tabs>
      <app-setting-panel v-else :type="AppTypeEnum.PRO" :list="proApps" />
      <app-setting-detail ref="detailRef" :appId="appId" />
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { computed, ref, provide } from 'vue';
  import AppSettingPanel from '../app-setting/modules/app-setting-panel.vue';
  import { getAppPageListReleasedApp, getAppTenantApps } from '/@/apis/gct-platform/AppController';
  import type { AppResponse } from '/@/apis/gct-platform/model';
  import { AppTypeEnum, AppTypeI18nMap } from './types';
  import AppSettingDetail from '../app-setting/modules/app-setting-detail.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AppStatusEnum } from '/@/components/AppManageCmp/src/constant/interface';
  import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';

  const apps = ref<AppResponse[]>([]);
  const biApps = ref<AppResponse[]>([]);
  const proApps = computed(() => {
    return apps.value.filter((item) => item.type === AppTypeEnum.PRO);
  });
  const { t } = useI18n();

  const activeKey = ref(AppTypeEnum.PRO);
  const detailRef = ref();

  const appId = ref();

  const hasBILicense = ref(false);

  const handleToDetail = (id) => {
    appId.value = id;
    detailRef.value.open = true;
  };

  provide('handleToDetail', handleToDetail);

  getAppPageListReleasedApp({
    pageNo: 1,
    pageSize: 9999,
  }).then((res) => {
    apps.value = res!.data;
  });

  getAppTenantApps({ pageNo: 1, pageSize: 9999, deleted: 0, type: 'BI' }).then((res: any) => {
    biApps.value = (res.data ?? []).filter((e) => e.state !== AppStatusEnum.INACTIVE);
  });

  /** 获取BI是否有授权 */
  const getBILicense = () => {
    getLicenseModuleAuth().then((res) => {
      hasBILicense.value = res;
    });
  };

  getBILicense();
</script>

<style lang="less" scoped>
  .app-setting {
    position: relative;
    height: 100%;
    overflow: hidden;

    &__wrapper {
      display: flex;
      justify-content: space-between;
      height: 100%;

      & > div {
        flex: 1;

        &:not(:last-child) {
          height: 100%;
          margin-right: 16px;
        }
      }
    }
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
    padding-left: 12px;
    border-bottom: 1px solid #e0e3ea;
    background: #fff;
  }
</style>
