/** 记录类型 */
export enum MaterialStatusEnum {
  /** 批次号 */
  LOT = 'LOT',
  /** SN号 */
  SN = 'SN',
  /** 单据 */
  FORM = 'FORM',
  /** 放行单 */
  PRODUCT_RELEASE = 'PRODUCT_RELEASE',
  /** 关联表单 */
  LOT_SN_APPEND = 'LOT_SN_APPEND',
}

/**
 * 流程状态
 */
export enum ProcessStatusEnum {
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
