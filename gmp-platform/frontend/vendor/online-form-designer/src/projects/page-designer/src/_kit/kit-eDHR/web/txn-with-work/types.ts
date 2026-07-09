export enum E_BUSINESS_TYPE {
  /** 生产作业 */
  PRODUCTION = 'production',
  /** 返工作业 */
  REWORK = 'rework',
  /** 检验作业 */
  INSPECTION = 'inspection',
}

export enum E_BELONG_TYPE {
  /** 批次执行 */
  LOT = 'lot',
  /** SN执行 */
  SN = 'sn',
}

export enum E_FIELD_TYPE {
  /** 批次号 */
  MATERIAL_NO = 'materialNo',
  /** 生产执行批次号 */
  PROD_MATERIAL_NO = 'prodMaterialNo',
  /** 关联批次 */
  RELATED_LOT_NO = 'relatedLotNo',
  /** 工单号 */
  MFG_ORDER_ID = 'mfgOrderId',
  // productionIdentificationId
  /** 生产执行标识号 */
  PRODUCTION_IDENTIFICATION_ID = 'productionIdentificationId',
  /** 状态 */
  STATUS = 'status',
}

export enum E_FORM_APPEND_TYPE {
  /** 建立新表单 */
  CREATE = 'create',
  /** 关联已有表单 */
  BIND = 'bind',
}

export enum E_FORM_OPE_TYPE {
  DHR = 'DHR',
  /** 返工 */
  REWORK = 'REWORK',
  /** 检验 */
  INSPECTION = 'INSPECTION',
  /** 附录：建立新表单 */
  LOT_SN_APPEND = 'LOT_SN_APPEND',
  /** 附录：关联已有表单 */
  LOT_RELATION = 'LOT_RELATION',
}
