/** 动态表单类型枚举 */
export enum DYN_F_TYPE {
  /** 布尔值 */
  Boolean = 'boolean',
  /** 精度小数 */
  Decimal = 'decimal',
  /** 整数 */
  Integer = 'integer',
  /** 字符串 */
  String = 'string',
  /** 暂时注释 模型对象 */
  // object = 'object',
  /** 人员 */
  User = 'user',
  /** 部门 */
  Org = 'org',
  /** 日期 */
  Date = 'date',
  /** 日期时间 */
  Date_time = 'date_time',
  /** 图片 */
  Image = 'image',
}

/** 显示方式类型枚举 */
export enum DYN_DISPLAY_TYPE {
  /** 单行文本 */
  Input = 'input',
  /** 开关 */
  Switch = 'switch',
  /** 单选 */
  Radio = 'radio',
  /** 下拉选择 */
  Select = 'select',
}

/** 显示方式枚举 */
export const DYN_DISPLAY_OPTS = {
  [DYN_F_TYPE.Boolean]: [DYN_DISPLAY_TYPE.Switch, DYN_DISPLAY_TYPE.Radio, DYN_DISPLAY_TYPE.Select],
  [DYN_F_TYPE.Decimal]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
  [DYN_F_TYPE.Integer]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
  [DYN_F_TYPE.String]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
};
