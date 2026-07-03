import { ApprovalField, ApprovalSignatureTypeEnum } from '../constant';
import type { SignInfo } from '@gct/nocode-mobile-render/components/_common_/sign';

export interface ApprovalModalOptions {
  title: string;
  showFields: ApprovalField[];
  requiredFields: ApprovalField[];
  signatureType?: ApprovalSignatureTypeEnum;
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
