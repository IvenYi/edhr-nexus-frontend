/**
 * Application configuration
 */
import type { ProjectConfig } from '/#/config';

import { PROJ_CFG_KEY } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';

import { updateHeaderBgColor, updateSidebarBgColor } from '/@/logics/theme/updateBackground';
import { updateColorWeak } from '/@/logics/theme/updateColorWeak';
import { updateGrayMode } from '/@/logics/theme/updateGrayMode';
import { updateDarkTheme } from '/@/logics/theme/dark';

import { useAppStore } from '/@/store/modules/app';
import { useLocaleStore } from '/@/store/modules/locale';
import { usePermissionStore } from '/@/store/modules/permission';

import { getCommonStoragePrefix, getStorageShortName } from '/@/utils/env';

import { Persistent } from '/@/utils/cache/persistent';
import { deepMerge } from '/@/utils';
import { ThemeEnum, ProjectName } from '/@/enums/appEnum';
import { omit } from 'lodash-es';

export function setProjectName(projectName: ProjectName) {
  const permissionStore = usePermissionStore();
    //设置当前项目名
  permissionStore.setCurrentProject(projectName);
  if (window._gct) {
    _gct.store.setProjectName(projectName);
  }
}

// Initial project configuration
export function initAppConfigStore(
  projectName: `${ProjectName}`,
  defaultConfig: Partial<ProjectConfig> = {},
) {
  console.log(defaultConfig);
  const localeStore = useLocaleStore();
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  //设置当前项目名
  permissionStore.setCurrentProject(projectName);
  if (window._gct) {
    _gct.store.setProjectName(projectName);
  }
  let projCfg: ProjectConfig = Persistent.getSession(PROJ_CFG_KEY) as ProjectConfig;
  projCfg = deepMerge(projectSetting, { ...defaultConfig, ...omit(projCfg, ['permissionMode']) });
  const darkMode = appStore.getDarkMode;
  const {
    colorWeak,
    grayMode,

    headerSetting: { bgColor: headerBgColor } = {},
    menuSetting: { bgColor } = {},
  } = projCfg;
  try {
    grayMode && updateGrayMode(grayMode);
    colorWeak && updateColorWeak(colorWeak);
  } catch (error) {
    console.log(error);
  }
  console.log(projCfg);
  appStore.setProjectConfig(projCfg);

  // init dark mode
  updateDarkTheme(darkMode);
  if (darkMode === ThemeEnum.DARK) {
    updateHeaderBgColor();
    updateSidebarBgColor();
  } else {
    headerBgColor && updateHeaderBgColor(headerBgColor);
    bgColor && updateSidebarBgColor(bgColor);
  }
  // init store
  localeStore.initLocale();

  setTimeout(() => {
    clearObsoleteStorage();
  }, 16);
}

/**
 * As the version continues to iterate, there will be more and more cache keys stored in localStorage.
 * This method is used to delete useless keys
 */
export function clearObsoleteStorage() {
  const commonPrefix = getCommonStoragePrefix();
  const shortPrefix = getStorageShortName();

  [localStorage, sessionStorage].forEach((item: Storage) => {
    Object.keys(item).forEach((key) => {
      if (key && key.startsWith(commonPrefix) && !key.startsWith(shortPrefix)) {
        item.removeItem(key);
      }
    });
  });
}
