// 数值类型
export const NUMBER_TYPE = 'number';
// 字符串类型
export const STRING_TYPE = 'string';
// 布尔类型
export const BOOLEAN_TYPE = 'boolean';
// 对象类型
export const OBJECT_TYPE = 'object';
// 数组类型
export const ARRAY_TYPE = 'array';
// 数值返回类型方法
export const FUN_NUM_TYPE: string[] = [
  'SUM',
  'REDUCE',
  'MULTIPLICATION',
  'DIVISION',
  'FIXED',
  'ROUND',
  'ROUNDUP',
  'MAX',
  'LARGE',
  'MIN',
  'SMALL',
  'AVERAGE',
  'ABS',
  'MOD',
  'POWER',
  'SQRT',
  'LEN',
  'DATE2TIMESTAMP',
  'SUMSQ',
  'STDEV',
  'COUNT',
  'TOINT',
  'FIND',
  'YEAR',
  'WEEK',
  'DAY',
  'MONTH',
  'QUARTER',
  'TODOUBLE',
  'DATEDIFF',
  // BI聚合方法
  'AVG',
  'GREATEST',
  'LEAST',
  'COUNTD',
  // 'MAX',
  'MEDIAN',
  // 'MIN',
  // 'SUM'
];
// 字符串返回类型方法
export const FUN_STR_TYPE: string[] = [
  'CONCAT',
  'SUBSTRING',
  'SUBSTR',
  'UPPER',
  'LOWER',
  'TRIM',
  'LTRIM',
  'RTRIM',
  'REPEAT',
  'REPLACE',
  'FINDSTR',
  'SEARCHSTR',
  'PARSENUMBER',
  'SPLIT',
];
// 布尔返回类型方法
export const FUN_BOL_TYPE: string[] = [
  'IF',
  'ISEMPTY',
  'ISNULL',
  'ISUNDEFINED',
  'AND',
  'OR',
  'EQ',
  'NE',
  'LE',
  'LT',
  'GE',
  'GT',
  'CONTAINS',
];
// 对象返回类型方法
export const FUN_OBJ_OR_ARR_TYPE: string[] = ['TUPLE', 'SEQMAP', 'GET', 'PUT', 'PUSH', 'HEADPUSH'];

// 返回值类型对应中文文本
export const RETURN_TYPE_MAP = {
  string: '字符串',
  number: '数值',
  boolean: '布尔',
  date: '日期',
  time: '时间',
  datetime: '日期时间',
  array: '数组',
  object: '对象',
  null: '空值',
  unknown: '未知',
  text: '文本',
  long_text: '长文本',
  integer: '整数',
  long: '长整数',
  decimal: '小数',
};

// 消息类型
export enum WinMsgTypeEnum {
  EXPRESSION = 'expression-language-service',
}

// 运算符和函数的映射
export const operator2FuncMap = {
  '+': 'ADD',
  '-': 'REDUCE',
  '*': 'MULTIPLICATION',
  '/': 'DIVISION',
  '%': 'MOD',
};
