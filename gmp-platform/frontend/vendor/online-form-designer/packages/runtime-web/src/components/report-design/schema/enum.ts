/**报表类型  */
export enum ReportEnum {
  /**交叉表 */
  CROSS_TABLE = 'crossTable',
  /**明细表 */
  SCHEDULE_TABLE = 'scheduleTable',
}

/**水平  */
export enum horizontalEnum {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

/**垂直  */
export enum verticalEnum {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}

/**所属维度 */
export enum dimensionEnum {
  /**行 */
  ROW = 'row',
  /**列 */
  COLUMN = 'column',
  /**指标 */
  INDICATOR = 'indicator',
  /** 钻取 */
  DRILL = 'drill',
}

/**空值显示 */
export enum emptyValueEnum {
  /**显示- */
  A = 'a',
  /**显示（空） */
  B = 'b',
  /**显示null*/
  C = 'c',
  /**显示‘’*/
  D = 'd',
  /**显示*/
  E = 'e',
}

/**日期显示格式 */
export enum DateValueEnum {
  // 年
  YEAR = 'year',
  // 年-季度
  YEAR_QUARTER = 'year-quarter',
  // 年-月
  YEAR_MONTH = 'year-month',
  // 年-月-日
  YEAR_MONTH_DAY = 'year-month-day',
  // 季度
  QUARTER = 'quarter',
  // 月
  MONTH = 'month',
  // 日
  DAY = 'day',
}

/**时间显示格式 */
export enum TimeValueEnum {
  D1 = 'HH',
  D2 = 'HH:mm',
  D3 = 'HH:mm:ss',
}
/**时间日期日期显示格式 */
export enum DateTimeValueEnum {
  // 年
  YEAR = 'YYYY',
  // 年-季度
  YEAR_QUARTER = 'YYYYQ',
  // 年-月
  YEAR_MONTH = 'YYYY-MM',
  // 年-月-日
  YEAR_MONTH_DAY = 'YYYY-MM-DD',
  // 年-月-日-时-分
  YEAR_MONTH_DAY_HH_MM = 'YYYY-MM-DD HH:mm',
  // 年-月-日-时-分-秒
  YEAR_MONTH_DAY_HH_SS = 'YYYY-MM-DD HH:mm:ss',
  // 季度
  QUARTER = 'Q季度',
  // 月
  MONTH = 'M月',
  // 日
  DAY = 'D日',
}

/** 条件格式 */
export enum FormattingEnum {
  /**高亮文本/背景 */
  STYLE = 'style',
  /**图标 */
  ICON = 'icon',
  /**色阶 */
  CTRL_L = 'style',
  /**数据条 */
  DATA_STRIP = 'dataStrip',
}

/**  数值格式 */
export enum NumberFormattingEnum {
  /**数值 */
  NUMERICAL_VALUE = 'numericalValue',
  /**百分比 */
  PERCENTAGE = 'percentage',
  /**时间 */
  TIME = 'time',
}

/** 日期时间类型格式 */
export enum DateTimeTypeFormattingEnum {
  // 年
  YEAR = 'year',
  // 年-季度
  YEAR_QUARTER = 'year-quarter',
  // 年-月
  YEAR_MONTH = 'year-month',
  // 年-月-日
  YEAR_MONTH_DAY = 'year-month-day',
  // 年-月-日-时-分
  YEAR_MONTH_DAY_HH_MM = 'year-month-day-hh-mm',
  // 年-月-日-时-分-秒
  YEAR_MONTH_DAY_HH_SS = 'year-month-day-hh-mm-ss',
  // 季度
  QUARTER = 'quarter',
  // 月
  MONTH = 'month',
  // 日
  DAY = 'day',
}

/**汇总计算方式 */
export enum SummaryCalculationMethod {
  /**求和 */
  SUM = 'SUM',
  /**最大值 */
  MAX = 'MAX',
  /**小值 */
  MIN = 'MIN',
  /**平均值 */
  AVG = 'AVG',
  /**计数 */
  COUNT = 'COUNT',
  /**去重计数 */
  NO_REPEAT_COUNT = 'NO_REPEAT_COUNT',
  /**自定义 */
  CUSTOM = 'CUSTOM',
  /**无 */
  NONE = 'NONE',
}

/**汇总计算方式名称映射 */
export const summaryCalculationNameMap = {
  [SummaryCalculationMethod.SUM]: '求和',
  [SummaryCalculationMethod.MAX]: '最大值',
  [SummaryCalculationMethod.MIN]: '最小值',
  [SummaryCalculationMethod.AVG]: '平均值',
  [SummaryCalculationMethod.COUNT]: '计数',
  [SummaryCalculationMethod.NO_REPEAT_COUNT]: '去重计数',
  [SummaryCalculationMethod.CUSTOM]: '自定义',
  [SummaryCalculationMethod.NONE]: '无',
};

/**导出类型 */
export enum ExportType { }

/** 下钻类型 */
export enum DrillTypeEnum {
  // 默认下钻
  DEFAULT = 'default',
  // 自定义下钻
  CUSTOM = 'custom',
}

/**行高设置 */
export enum RowHeightSettingEnum {
  LINE = 'line',
  ALL = 'all',
  OTHER = 'other',
}

export enum sortTypeEnum {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 日期显示格式
 *
 * @export
 * @enum {number}
 */
export enum DATE_FORMAT_ENUM {
  D1 = 'YYYY-MM-DD',
  D2 = 'YYYYMMDD',
  D3 = 'YYYY/MM/DD',
  D4 = 'YYYY年MM月DD日',
}

/**
 * 日期时间显示格式
 *
 * @export
 * @enum {number}
 */
export enum DATE_TIME_FORMAT_ENUM {
  D1 = 'YYYY-MM-DD HH',
  D2 = 'YYYY-MM-DD HH:mm',
  D3 = 'YYYY-MM-DD HHmm:ss',
  D4 = 'YYYY/MM/DD HH',
  D5 = 'YYYY/MM/DD HH:mm',
  D6 = 'YYYY/MM/DD HH:mm:ss',
  D7 = 'YYYYMMDD HH',
  D8 = 'YYYYMMDD HH:mm',
  D9 = 'YYYYMMDD HH:mm.ss',
  D10 = 'YYYY年M月D日 HH',
  D11 = 'YYYY年M月D日 HH:mm',
  D12 = 'YYYY年M月D日 HH:mm:ss',
}

/**
 * 时间显示格式
 *
 * @export
 * @enum {number}
 */
export enum TIME_FORMAT_ENUM {
  D1 = 'HH',
  D2 = 'HH:mm',
  D3 = 'HH:mm:ss',
}

/**
 * 数值显示格式 => 时间类型
 */
export enum NUMBER_FORMAT_TIME_TYPE_ENUM {
  '天' = 'DD',
  '天 : 时' = 'DD:HH',
  '天 : 时 : 分' = 'DD:HH:mm',
  '天 : 时 : 分 : 秒' = 'DD:HH:mm:ss',
  '时' = 'HH',
  '时 : 分' = 'HH:mm',
  '分' = 'mm',
  '分 : 秒' = 'mm:ss',
  '秒' = 'ss',
}
