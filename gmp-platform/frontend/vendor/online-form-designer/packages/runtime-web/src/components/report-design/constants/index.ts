import { ReportEnum } from '../schema';

/**
 * 报表模式
 *
 * @export
 * @enum {number}
 */
export enum REPORT_MODE {
  /**
   * 全部
   */
  ALL = 'all',
  /**
   * 表格
   */
  TABLE = 'table',
}

/**
 * 控制器类型枚举
 *
 * @export
 * @enum {number}
 */
export enum CONTROLLER_TYPE {
  /**
   * 报表视图
   */
  REPORT_VIEW = 'report-view',
}

/**
 * 报表类型枚举
 *
 * @export
 * @enum {number}
 */
export enum REPORT_TYPE {
  /**
   * 交叉表
   */
  CROSS_TABLE = ReportEnum.CROSS_TABLE,
  /**
   * 明细表
   */
  SCHEDULE_TABLE = ReportEnum.SCHEDULE_TABLE,
}

/**
 * 报表编辑器类型枚举
 *
 * @export
 * @enum {number}
 */
export enum REPORT_EDITOR_TYPE {
  /**
   * 报表属性配置编辑器
   */
  REPORT_FIELD_CONFIG = 'report-field-config',
  /**
   * 小计配置编辑器
   */
  SUBTOTAL_CONFIG = 'subtotal-config',
  /**
   * 数据筛选条件编辑器
   */
  DATA_RULES_CONFIG = 'data-rules-config',
  /**
   * 自定义计算方式配置
   */
  CUSTOM_CALC_METHOD = 'custom-calc-method',
  /**
   * 排序编辑器
   */
  REPORT_SORTS_EDITOR = 'report-sorts-editor',
  /**
   * 分页选择
   */
  PAGE_SELECTION_CONFIG = 'page-selection-config',
  /**
   * 行列转换编辑器
   */
  ROW_COLUMN_CONVERSION = 'row-column-conversion',
  /**
   * 行高设置编辑器
   */
  ROW_HEIGHT_CONFIG = 'row-height-config',
  /**
   * 报表跳转编辑器
   */
  REPORT_JUMP_CONFIG = 'report-jump-config',
  /**
   * 报表跳转样式编辑器
   */
  REPORT_JUMP_STYLE_CONFIG = 'report-jump-style-config',
  /**
   * 报表钻取编辑器
   */
  REPORT_DRILL_CONFIG = 'report-drill-config',
  /**
   * 报表多级表头
   */
  REPORT_LEVEL_HEADER = 'report-level-header',
}

/**
 * 报表字段拖拽分组标识
 */
export const REPORT_FIELD_DND_GROUP = 'report-field-dnd-group';

/**
 * 属性上下文菜单行为标识
 *
 * @export
 * @enum {number}
 */
export enum MENU_ACTION {
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 修改名称
   */
  CHANGE_NAME = 'change-name',
  /**
   * 签名格式
   */
  CHANGE_SIGNATURE = 'editSignature',
}

/**
 * 报表表格页类型枚举
 *
 * @export
 * @enum {number}
 */
export enum REPORT_TABLE_PAGE_TYPE {
  /**
   * 首行维度
   */
  FIRST_DIMENSION = 'first-dimension',
  /**
   * 所有维度
   */
  ALL_DIMENSION = 'all-dimension',
}

/**
 * 报表跳转类型枚举
 *
 * @export
 * @enum {number}
 */
export enum REPORT_LINK_TYPE {
  /**
   * 跳转报表
   */
  REPORT = 'report',
  /**
   * 跳转链接
   */
  LINK = 'link',
}

/**
 * 报表跳转打开方式
 *
 * @export
 * @enum {number}
 */
export enum REPORT_LINK_OPEN_MODE {
  /**
   * 跳转报表
   */
  MODAL = 'modal',
  /**
   * 新页签打开
   */
  LINK = 'link',
}

// 日期显示格式，当日期类型格式：年
export enum DATE_FORMAT_Y_ENUM {
  YYYY = 'YYYY',
  YYYY年 = 'YYYY年',
  FYYYY = 'FYYYY',
  YYYY财年 = 'YYYY财年',
}

// 日期显示格式，当日期类型格式：年-季度
export enum DATE_FORMAT_Y_Q_ENUM {
  'YYYY-Q季度' = 'YYYY-Q季度',
  YYYYQ = 'YYYYQ',
  'YYYY年第Q季度' = 'YYYY年第Q季度',
  'FYYYY-Q' = 'FYYYY-Q',
  YYYY财年Q = 'YYYY财年Q',
  YYYY财年第Q季度 = 'YYYY财年第Q季度',
}

