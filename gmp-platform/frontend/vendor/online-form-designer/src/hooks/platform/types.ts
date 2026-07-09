import { RouterTransitionEnum } from '/@/enums/appEnum';

export enum PlatformSettingEnum {
  BASIC = 'BASE_CFG',
  WATERMARK = 'MARK_CFG',
  SECURITY = 'SECURITY_CFG',
  LOGIN = 'LOGIN_CFG',
  THEME = 'THEME_CFG',
  ORGANIZATION = 'ORG_CFG',
  APK = 'APK_CFG',
  DEPLOY = 'DEPLOY_CFG',
  GLOBAL = 'GLOBAL_CFG',
}

export enum PassRule {
  NUMBER = 'NUMBER',
  LOWERCASE = 'LOWERCASE',
  UPPERCASE = 'UPPERCASE',
  SPECHARS = 'SPECHARS',
}

export enum KickRuleEnum {
  SAME_END = 'SAME_END',
  DIFFERENT_END = 'DIFFERENT_END',
}
export interface PlatformMapType<T = any> {
  component: T;
  name: string;
}

export interface LoginModeConfigMap {
  address: string;
  authType: string;
  relationFields: string;
  domainSuffix?: string;
}

export interface LoginMethods {
  label: string;
  icon: string;
  color?: string;
  value: string;
}

export interface ThemeSettingConfig {
  toolbarMode: string;
  mode: string;
  width: number;
  menuSetting: Array<string>;
  contentSetting: Array<string>;
  menuSettingFold: string;
  menuTopLayout: string;
  animationSetting: Array<string>;
  animationType: RouterTransitionEnum;
}

export interface ThemeSetting {
  darkMode: 'light' | 'dark';
  themeColor: string;
  menuMode: 'classic' | 'mix-sider' | 'horizontal-mix-sider';
  menuWidth: number;
  menuCollapsible: boolean;
  menuFilter: boolean;
  showLogo: boolean;
  showBreadcrumb: boolean;
  showBreadcrumbIcon: boolean;
  showTabs: boolean;
  pageProgress: boolean;
  pageLoading: boolean;
  colorMode: 'normal' | 'colorWeak' | 'gray';
}

export interface GlobalSetting {
  emptyDisplay: string;
}
