/** 布局类型 */
export enum DisplayTypeEnum {
  /** 网格 */
  Grid = 'grid',
  /** 垂直 */
  Vertical = 'vertical',
  /** 水平 */
  Horizontal = 'horizontal',
}

/** 字体样式属性key */
export const fontStyleAttrs = [
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textAlign',
  'verticalAlign',
  'fontSize',
  'textDecoration',
  'color',
  'whiteSpace',
  'wordBreak',
];

export const compStyleAttrs = ['backgroundColor'];

export enum CmpMethodEnum {
  /** 生成组件默认配置 */
  WrapperCmpConfig = 'wrapperCmpConfig',
  /** 更新组件配置 */
  UpdateCmpConfig = 'updateCmpConfig',
}
