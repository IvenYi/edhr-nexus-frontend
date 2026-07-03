import { ApprovalField } from '../constant';
import { SignInfo } from '/@/components/Signature';
import { SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

export interface ApprovalModalOptions {
  title: string;
  showFields: ApprovalField[];
  requiredFields: ApprovalField[];
  signatureType?: SignatureTypeEnum;
}

export interface IApprovalData {
  /**
   * 备注
   */
  [ApprovalField.MEMO]?: string;
  /**
   * 审批意见
   */
  [ApprovalField.COMMENT]?: string;
  /**
   * 选择人员
   */
  [ApprovalField.PERSON]?: string;
  /**
   * 签名信息
   */
  [ApprovalField.SIGNATURE]?: SignInfo;
}
