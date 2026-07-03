export enum UserRoleReqEnum {
  /** 维护人员 */
  MAINTAINER = 'MAINTAINER',
  /** 开发人员（协作） */
  DEVELOPER = 'DEVELOPER',
  /** 测试人员 */
  TESTER = 'TESTER',
  /** 查看人员 */
  VIEWER = 'VIEWER',
}

export enum WorkBenchTabEnum {
  /** 应用 */
  APP = 'app',
  /** 菜单 */
  MENU = 'menu',
  /** 已选菜单 */
  SELECT_MENU = 'select_menu',
}
export enum PlatformSettingEnum {
  BASIC = 'BASE_CFG',
  WATERMARK = 'MARK_CFG',
  SECURITY = 'SECURITY_CFG',
  LOGIN = 'LOGIN_CFG',
  THEME = 'THEME_CFG',
  ORGANIZATION = 'ORG_CFG',
  APK = 'APK_CFG',
}
/**
 * logo类型枚举
 * @alias Icon    图标
 * @alias Image   图片
 */
export enum LogoTypeEnum {
  /** 图标 */
  Icon = 'ICON',
  /** 图片 */
  Image = 'IMAGE',
}

export enum Environment {
  /** 图标 */
  WEB = 'web',
  /** 图片 */
  ANDROID = 'android',
}
