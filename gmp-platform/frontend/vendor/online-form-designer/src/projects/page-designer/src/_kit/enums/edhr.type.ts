export enum E_TXN_MODULE {
  /** 生产作业 */
  PRODUCTION = 'PRODUCTION',
  /** 检验作业 */
  INSPECTION = 'INSPECTION',
  /** 放行作业 */
  RELEASE = 'RELEASE',
  /** 仓储作业 */
  STOCK = 'STOCK',
}

export enum E_EXECUTE_TYPE {
  /** 生产 */
  PRODUCTION = 'production',
  /** 返工 */
  REWORK = 'rework',
}

export enum E_PRODUCT_MODALITY {
  /** 批次 */
  CONTAINER = 'container',
  /** SN */
  SN = 'sn',
}