// 日期显示格式，当日期类型格式：年-月
export enum DATE_FORMAT_Y_M_ENUM {
  'YYYY-MM' = 'YYYY-MM',
  YYYYMM = 'YYYYMM',
  'YYYY/MM' = 'YYYY/MM',
  YYYY年M月 = 'YYYY年M月',
  M月 = 'M月',
}

// 日期显示格式，当日期类型格式：年-月-日
export enum DATE_FORMAT_Y_M_D_ENUM {
  'YYYY-MM-DD' = 'YYYY-MM-DD',
  YYYYMMDD = 'YYYYMMDD',
  'YYYY/MM/DD' = 'YYYY/MM/DD',
  YYYY年M月D日 = 'YYYY年M月D日',
  'MM-DD' = 'MM-DD',
  MMDD = 'MMDD',
  'MM/DD' = 'MM/DD',
  M月D日 = 'M月D日',
}

// 日期显示格式，当日期类型格式：季度
export enum DATE_FORMAT_Q_ENUM {
  Q季度 = 'Q季度',
  第Q季度 = '第Q季度',
}

// 日期显示格式，当日期类型格式：年-月-日-时-分
export enum DATE_FORMAT_Y_M_D_H_M_ENUM {
  'YYYY-MM-DD HH:mm' = 'YYYY-MM-DD HH:mm',
  'YYYYMMDD HH:mm' = 'YYYYMMDD HH:mm',
  'YYYY/MM/DD HH:mm' = 'YYYY/MM/DD HH:mm',
  'YYYY年M月D日 HH:mm' = 'YYYY年M月D日 HH:mm',
  'MM-DD HH:mm' = 'MM-DD HH:mm',
  'MMDD HH:mm' = 'MMDD HH:mm',
  'MM/DD HH:mm' = 'MM/DD HH:mm',
  'M月D日 HH:mm' = 'M月D日 HH:mm',
}

// 日期显示格式，当日期类型格式：年-月-日-时-分-秒
export enum DATE_FORMAT_Y_M_D_H_M_S_ENUM {
  'YYYY-MM-DD HH:mm:ss' = 'YYYY-MM-DD HH:mm:ss',
  'YYYYMMDD HH:mm:ss' = 'YYYYMMDD HH:mm:ss',
  'YYYY/MM/DD HH:mm:ss' = 'YYYY/MM/DD HH:mm:ss',
  'YYYY年M月D日 HH:mm:ss' = 'YYYY年M月D日 HH:mm:ss',
  'MM-DD HH:mm:ss' = 'MM-DD HH:mm:ss',
  'MMDD HH:mm:ss' = 'MMDD HH:mm:ss',
  'MM/DD HH:mm:ss' = 'MM/DD HH:mm:ss',
  'M月D日 HH:mm:ss' = 'M月D日 HH:mm:ss',
}

// 明细表：时间显示格式
export enum TIME_FORMAT_ENUM {
  'HH' = 'HH',
  'HH:mm' = 'HH:mm',
  'HH:mm:ss' = 'HH:mm:ss',
}

// 明细表: 日期显示格式
export enum DATE_FORMAT_ENUM {
  'YYYY-MM-DD' = 'YYYY-MM-DD',
  'YYYYMMDD' = 'YYYYMMDD',
  'YYYY/MM/DD' = 'YYYY/MM/DD',
  'YYYY年M月D日' = 'YYYY年M月D日',
}

// 明细表: 日期时间显示格式
export enum DATE_TIME_FORMAT_ENUM {
  'YYYY-MM-DD HH' = 'YYYY-MM-DD HH',
  'YYYY-MM-DD HH:mm' = 'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD HH:mm:ss' = 'YYYY-MM-DD HH:mm:ss',
  'YYYY/MM/DD HH' = 'YYYY/MM/DD HH',
  'YYYY/MM/DD HH:mm' = 'YYYY/MM/DD HH:mm',
  'YYYY/MM/DD HH:mm:ss' = 'YYYY/MM/DD HH:mm:ss',
  'YYYYMMDD HH' = 'YYYYMMDD HH',
  'YYYYMMDD HH:mm' = 'YYYYMMDD HH:mm',
  'YYYYMMDD HH:mm:ss' = 'YYYYMMDD HH:mm:ss',
  'YYYY年M月D日 HH' = 'YYYY年M月D日 HH',
  'YYYY年M月D日 HH:mm' = 'YYYY年M月D日 HH:mm',
  'YYYY年M月D日 HH:mm:ss' = 'YYYY年M月D日 HH:mm:ss',
}
