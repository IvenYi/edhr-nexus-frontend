import { defineStore } from 'pinia';
import { getAid } from './sessionHooks';
import { getAppPageGetListReleasedApp } from '@mobile/apis/gct-platform/AppController';
import { type AppResponse } from '@mobile/apis/gct-platform/model';
import { ServeStart } from '@native/index';
import { LogoTypeEnum } from '@mobile/type';
import { getAppInfoById } from '/@/apis/gct-platform/AppController';
import { useEnv } from '@mobile/utils/useEnv';
import { initMqttApp, initMqttApaas } from '@mobile/stores/loginHooks';

const { isSandbox } = useEnv();

interface ILogo {
  logoType?: LogoTypeEnum;
  logo?: string;
  color?: string;
  bgColor?: string;
}
interface AppStoreState {
  appOptions: AppResponse[];
  appMapsById: Record<string, AppResponse>;
  /**单应用模式下对应租户id */
  tenantId?: string;
  /**单应用模式下应用名称 */
  appName: string;
  /**在某个应用内部 */
  inAppPage: boolean;
  /**单应用模式 */
  isAppSingle: boolean;
  /**单应用模式下图标显示 */
  logo: ILogo;
}
export const useAppStore = defineStore('appStore', {
  state: (): AppStoreState => ({
    isAppSingle: false,
    inAppPage: false,
    appOptions: [],
    appMapsById: {},
    tenantId: undefined,
    appName: '',
    logo: {},
  }),
  getters: {
    appConfig: (state): AppResponse => state.appMapsById[getAid.value],
    appSingle: (state) => state.isAppSingle,
    getAppOptions: (state) => state.appOptions,
    getTenantId: (state) => state.tenantId,
    getAppName: (state) => state.appName,
    /**app应用模式下不是单应用模式 */
    isInAppPage: (state) => state.inAppPage,
    /**app应用模式下 */
    getInApp: (state) => state.inAppPage || state.isAppSingle || isSandbox.value,
    /**獲取圖標信息 */
    getLogoInfo: (state): ILogo => state.logo,
  },
  actions: {
    async reloadApps() {
      this.getInApp ? initMqttApp() : initMqttApaas();
      if (this.inAppPage) return;
      this.appOptions = (await getAppPageGetListReleasedApp()) || [];
      this.appOptions.forEach((i) => {
        this.appMapsById[i.id!] = i;
      });
    },
    async setSingleApp(id: string, appName: string, tenantId: string, logo: ILogo = {}) {
      const singleAppId = id || getAid.value;
      if (!singleAppId) {
        console.warn('setSingleApp 缺少 appId，跳过单应用模式初始化');
        return;
      }
      this.isAppSingle = true;
      getAid.value = singleAppId;
      this.tenantId = tenantId;
      this.appName = appName;
      ServeStart.updateServeConfig({
        singleApp: true,
        tenantId,
        appName,
        appTag: singleAppId,
      });
      this.logo = logo;
    },
    /**进入应用 */
    async pushApp(appId: string) {
      const {
        logo: icon,
        // logoBgColor,
        // logoColor,
        name,
        logoThumbnail,
        logoType,
        mobileJson,
      } = (await getAppInfoById({ id: appId })) || {};

      const { logoColor, logoBgColor } = JSON.parse(mobileJson || '{}');

      const logo: ILogo = {
        logoType: logoType as LogoTypeEnum,
        logo: logoType === LogoTypeEnum.Image ? logoThumbnail : icon,
        color: logoColor,
        bgColor: logoType === LogoTypeEnum.Image ? null : logoBgColor,
      };
      this.logo = logo;
      this.appName = name;
      this.inAppPage = true;
      getAid.value = appId;
    },
    /**进入仪表盘 */
    async pushWorkbench() {
      this.inAppPage = false;
      getAid.value = '';
    },
    async clearSingleApp() {
      this.isAppSingle = false;
      this.tenantId = undefined;
      this.appName = '';
      this.logo = {};
      ServeStart.updateServeConfig({ singleApp: false, tenantId: '', appName: '', appTag: '' });
    },
  },
});
// /**是否是单应用模式 */
// const isAppSingle = ref(false);
// /**
//  * 应用列表
//  */
// const appOptions = ref<AppResponse[]>([]);
// const appMapsById = reactive<{ [key: string]: AppResponse }>({});
// /**当前应用基础信息 */
// const appConfig = computed(() => {
//   return appMapsById[getAid.value];
// });

// /**刷新当前应用列表 */
// async function reloadApps() {

// }
// function setAppId(id: string) {
//   getAid.value = id;
// }
// return { appOptions, reloadApps, appConfig, setAppId, getAid, isAppSingle };
