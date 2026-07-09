export enum AppTypeEnum {
  /** 专业应用 */
  PRO = 'PRO',
  /** 微应用 */
  MICRO = 'MICRO',
  /** 大屏应用 */
  BI = 'BI',
}

export const AppTypeI18nMap = {
  [AppTypeEnum.PRO]: 'sys.app.pro',
  [AppTypeEnum.MICRO]: 'sys.app.micro',
  [AppTypeEnum.BI]: 'sys.app.bi',
};

export enum AppStatusEnum {
  EXPIRED = 'EXPIRED', // 已到期
  AUTHORIZED = 'AUTHORIZED', // 已授权
}

export enum SettingModule {
  ADMIN,
  APP_ACCESS,
  APP_INNER_ORG,
}

export enum SettingItemTypeEnum {
  ADMIN = 'ADMIN',
  VISIBILITY_USER = 'VISIBILITY_USER',
  VISIBILITY_ORGANIZATION = 'VISIBILITY_ORGANIZATION',
  CAN_BE_USED_ORGANIZATION = 'CAN_BE_USED_ORGANIZATION',
}
