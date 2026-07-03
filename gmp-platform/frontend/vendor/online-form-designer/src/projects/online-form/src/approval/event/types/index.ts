import { IModelField } from '/@online-form/components/model-field-select';
import { ApprovalEvent, ApprovalEventAction } from '../constant';
import { SignatureTypeEnum } from '@gct/nocode-base';

/**
 * 流程节点事件的动作配置基础
 */
export interface IApprovalEventActionBase {
  /**
   * 事件类型
   */
  eventType: ApprovalEvent;
  /**
   * 事件动作类型
   */
  actionType: ApprovalEventAction;
}

// /**
//  * 表单字段变化动作
//  */
// export interface IANEAFormFieldChange extends IApprovalEventActionBase {
//   actionType: ApprovalEventAction.FormFieldChange;

//   /**
//    * 变更的表单字段集合
//    */
//   changeFormFields?: Array<{
//     field: IModelField;
//     value: unknown;
//   }>;
// }

/**
 * 填充签名字段动作
 */
export interface IANEAFillSignField extends IApprovalEventActionBase {
  actionType: ApprovalEventAction.FillSignField;

  /** 签名格式 */
  signatureType?: SignatureTypeEnum;

  /**
   * 填充签名字段集合
   */
  fillSignFields?: string[];
}

/**
 * 执行脚本动作
 */
// export interface IANEAExecuteScript extends IApprovalEventActionBase {
//   actionType: ApprovalEventAction.ExecuteScript;

//   /**
//    * 执行方法
//    */
//   executeFn: string;
// }

export type IApprovalEventAction = IANEAFillSignField;

/**
 * 流程节点事件配置
 */
export type IApprovalNodeEvent = {
  eventType?: ApprovalEvent;
  actionType?: ApprovalEventAction;
};
