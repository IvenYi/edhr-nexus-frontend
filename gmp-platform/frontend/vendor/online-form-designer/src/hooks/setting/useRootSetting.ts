import type { ProjectConfig } from '/#/config';

import { computed } from 'vue';
import { has, isEmpty } from 'lodash-es';

import { useAppStore } from '/@/store/modules/app';
import { useUserStore } from '/@/store/modules/user';
import { ContentEnum, ThemeEnum } from '/@/enums/appEnum';
import { useWatermark } from '../web/useWatermark';
import dayjs from 'dayjs';

type RootSetting = Omit<
  ProjectConfig,
  'locale' | 'headerSetting' | 'menuSetting' | 'multiTabsSetting'
>;

export function useRootSetting() {
  const appStore = useAppStore();
  const { setWatermark, clear } = useWatermark();

  const getPageLoading = computed(() => appStore.getPageLoading);

  const getOpenKeepAlive = computed(() => appStore.getProjectConfig.openKeepAlive);

  const getSettingButtonPosition = computed(() => appStore.getProjectConfig.settingButtonPosition);

  const getCanEmbedIFramePage = computed(() => appStore.getProjectConfig.canEmbedIFramePage);

  const getPermissionMode = computed(() => appStore.getProjectConfig.permissionMode);

  // 显示logo
  const getShowLogo = computed(() => appStore.getThemeSetting.contentSetting.includes('logo'));
  const getContentMode = computed(() => appStore.getProjectConfig.contentMode);

  const getUseOpenBackTop = computed(() => appStore.getProjectConfig.useOpenBackTop);

  const getShowSettingButton = computed(() => appStore.getProjectConfig.showSettingButton);

  const getUseErrorHandle = computed(() => appStore.getProjectConfig.useErrorHandle);

  const getShowFooter = computed(() => appStore.getProjectConfig.showFooter);

  // 是否展示面包屑
  const getShowBreadCrumb = computed(() =>
    appStore.getThemeSetting.contentSetting.includes('breadcrumb'),
  );

  const getThemeColor = computed(() => {
    const themeColor = appStore.getThemeSetting.themeColor;
    try {
      if (typeof themeColor === 'string') {
        return themeColor;
      } else {
        themeColor.join('');
      }
    } catch (error) {}
  });

  // 是否展示面包屑图标
  const getShowBreadCrumbIcon = computed(() =>
    appStore.getThemeSetting.contentSetting.includes('breadcrumbIcon'),
  );

  const getFullContent = computed(() => appStore.getProjectConfig.fullContent);

  const getColorWeak = computed(() => appStore.getProjectConfig.colorWeak);

  const getGrayMode = computed(() => appStore.getThemeSetting.mode === 'gary');

  const getLockTime = computed(() => appStore.getProjectConfig.lockTime);

  const getShowDarkModeToggle = computed(() => appStore.getProjectConfig.showDarkModeToggle);

  const getDarkMode = computed(() => appStore.getDarkMode);

  // 系统登录
  const getSystemLogin = computed(() => appStore.getLoginSetting.loginModeConfigs);
  const getWatermarkSetting = computed(() => appStore.getWatermarkSetting);
  // 水印
  const getWatermark = () => {
    if (getWatermarkSetting.value.openWatermark) {
      const userStore = useUserStore();
      const { text, ...args } = getWatermarkSetting.value;
      const watermarkStr = getWatermarkStr({ key: args.watermarkContent, userStore, text });
      // switch (args.watermarkContent) {
      //   case 'username':
      //     watermarkStr = (userStore.userInfo?.fullname || userStore.getUserInfo?.fullname) ?? '';
      //     break;
      //   case 'email':
      //     watermarkStr = `${
      //       (userStore.userInfo?.fullname || userStore.getUserInfo?.fullname) ?? ''
      //     } ${(userStore.userInfo?.email || userStore.getUserInfo?.email) ?? ''}`;
      //     break;
      //   case 'account':
      //     watermarkStr = (userStore.userInfo?.username || userStore.getUserInfo?.username) ?? '';
      //     break;
      //   default:
      //     watermarkStr = getCustomWatermarkStr(text, userStore);
      // }
      setWatermark(watermarkStr, args);
    } else {
      clear();
    }
  };

  const getSignWay = () => {
    switch (getSecurityConfig.value.enableSignPassword) {
      case 0:
        return 'LOGIN';
      case 1:
        return 'SIGN';
      case 2:
        return 'DOMAIN';
      default:
        return 'LOGIN';
    }
  };

  function getWatermarkStr({ key, userStore, text }) {
    let watermarkStr = '';
    switch (key) {
      case 'username':
        watermarkStr = (userStore.userInfo?.fullname || userStore.getUserInfo?.fullname) ?? '';
        break;
      case 'email':
        watermarkStr = `${
          (userStore.userInfo?.fullname || userStore.getUserInfo?.fullname) ?? ''
        } ${(userStore.userInfo?.email || userStore.getUserInfo?.email) ?? ''}`;
        break;
      case 'account':
        watermarkStr = (userStore.userInfo?.username || userStore.getUserInfo?.username) ?? '';
        break;
      default:
        watermarkStr = text
          ? getCustomWatermarkStr(text, userStore)
          : dayjs().format(key.toUpperCase());
    }
    return watermarkStr;
  }

  function getCustomWatermarkStr(text, userStore) {
    return text.replace(/\${(.*?)}/g, function (match, key) {
      let str = match;
      if (
        ['username', 'email', 'account', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy.MM.dd'].includes(key)
      ) {
        str = getWatermarkStr({ key, userStore, text: '' });
      }
      return str;
    });
  }
  // 基础设置
  const getPlatfromVersion = computed(() => appStore.getBasicSetting.version);
  const getPlatformLogo = computed(() => appStore.basicSetting.logo);
  const getPlatformLoading = computed(() => appStore.getBasicSetting.loadingImage);
  const getPlatformThumbnail = computed(() => appStore.getBasicSetting.thumbnail);
  const getPlatformIcon = computed(() => appStore.getBasicSetting.icon);
  const getPlatformDescription = computed(() => appStore.getBasicSetting.description);
  const getPlatformCopyright = computed(() => appStore.getBasicSetting.copyright);
  const getPlatformName = computed(() => appStore.getBasicSetting.name);

  // 登录设置
  const getLoginTitle = computed(() => appStore.getLoginSetting.title);
  const getLoginSubTitle = computed(() => appStore.getLoginSetting.subtitle);
  const getLoginBanner = computed(() => appStore.getLoginSetting.banner);
  const getLoginLogo = computed(() => appStore.getLoginSetting.logo);
  const getLoginTheme = computed(() => appStore.getLoginSetting.theme);
  const getLoginIDOAuthConfigs = computed(() => appStore.getLoginSetting.openIDOAuthConfigs);
  const getLoginModeConfigs = computed(() => appStore.getLoginSetting.loginModeConfigs);
  const getLoginMode = computed(() => appStore.getLoginSetting.loginModeConfigs);
  const getLoginSortJson = computed(() => {
    const sortMap = {
      SYSTEM: ['ACCOUNT', 'DOMAIN_ACCOUNT', 'MOBILE', 'CARD'],
      THIRD_PARTY: ['DINGDING', 'FEISHU', 'QIYEWEIXIN', 'MICROSOFT'],
    };

    if (has(appStore.getLoginSetting, 'sortJson') && !isEmpty(appStore.getLoginSetting.sortJson)) {
      const sortObj = JSON.parse(appStore.getLoginSetting.sortJson ?? '');

      if (has(sortObj, 'SYSTEM')) {
        sortMap.SYSTEM = [...sortObj['SYSTEM']];
      }
      if (has(sortObj, 'THIRD_PARTY')) {
        sortMap.THIRD_PARTY = [...sortObj['THIRD_PARTY']];
      }
    }
    return sortMap;
  });

  const getDefaultAuthType = computed(() => {
    const type = appStore.getLoginSetting.defaultAuthType ?? 'ACCOUNT';
    // ! 目前选择第三方登录先默认成账号密码
    // if (['DINGDING', 'FEISHU', 'QIYEWEIXIN'].includes(type)) {
    //   return 'ACCOUNT';
    // }
    return type;
  });

  // 组织设置
  const getOrgDelUser = computed(() => appStore.getOrgSetting.enableDeleteUser);
  const getOrgIdentifier = computed(() => appStore.getOrgSetting.enableIdentifier);
  const getOrgInitialPassword = computed(() => appStore.getOrgSetting.initialPassword);
  const getOrgInitialSignPassword = computed(() => appStore.getOrgSetting.initialSignPassword);
  const getOrgInitialSealPassword = computed(() => appStore.getOrgSetting.initialSealPassword);
  const getOrgRequiredFields = computed(() => appStore.getOrgSetting.requiredFields);
  const getOrgSupportLoginFields = computed(() => appStore.getOrgSetting.supportLoginFields);
  const getOrgExtFields = computed(() => appStore.getOrgSetting.extFieldConfigs);

  // 安全设置
  const getSecurityConfig = computed(() => appStore.getSecuritySetting);

  const getLayoutContentMode = computed(() =>
    appStore.getProjectConfig.contentMode === ContentEnum.FULL
      ? ContentEnum.FULL
      : ContentEnum.FIXED,
  );

  function setRootSetting(setting: Partial<RootSetting>) {
    appStore.setProjectConfig(setting);
  }

  function setDarkMode(mode: ThemeEnum) {
    appStore.setDarkMode(mode);
  }
  return {
    setRootSetting,

    getSettingButtonPosition,
    getFullContent,
    getColorWeak,
    getGrayMode,
    getLayoutContentMode,
    getPageLoading,
    getOpenKeepAlive,
    getCanEmbedIFramePage,
    getPermissionMode,
    getShowLogo,
    getUseErrorHandle,
    getShowBreadCrumb,
    getShowBreadCrumbIcon,
    getUseOpenBackTop,
    getShowSettingButton,
    getShowFooter,
    getContentMode,
    getLockTime,
    getThemeColor,
    getDarkMode,
    setDarkMode,
    getShowDarkModeToggle,
    getSystemLogin,
    getWatermark,
    getWatermarkSetting,
    getPlatfromVersion,
    getPlatformLogo,
    getPlatformLoading,
    getPlatformThumbnail,
    getPlatformIcon,
    getPlatformDescription,
    getPlatformCopyright,
    getPlatformName,
    // 登录
    getLoginTitle,
    getLoginSubTitle,
    getLoginBanner,
    getLoginLogo,
    getLoginTheme,
    getLoginModeConfigs,
    getLoginIDOAuthConfigs,
    getLoginMode,
    getLoginSortJson,
    getDefaultAuthType,
    // 组织设置
    getOrgDelUser,
    getOrgIdentifier,
    getSecurityConfig,
    getOrgInitialPassword,
    getOrgInitialSignPassword,
    getOrgInitialSealPassword,
    getOrgRequiredFields,
    getOrgSupportLoginFields,
    getOrgExtFields,
    getSignWay,
  };
}
