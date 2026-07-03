/**
 * 流程状态
 */
export enum MbProcessStatusEnum {
  /** 作废状态 */
  ABANDON = 'ABANDON',
  /** 未填报 */
  UNFILLED = 'UNFILLED',
  /** 已填报 */
  FILLED = 'FILLED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 进行中 */
  RUNNING = 'RUNNING',
  /** 暂存 */
  STASH = 'STASH',
  /** 待放行 */
  UNRELEASED = 'UNRELEASED',
  /** 放行中 */
  RELEASE = 'RELEASE',
  /** 异常 */
  EXCEPTION = 'EXCEPTION',
}

/** eDHR实例状态 */
export enum MbEdhrInstanceStatusEnum {
  /** 未填报 */
  UNFILLED = 'UNFILLED',
  /** 进行中 */
  RUNNING = 'RUNNING',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已归档 */
  ARCHIVED = 'ARCHIVED',
}

export enum MATERIAL_STATUS_ENUM {
  /**
   * 批次生产
   */
  LOT = 'LOT',
  /**
   * SN生产
   */
  SN = 'SN',
}

export enum TASK_TYPE__ENUM {
  /**
   * 返工
   */
  REWORK = 'rework',
  /**
   * 生产
   */
  PRODUCTION = 'production',
}
