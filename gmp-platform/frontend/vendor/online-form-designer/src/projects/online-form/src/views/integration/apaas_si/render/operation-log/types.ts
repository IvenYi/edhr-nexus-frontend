import { FIELD_TYPE } from '@gct/runtime';

export interface OpLogField {
  subFields?: OpLogField[];
  field: string;
  fieldName: string;
  fieldType: FIELD_TYPE;
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
