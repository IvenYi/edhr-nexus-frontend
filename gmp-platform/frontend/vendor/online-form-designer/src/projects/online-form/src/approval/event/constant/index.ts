/**
 * 流程事件
 */
export enum ApprovalEvent {
  /**
   * 保存后
   */
  AfterSave = 'AFTER_SAVE',

  /**
   * 提交后
   */
  AfterSubmit = 'AFTER_SUBMIT',

  /**
   * 审核后
   */
  AfterApprove = 'AFTER_APPROVE',

  /**
   * 退回后
   */
  AfterReturn = 'AFTER_RETURN',

  /**
   * 转办后
   */
  AfterReassign = 'AFTER_REASSIGN',

  /**
   * 结束后
   */
  AfterEnd = 'AFTER_END',

  /**
   * 合格后
   */
  AfterQualified = 'AFTER_QUALIFIED',

  /**
   * 不合格后
   */
  AfterUnqualified = 'AFTER_UNQUALIFIED',
}

/**
 * 流程事件动作
 */
export enum ApprovalEventAction {
  // /**
  //  * 表单字段变更
  //  */
  // FormFieldChange = 'form-field-change',

  /**
   * 填充签名字段
   */
  FillSignField = 'fill-sign-field',

  // /**
  //  * 执行脚本
  //  */
  // ExecuteScript = 'execute-script',
}

export const getApprovalEventActionMap = () => {
  return {
    // [ApprovalEventAction.FormFieldChange]: '表单字段变更',
    [ApprovalEventAction.FillSignField]: $t('sys.appDesigner.approval.fillSignField'),
    // [ApprovalEventAction.ExecuteScript]: '执行脚本',
  };
};
