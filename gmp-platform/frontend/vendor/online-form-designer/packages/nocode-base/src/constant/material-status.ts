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
  /** 事务 */
  TXN = 'TXN',
  /** DHR表单 */
  DHR = 'DHR',
  /** 记录本 */
  NOTEBOOK = 'NOTEBOOK',
  /** 返工 */
  REWORK = 'REWORK',
}
// 查询类型(我的单据填报:UNFILLED,我创建的:CREATED ,我已填单据:COMPLETED)
export enum FillingTypeEnum {
  UNFILLED = 'UNFILLED',
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
}
