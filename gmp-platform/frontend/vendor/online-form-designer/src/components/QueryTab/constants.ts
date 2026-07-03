export enum DynamicDateType {
  /** 本日 */
  DAY = 'day',
  /** 本周 */
  WEEK = 'week',
  /** 本月 */
  MONTH = 'month',
  /** 本年 */
  YEAR = 'year',
}

export enum QueryValueType {
  /** 直接值 */
  RAW = 'raw',
  /** 动态时间值 */
  DYNAMIC_DATE = 'dynamic_date',
}

export enum QueryTabType {
  /** 内置 */
  BUILTIN = 'builtin',
  /** 自定义 */
  CUSTOM = 'custom',
}
