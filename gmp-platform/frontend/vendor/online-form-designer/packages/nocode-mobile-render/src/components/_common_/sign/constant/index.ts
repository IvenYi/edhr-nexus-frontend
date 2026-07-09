/**
 * 签名格式
 */
export enum SignatureTypeEnum {
  /** 仅签名 */
  SIGNATURE_ONLY = 'signature_only',
  /** 签名及日期 */
  SIGNATURE_DATE = 'signature_date',
  /** 签名及日期时间 */
  SIGNATURE_DATETIME = 'signature_datetime',
}

/**
 * 签名模式
 */
export enum SignMode {
  /**
   * 手写
   */
  HANDWRITING = 'Handwritten',
  /**
   * 用户名密码
   */
  PASSWORD = 'Account',
}

/** 签名显示方式 */
export enum SignShowTypeEnum {
  /** 垂直显示 */
  VERTICAL = 'vertical',
  /** 水平显示 */
  HORIZONTAL = 'horizontal',
}
