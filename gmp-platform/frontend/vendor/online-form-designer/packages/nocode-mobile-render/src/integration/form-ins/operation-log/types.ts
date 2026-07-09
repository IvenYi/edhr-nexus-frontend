export interface OpLogField {
  subFields?: OpLogField[];
  field: string;
  fieldName: string;
  fieldType: string;
  operationType: string;
  beforeValue: string;
  afterValue: string;
}

export enum ProcDefType {
  /** 电子表单审批 */
  OF_APPROVE = 'OF_APPROVE',
  /** 文控审批 */
  DOC_CONTROL_APPROVE = 'DOC_CONTROL_APPROVE',
}

/** 后台提交类型 */
export enum ChangeType {
  Form = 'Form',
  Resubmit = 'Resubmit',
  Abandon = 'Abandon',
}
