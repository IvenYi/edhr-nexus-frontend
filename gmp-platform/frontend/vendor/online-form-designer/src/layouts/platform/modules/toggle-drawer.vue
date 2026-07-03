<template>
  <a-drawer
    v-model:visible="drawerVisible"
    width="300"
    placement="left"
    :closable="false"
    :keyboard="false"
    :body-style="{
      padding: '16px',
      color: '#212528',
    }"
  >
    <div class="flex flex-col h-full">
      <div class="flex-none">
        <div class="h-34px flex items-center justify-between">
          <div @click="goHome" class="flex-1 flex items-center cursor-pointer toggle-dashboard">
            <img class="h-20px w-20px mr-8px" :src="SysTogglePortalSvg" alt="" srcset="" />
            <span class="text-[#212528] text-14px">工作台</span>
          </div>
          <div class="p-2px flex cursor-pointer" @click="drawerVisible = false">
            <close-outlined class="text-14px" />
          </div>
        </div>
        <div class="mt-16px pl-8px lh-[22px] text-[#212528]"> {{ $t('sys.portal.myApp') }} </div>
        <div class="mt-16px bg-[#E0E3EA] h-1px"></div>
      </div>
      <div class="h-10px flex-1 overflow-y-auto">
        <a-spin :spinning="userAppsLoading">
          <div
            class="toggle-item mt-16px"
            :class="{
              'toggle-item--selected': appInfoStore.appInfo.id === app.id,
            }"
            v-for="app in userApps"
            :key="app.id"
            @click="goApplication(app)"
          >
            <app-logo
              class="mr-8px flex-none"
              :layout="18"
              :padding="0"
              :size="16"
              :radius="2"
              :type="app?.logoType"
              :logo="app?.logo"
              :color="app.logoColor"
              :background="app?.logoBgColor"
              :logoThumbnail="app.logoThumbnail"
            />
            <span class="ell" :title="app.name">{{ app.name }}</span>
            <div class="ml-[auto] pl-8px" v-if="appInfoStore.appInfo.id === app.id">
              <check-outlined class="text-14px" />
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { useToggleDrawer } from './useToggleDrawer';
  import AppLogo from '/@/components/AppLogo/index.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { genUrl } from '/@/utils';
  import SysTogglePortalSvg from '/@/assets/platform/sys-toggle-portal.svg';
  import { postSignLog } from '/@/apis/gct-platform/SignLogController';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';
  import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
  import { useUserStore } from '/@/store/modules/user';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const { getEnv, isTestEnv } = useEnv();
  const appInfoStore = useAppInfoStore();
  const { drawerVisible, userApps, userAppsLoading } = useToggleDrawer();
  const userStore = useUserStore();
  const { mitt } = useMitt();
  /**
   * 跳转工作台
   */
  const goHome = () => {
    mitt.emit('mqtt-app-exit');
    window.location.href = `${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#/home`;
  };

  /**
   * 跳转其他应用
   * @param app
   */
  const goApplication = async (app) => {
    if (appInfoStore.appInfo.id === app.id) return;
    // 应用切应用，记录登录登出
    // const fingerprint = await getBrowserFingerprint();
    // const env = getEnv();
    // const data = {
    //   appIdOut: appInfoStore.appInfo.id,
    //   changeApp: true,
    //   appId: app.id,
    //   env,
    //   browser: fingerprint,
    // };
    // sessionStorage.setItem(
    //   'currentPlatOrAppId',
    //   JSON.stringify({
    //     appId: app.id,
    //   }),
    // );
    // await postSignLog(data);
    await toApp(app);
  };
  const toApp = async (app) => {
    const fingerprint = await getBrowserFingerprint();
    const env = isTestEnv.value ? 'test' : 'prod';
    const clientId = `web.${userStore?.getUserInfo?.userId}.${env}.${app.id}.${
      userStore?.getUserInfo?.ip
    }.${fingerprint}.${new Date().getTime()}`;
    getLicenseGetUsers({ appId: app.id, env, clientId }).then((res) => {
      console.log('res========>', res);
      if (res) {
        window.location.href = genUrl(
          `${location.origin}${import.meta.env.VITE_PATHNAME_WEB_APP}`,
          {
            aid: app.id,
          },
        );
      }
      // else {
      //   message.error(`【${data.name}】${t('sys.onlineError')}`);
      // }
    });
  };
</script>

<style lang="less" scoped>
  .toggle-dashboard {
    padding: 5px 3px;

    &:hover {
      background-color: #f7f8fa;
      font-weight: 500;
    }
  }

  .toggle-item {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 8px;
    transition: all 0.3s;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #f7f8fa;
      font-weight: 500;
    }

    &--selected {
      color: var(--ant-primary-color);
      font-weight: 500;
    }
  }
</style>
