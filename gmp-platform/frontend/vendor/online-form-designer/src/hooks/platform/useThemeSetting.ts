import { reactive, ref, watch } from 'vue';
import { PlatformSettingEnum, ThemeSetting } from './types';
import { getPlatInfo, postPlatTheme } from '/@/apis/gct-platform/PlatformConfigController';
import {
  getBasicConfigDetail,
  postBasicConfigTheme,
} from '/@/apis/gct-apaas/BasicConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { useTheme } from '/@/hooks/web/useTheme';
import { ProjectName } from '/@/enums/appEnum';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';

import { updateColorWeak } from '/@/logics/theme/updateColorWeak';
import { updateGrayMode } from '/@/logics/theme/updateGrayMode';

const themeSetting: ThemeSetting = reactive({
  darkMode: 'light',
  themeColor: '#026AC8',
  // menuMode: 'mix-sider',
  menuMode: 'classic',
  menuWidth: 232,
  menuCollapsible: true,
  menuSearchable: true,
  menuFilter: false,
  showLogo: true,
  showBreadcrumb: false,
  showBreadcrumbIcon: false,
  showTabs: true,
  pageProgress: true,
  pageLoading: true,
  colorMode: 'normal',
});

const menuCollapsed = ref<boolean>(false);
const menuCollapsedWidth = 46;
const menuWidthRange = [100, 1000];
const themeColors = ['#026AC8', '#0DAA9C'];

const { setPrimaryColor } = useTheme();

setPrimaryColor(themeSetting.themeColor);
watch(
  () => themeSetting.themeColor,
  (value) => {
    value && setPrimaryColor(value);
  },
);

/**
 * 颜色模式切换
 */
const toggleColorMode = () => {
  switch (themeSetting.colorMode) {
    case 'colorWeak':
      updateColorWeak(true);
      updateGrayMode(false);
      break;
    case 'gray':
      updateColorWeak(false);
      updateGrayMode(true);
      break;
    default:
      updateColorWeak(false);
      updateGrayMode(false);
  }
};
watch(
  () => themeSetting.colorMode,
  (value) => {
    value && toggleColorMode();
  },
);

export function useThemeSetting() {
  const postThemeSetting = async () => {
    const { getCurrentProject } = usePermissionStoreWithOut();
    const value = JSON.stringify(themeSetting);
    if (ProjectName.APP_DESIGNER === getCurrentProject) {
      await postBasicConfigTheme({ value });
    } else {
      await postPlatTheme({ value });
    }
  };

  async function loadThemeSetting() {
    const { getCurrentProject } = usePermissionStoreWithOut();
    let res: any = null;
    if (ProjectName.APP_DESIGNER === getCurrentProject) {
      res = await getBasicConfigDetail({ configEnum: PlatformSettingEnum.THEME });
    } else {
      res = await getPlatInfo({ configEnum: PlatformSettingEnum.THEME });
    }
    res && setThemeSetting(res);
  }

  function setThemeSetting(data: SysConfigResponse) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(themeSetting, JSON.parse(value));
    } catch (err) {
      console.warn(err);
    }
  }

  function toggleMenuCollapsed() {
    menuCollapsed.value = !menuCollapsed.value;
  }

  return {
    themeSetting,
    loadThemeSetting,
    setThemeSetting,
    postThemeSetting,

    menuCollapsed,
    toggleMenuCollapsed,
    menuCollapsedWidth,
    menuWidthRange,

    themeColors,
  };
}
