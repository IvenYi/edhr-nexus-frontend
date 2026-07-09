/**
 * logo类型枚举
 * @alias Icon    图标
 * @alias Image   图片
 */
export enum AppLogoTypeEnum {
  /** 图标 */
  Icon = 'ICON',
  /** 图片 */
  Image = 'IMAGE',
}

export interface AppLogoValue {
  /** logo类型 */
  type: AppLogoTypeEnum;
  /** logo图标 */
  icon?: string;
  /** logo图标颜色 */
  iconColor?: string;
  /** logo图标背景色 */
  iconBgColor?: string;
  /** logo图片 */
  image?: string;
}
