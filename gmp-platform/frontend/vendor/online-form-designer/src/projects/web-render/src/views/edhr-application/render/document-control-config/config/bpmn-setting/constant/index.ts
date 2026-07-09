import { BpmnNodeTypeEnum, ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
import { ApprovalEvent } from '/@online-form/approval';

/**
 * 节点类型对应的操作按钮映射
 */
export const NodeTypeOperateButtonMap = {
  [BpmnNodeTypeEnum.BpmnApproval]: [
    // { operate: ButtonTypeEnum.Save, label: $t('sys.appDesigner.approval.button.Save') },
    { operate: ButtonTypeEnum.Approve, label: $t('sys.appDesigner.approval.button.Approve') },
    { operate: ButtonTypeEnum.Return, label: $t('sys.appDesigner.approval.button.Return') },
    // { operate: ButtonTypeEnum.Reassign, label: $t('sys.appDesigner.approval.button.Reassign') },
  ],
  [BpmnNodeTypeEnum.BpmnSubmit]: [
    // { operate: ButtonTypeEnum.Save, label: $t('sys.appDesigner.approval.button.Save') },
    { operate: ButtonTypeEnum.Submit, label: $t('sys.appDesigner.approval.button.Submit') },
  ],
  [BpmnNodeTypeEnum.BpmnStart]: [
    { operate: ButtonTypeEnum.Save, label: $t('sys.appDesigner.approval.button.Save') },
    { operate: ButtonTypeEnum.Submit, label: $t('sys.appDesigner.approval.button.Submit') },
  ],
  [BpmnNodeTypeEnum.BpmnJudge]: [
    { operate: ButtonTypeEnum.Qualified, label: $t('sys.appDesigner.approval.button.Qualified') },
    {
      operate: ButtonTypeEnum.Unqualified,
      label: $t('sys.appDesigner.approval.button.Unqualified'),
    },
  ],
};

/**
 * 节点类型对应的事件类型映射
 */
export const NodeEventTypesMap = {
  [BpmnNodeTypeEnum.BpmnApproval]: [
    ApprovalEvent.AfterApprove,
    ApprovalEvent.AfterReturn,
    ApprovalEvent.AfterSave,
    ApprovalEvent.AfterReassign,
  ],
  [BpmnNodeTypeEnum.BpmnSubmit]: [ApprovalEvent.AfterSubmit, ApprovalEvent.AfterSave],
  [BpmnNodeTypeEnum.BpmnStart]: [ApprovalEvent.AfterSubmit, ApprovalEvent.AfterSave],
  [BpmnNodeTypeEnum.BpmnEnd]: [ApprovalEvent.AfterEnd],
  [BpmnNodeTypeEnum.BpmnJudge]: [ApprovalEvent.AfterQualified, ApprovalEvent.AfterUnqualified],
};
