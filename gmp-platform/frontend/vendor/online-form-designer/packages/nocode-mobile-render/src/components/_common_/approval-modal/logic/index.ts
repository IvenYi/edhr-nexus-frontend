import {
  ApprovalField,
  ButtonOpinionMode,
  ApprovalSignatureTypeEnum,
  ButtonTypeEnum,
} from '../constant';
import ApprovalModal from '../approval-modal.vue';
import type { IApprovalData, ApprovalModalOptions } from '../types';
import { GctPopup } from '@mobile/utils/popup';

export async function openApprovalModal(
  opts: ApprovalModalOptions,
): Promise<IApprovalData | undefined> {
  return new Promise((resolve) => {
    GctPopup.open(ApprovalModal, {
      opts: opts,
      beforeClose: (data) => {
        resolve(data);
        console.log('beforeClose', data);
      },
    });
  });
}

/**
 * 执行审批操作
 * @author lingxiaoming
 * @date 2024-08-23 11:19:35
 * @export
 * @param {ButtonTypeEnum} operate
 * @return {*}  {(Promise<IApprovalData | undefined | boolean>)}
 */
export async function excApprovalOperate(
  buttonConfig: any,
): Promise<IApprovalData | undefined | boolean> {
  // 处理人员选择字段
  const operate = buttonConfig.type as any;
  const showFields: ApprovalField[] = [];
  const requiredFields: ApprovalField[] = [];
  if ([ButtonTypeEnum.Reassign].includes(operate)) {
    showFields.push(ApprovalField.PERSON);
    requiredFields.push(ApprovalField.PERSON);
  }

  // 处理签名字段和默认的类型
  let signatureType: ApprovalSignatureTypeEnum | undefined = undefined;
  if (buttonConfig.signatureType !== ApprovalSignatureTypeEnum.None) {
    showFields.push(ApprovalField.SIGNATURE);
    requiredFields.push(ApprovalField.SIGNATURE);
    signatureType = buttonConfig.signatureType;
  }

  // 处理审批意见字段
  if (buttonConfig.opinionMode && buttonConfig.opinionMode !== ButtonOpinionMode.Closed) {
    showFields.push(ApprovalField.COMMENT);
    if (buttonConfig.opinionMode === ButtonOpinionMode.Required) {
      requiredFields.push(ApprovalField.COMMENT);
    }
  }

  // 处理显示的标题
  let operateTitle = buttonConfig.alias;
  if (!operateTitle && Object.values(ButtonTypeEnum).includes(operate)) {
    operateTitle = $t(`sys.appDesigner.approval.button.${operate}`);
  }
  const title: string = $t(`sys.appDesigner.approval.buttonModalTitle`, {
    sth: operateTitle,
  });

  if (!showFields.length) {
    return true;
  }

  return openApprovalModal({
    title: title,
    showFields,
    requiredFields,
    signatureType,
  });
}

/**
 * 执行基础表单的操作
 * @author lingxiaoming
 * @date 2024-08-23 11:19:35
 * @export
 * @param {ButtonTypeEnum} operate
 * @return {*}  {(Promise<IApprovalData | undefined| boolean>)}
 */
export async function excBaseButton(
  buttonConfig: any,
): Promise<IApprovalData | undefined | boolean> {
  // 处理人员选择字段
  const showFields: ApprovalField[] = [];
  const requiredFields: ApprovalField[] = [];

  // 处理审批意见字段
  if (buttonConfig.enableMemo) {
    showFields.push(ApprovalField.MEMO);
  }

  // 处理签名字段和默认的类型
  let signatureType: ApprovalSignatureTypeEnum | undefined = undefined;
  if (buttonConfig.signatureType !== ApprovalSignatureTypeEnum.None) {
    showFields.push(ApprovalField.SIGNATURE);
    requiredFields.push(ApprovalField.SIGNATURE);
    signatureType = buttonConfig.signatureType;
  }

  // 处理审批意见字段
  if (buttonConfig.opinionMode && buttonConfig.opinionMode !== ButtonOpinionMode.Closed) {
    showFields.push(ApprovalField.COMMENT);
    if (buttonConfig.opinionMode === ButtonOpinionMode.Required) {
      requiredFields.push(ApprovalField.COMMENT);
    }
  }

  // 处理显示的标题
  const operate: string = buttonConfig.alias || buttonConfig.title;
  const title = $t(`sys.appDesigner.approval.buttonModalTitle`, {
    sth: operate,
  });

  if (!showFields.length) {
    return true;
  }

  return openApprovalModal({
    title: title,
    showFields,
    requiredFields,
    signatureType,
  });
}
