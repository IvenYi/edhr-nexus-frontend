<template>
  <div class="flex flex-col w100% h100%">
    <QrcodeItem
      :codeInfo="apkDownloadImage"
      :title="t('sys.platform.appDownload')"
      :subTitle="t('sys.platform.applicableToMobileScenarios')"
      :subTitle2="t('sys.platform.scanCodeDownload')"
      :image="AppUpload"
      logoType="image"
    />
    <div class="mt40px font500 text-16px">
      {{t('sys.platform.installationServiceConfiguration')}}
    </div>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane :key="1" :tab="t('sys.developer.designView.workbench')" />
      <a-tab-pane
        :key="2"
        :tab="t('sys.platform.singleApplication')"
        force-render
        v-if="appInfoStore.appInfo.suiteKey !== 'eDHR'"
      >
        <Scrollbar class="scroll-container">
          <a-row>
            <a-col :span="mobileApp.length > 1 ? 12 : 24" v-for="app in mobileApp" :key="app.id">
              <QrcodeItem
                :codeInfo="app.appInfo"
                :title="app.name"
                :subTitle="t('sys.platform.scanCodeConfiguration')"
                :image="Dashboard"
                :logoType="app.logoType"
              />
            </a-col>
          </a-row>
        </Scrollbar>
      </a-tab-pane>
    </a-tabs>
    <QrcodeItem
      v-if="activeKey == 1"
      :codeInfo="appConfigImage"
      :title="t('sys.platform.workbenchApplication')"
      :subTitle="t('sys.platform.scanCodeConfiguration')"
      :image="Dashboard"
      logoType="image"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { getApkGetActiveApp } from '/@/apis/gct-platform/ApkController';
  import { ApkResponse } from '/@/apis/gct-platform/model';
  import { getAppPageGetListReleasedApp } from '/@/apis/gct-platform/AppController';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '@/enums/appEnum';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import AppUpload from '/@/assets/svg/pic_appxz.svg';
  import Dashboard from '/@/assets/svg/pic_gztyy.svg';
  import QrcodeItem from '../component/qrcode-item.vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface ISingleAppConfig {
    serverAddress: string;
    appTag?: string;
    tenantId?: string;
    suiteKey?: string;
  }
  const { t } = useI18n();

  const activeKey = ref(1);
  const mobileApp = ref([]);

  const HOST =
    process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOBAL_HOST : location.origin;

  const apkInfo = ref<ApkResponse>({});
  const apkDownloadImage = ref('');
  const appInfoStore = useAppInfoStore();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { branchId } = useBranch();
  const { getEnv } = useEnv();

  getApkGetActiveApp().then((res) => {
    apkInfo.value = res;
    apkDownloadImage.value = HOST + transformUrl(res.apkUrl, { random: false });
  });

  const appConfigImage = computed(() => {
    if (getCurrentProject === ProjectName.WEB_RENDER) {
      const config: ISingleAppConfig = {
        serverAddress: HOST,
        pathname: location.pathname,
        appTag: appInfoStore.appInfo.id,
        tenantId: appInfoStore.appInfo.tenantId,
        suiteKey: appInfoStore.appInfo.suiteKey,
        isPreview: true,
        branchId: branchId.value,
        env: getEnv(),
      };
      return JSON.stringify(config);
    } else {
      return HOST;
    }
  });

  onMounted(() => {
    getAppPageGetListReleasedApp({
      transferToConfig: { headers: { source: 502 } },
    }).then((res) => {
      console.log(res, 'res');
      mobileApp.value = res
        ?.map((i) => {
          return {
            ...i,
            appInfo: {
              serverAddress: HOST,
              logo:
                i.logoType === 'ICON' || i.logoType === 'SVG'
                  ? i.logo
                  : transformUrl(i.logoThumbnail),
              logoBgColor: i.logoBgColor,
              logoType: i.logoType,
              logoColor: i.logoColor,
              appName: i.name,
              singleApp: true,
              tenantId: i.tenantId,
              appTag: i.id,
            },
          };
        })
        .filter((p) => p.authState === 1);
    });
  });
</script>

<style lang="less" scoped>
  .qrcode-card {
    padding: 8px 8px 8px 20px;
    background: #f9fafb;

    .code {
      width: 88px;
      height: 88px;
      border: 1px solid #e0e3eb;
      border-radius: 4px;
    }
    // > div:nth-child(1) {
    //   height: 200px;
    //   width: 200px;
    // }

    // > div:nth-child(2) {
    //   font-size: 20px;
    //   // color: #fff;
    //   font-weight: 600;
    //   margin-top: 16px;
    // }
    // > div:nth-child(3) {
    //   font-size: 14px;
    //   // color: #fff;
    //   font-weight: 400;
    //   margin-top: 2px;
    // }

    // &:nth-child(2) {
    //   // background-color: #3370ff;
    //   margin-left: 40px;
    // }
  }

  :deep(.ant-col-12) {
    max-width: calc(50% - 8px);
    margin-bottom: 16px;
  }

  :deep(.ant-col-12:nth-child(odd)) {
    margin-right: 16px;
  }

  :deep(.ant-tabs-content),
  :deep(.ant-tabs-tabpane) {
    height: 100%;
  }
</style>
