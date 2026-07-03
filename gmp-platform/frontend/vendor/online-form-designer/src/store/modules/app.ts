import type {
  ProjectConfig,
  HeaderSetting,
  MenuSetting,
  TransitionSetting,
  MultiTabsSetting,
} from '/#/config';
import type { BeforeMiniState } from '/#/store';

import { defineStore } from 'pinia';
import { store } from '/@/store';

import { ThemeEnum } from '/@/enums/appEnum';
import { APP_DARK_MODE_KEY_, PROJ_CFG_KEY } from '/@/enums/cacheEnum';
import { Persistent } from '/@/utils/cache/persistent';
import { darkMode } from '/@/settings/designSetting';
import { resetRouter } from '/@/hooks/web/useRouter';
import { deepMerge } from '/@/utils';

import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
import { useWatermarkSetting } from '/@/hooks/platform/useWatermarkSetting';
import type { ThemeSetting } from '/@/hooks/platform/types';

import {
  AuthConfig,
  OrgConfig,
  PlatformBaseConfig,
  SecurityConfig,
} from '/@/apis/gct-platform/model';
// import { ThemeSettingConfig } from '/@/projects/backend-management/src/views/platform/types';

const { basicSetting } = useBasicSetting();
const { loginSetting } = useLoginSetting();
const { orgSetting } = useOrgSetting();
const { securitySetting } = useSecuritySetting();
const { themeSetting } = useThemeSetting();
const { watermarkSetting } = useWatermarkSetting();
interface AppState {
  darkMode?: ThemeEnum;
  // Page loading status
  pageLoading: boolean;
  // project config
  projectConfig: ProjectConfig | null;
  // When the window shrinks, remember some states, and restore these states when the window is restored
  beforeMiniInfo: BeforeMiniState;
  // 平台管理基础配置
  basicSetting: PlatformBaseConfig;
  // 平台登录基础配置
  loginSetting: AuthConfig;
  // 平台组织基础配置
  orgSetting: OrgConfig;
  // 平台安全基础配置
  securitySetting: SecurityConfig;
  // 平台主题相关配置
  themeSetting: ThemeSetting;
  // 平台水印相关配置
  watermarkSetting: any;
}
let timeId: TimeoutHandle;
export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => {
    return {
      darkMode: undefined,
      pageLoading: false,
      projectConfig: Persistent.getSession(PROJ_CFG_KEY),
      beforeMiniInfo: {},
      basicSetting,
      loginSetting,
      orgSetting,
      securitySetting,
      themeSetting,
      watermarkSetting,
    };
  },
  getters: {
    getPageLoading(state): boolean {
      return state.pageLoading;
    },
    getDarkMode(state): 'light' | 'dark' | string {
      return state.darkMode || localStorage.getItem(APP_DARK_MODE_KEY_) || darkMode;
    },

    getBeforeMiniInfo(state): BeforeMiniState {
      return state.beforeMiniInfo;
    },

    getProjectConfig(state): ProjectConfig {
      return state.projectConfig || ({} as ProjectConfig);
    },

    getHeaderSetting(): HeaderSetting {
      return this.getProjectConfig.headerSetting;
    },
    getMenuSetting(): MenuSetting {
      return this.getProjectConfig.menuSetting;
    },
    getTransitionSetting(): TransitionSetting {
      return this.getProjectConfig.transitionSetting;
    },
    getMultiTabsSetting(): MultiTabsSetting {
      return this.getProjectConfig.multiTabsSetting;
    },

    getBasicSetting(): PlatformBaseConfig {
      return this.basicSetting;
    },
    getLoginSetting(): AuthConfig {
      return this.loginSetting;
    },
    getOrgSetting(): OrgConfig {
      return this.orgSetting;
    },
    getSecuritySetting(): SecurityConfig {
      return this.securitySetting;
    },
    getThemeSetting(): ThemeSetting {
      console.log('getThemeSetting');
      return this.themeSetting;
    },
    getWatermarkSetting(): any {
      return this.watermarkSetting;
    },
  },
  actions: {
    setPageLoading(loading: boolean): void {
      this.pageLoading = loading;
    },

    setDarkMode(mode: ThemeEnum): void {
      this.darkMode = mode;
      localStorage.setItem(APP_DARK_MODE_KEY_, mode);
    },

    setBeforeMiniInfo(state: BeforeMiniState): void {
      this.beforeMiniInfo = state;
    },

    setProjectConfig(config: DeepPartial<ProjectConfig>): void {
      this.projectConfig = deepMerge(this.projectConfig || {}, config);
      Persistent.setSession(PROJ_CFG_KEY, this.projectConfig);
    },

    async resetAllState() {
      resetRouter();
      Persistent.clearAll();
    },
    async setPageLoadingAction(loading: boolean): Promise<void> {
      if (loading) {
        clearTimeout(timeId);
        // Prevent flicker
        timeId = setTimeout(() => {
          this.setPageLoading(loading);
        }, 50);
      } else {
        this.setPageLoading(loading);
        clearTimeout(timeId);
      }
    },
  },
});

// Need to be used outside the setup
export function useAppStoreWithOut() {
  return useAppStore(store);
}
