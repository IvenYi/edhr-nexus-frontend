/**
 * 审批字段
 */
export enum ApprovalField {
  /**
   * 签名
   */
  SIGNATURE = 'signature',
  /**
   * 选择人员
   */
  PERSON = 'person',
  /**
   * 审批意见
   */
  COMMENT = 'comment',
  /**
   * 备注
   */
  MEMO = 'memo',
}

/** 按钮审批意见模式 */
export enum ButtonOpinionMode {
  /** 必填 */
  Required = 'Required',
  /** 非必填  */
  Optional = 'Optional',
  /** 关闭 */
  Closed = 'Closed',
}

/** 按钮审批签名配置类型 */
export enum ApprovalSignatureTypeEnum {
  None = 'None',
  Account = 'Account',
  Handwritten = 'Handwritten',
  Any = 'Any',
}

/**
 * tips: 增加枚举时同步后端增加，该值会作为变量运行在 bpmn 中
 */
export enum ButtonTypeEnum {
  /** 保存 */
  Save = 'Save',
  /** 提交 */
  Submit = 'Submit',
  /** 审核 */
  Approve = 'Approve',
  /** 退回 */
  Return = 'Return',
  /** 转办 */
  Reassign = 'Reassign',
  /** 合格 */
  Qualified = 'Qualified',
  /** 不合格 */
  Unqualified = 'Unqualified',
  /** 流程干预-撤回 */
  // Return4Interfere = 'Return4Interfere',
  /** 表单填报-转办 */
  // Reassign4Interfere = 'Reassign4Interfere',
}
