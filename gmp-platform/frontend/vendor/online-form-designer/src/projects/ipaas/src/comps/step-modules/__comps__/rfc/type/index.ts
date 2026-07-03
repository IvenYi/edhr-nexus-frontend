export interface ParameterStructItem {
  valueType: ValueTypeEnum;
  key: string | number;
  keyType: ParameterTypeEnum;
  value: string | number;
  description?: string;
  children?: ParameterStructItem[];
  collapse?: boolean;
}
export type ParameterStruct = ParameterStructItem[];

export enum ParameterTypeEnum {
  /** 可变长度字符串  */
  STRING = 'String',
  /** 固定长度字符串 */
  CHAR = 'CHAR',
  /** 时间字段 */
  TIMS = 'TIMS',
  /** 日期字段 */
  DATS = 'DATS',
  /** 数量字段 */
  QUAN = 'QUAN',
  /** 计量单位 */
  UNIT = 'UNIT',
  /** 数字型字符串 */
  NUMC = 'NUMC',
  /** 定点小数 */
  DEC = 'DEC',
  /** 表类型（数组） */
  TABLES = 'TABLES',
  /** 对象类型（对象） */
  STRUCTURES = 'STRUCTURES',
}

export enum ValueTypeEnum {
  /**
   * 固定值
   */
  INPUT = 'INPUT',
  /**
   * 表达式取值
   */
  EXPRESSION = 'EXPRESSION',
  /**
   * 脚本函数
   */
  SCRIPT = 'SCRIPT',
  /**
   * 鉴权函数
   */
  FUNC = 'FUNC',
}

export const ValueTypeList = [
  {
    value: ValueTypeEnum.INPUT,
    label: '固定值',
  },
  {
    value: ValueTypeEnum.EXPRESSION,
    label: '表达式',
  },
];
