import { ref } from 'vue';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { GetAppResponse } from '/@/apis/gct-apaas/model/index';
import { getDesignerCommonGetApp } from '/@/apis/gct-apaas/DesignerCommonController';
import { updateTitle } from '/@/hooks/web/useTitle';
import { updateFavicon } from '/@/hooks/web/useFavicon';
import { useEnv } from '/@/hooks/develop/useEnv';
import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
import { useUserStore, useUserStoreWithOut } from '/@/store/modules/user';
import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';

const { isAppSingle, isSandbox } = useEnv();

export const useAppInfoStore = defineStore('app-info', () => {
  const appInfo = ref<GetAppResponse>({});

  /**
   * 加载应用信息
   * @returns 应用信息
   */
  async function loadAppInfo() {
    const res = await getDesignerCommonGetApp();
    appInfo.value = res ?? {};
    const fingerprint = await getBrowserFingerprint();
    const { getEnv } = useEnv();
    const userStore = useUserStore();
    const env = getEnv();
    gct.appSetting.env = env;
    if (env !== 'dev') {
      const clientId = `web.${userStore?.getUserInfo?.userId}.${env}.${res.id}.${
        userStore?.getUserInfo?.ip
      }.${fingerprint}.${new Date().getTime()}`;
      getLicenseGetUsers({ appId: res.id, env, clientId })
        .then((result) => {
          if (!result) {
            setTimeout(() => {
              if (isAppSingle || isSandbox) {
                const userStore = useUserStoreWithOut();
                userStore.logout(true);
              } else {
                window.location.href = `${location.origin}${
                  import.meta.env.VITE_PATHNAME_PROTAL
                }#/home`;
              }
            }, 1000);
            return {};
          }
        })
        .catch(() => {
          setTimeout(() => {
            if (isAppSingle || isSandbox) {
              const userStore = useUserStoreWithOut();
              userStore.logout(true);
            } else {
              window.location.href = `${location.origin}${
                import.meta.env.VITE_PATHNAME_PROTAL
              }#/home`;
            }
          }, 1000);
        });
    }

    gct.appInfo = appInfo.value;

    if (window._gct) {
      _gct.store.appInfo = appInfo.value;
    }

    updateTitle(res?.name);
    updateFavicon(res?.pageIcon);

    return appInfo.value;
  }

  return {
    appInfo,
    loadAppInfo,
  };
});

export function useAppInfoStoreWithout() {
  return useAppInfoStore(store);
}
