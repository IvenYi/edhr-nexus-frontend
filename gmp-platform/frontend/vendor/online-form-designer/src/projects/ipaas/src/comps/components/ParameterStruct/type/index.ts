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
  String = 'String',
  // Integer = 'Integer',
  // Long = 'Long',
  // Double = 'Double',
  // Float = 'Float',
  Number = 'Number',
  Boolean = 'Boolean',
  Object = 'Object',
  Array = 'Array',
}

export enum BodyFileParameterTypeEnum {
  String = 'String',
  File = 'File',
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
