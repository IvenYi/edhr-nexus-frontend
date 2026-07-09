/**
 * 数据源模式
 *
 * @export
 * @enum {number}
 */
export enum SourceModeEnum {
  // 实体
  ENTITY = 'entity',
  // 视图
  VIEW = 'view',
  // 表单
  FORM = 'form',
  // 系统
  SYSTEM = 'system',
}

/**
 * 报表数据源设计步骤
 *
 * @export
 * @enum {number}
 */
export enum ReportDataSetStep {
  /**
   * 模型配置
   */
  MODEL_CONFIG = 'model-config',
  /**
   * 字段配置
   */
  FIELD_CONFIG = 'field-config',
}

/**
 * SQL 连接模式
 *
 * @export
 * @enum {number}
 */
export enum SqlLinkModeEnum {
  // 内连接
  INNER = 'INNER',
  // 左连接
  LEFT = 'LEFT',
  // 右连接
  RIGHT = 'RIGHT',
  // 全连接
  FULL = 'FULL',
}

/**
 * 报表数据源设计步骤（BI）
 *
 * @export
 * @enum {number}
 */
export enum ReportDataSetStepBI {
  /**
   * 模型配置
   */
  MODEL_CONFIG = 'model-config',
  /**
   * 字段配置
   */
  FIELD_CONFIG = 'field-config',
  /**
   * 数据集配置
   */
  DATASET_CONFIG = 'dataset-config',
}

