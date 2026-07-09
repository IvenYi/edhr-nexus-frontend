import {
  BpmnNodeTypeEnum,
  ButtonOpinionMode,
  ButtonTypeEnum,
  SignatureTypeEnum,
} from '@gct/flow/src/plugins/bpmn/enums';
import { ApprovalEvent } from '/@online-form/approval';
import { pick } from 'lodash-es';

/**
 * 节点类型对应的操作按钮映射
 */
export const NodeTypeOperateButtonMap = {
  [BpmnNodeTypeEnum.BpmnApproval]: [
    { operate: ButtonTypeEnum.Save, label: $t('sys.appDesigner.approval.button.Save') },
    {
      operate: ButtonTypeEnum.Approve,
      label: $t('sys.appDesigner.approval.button.Approve'),
      signatureType: SignatureTypeEnum.Account,
    },
    {
      operate: ButtonTypeEnum.Return,
      label: $t('sys.appDesigner.approval.button.Return'),
      signatureType: SignatureTypeEnum.Account,
      opinionMode: ButtonOpinionMode.Required,
    },
    {
      operate: ButtonTypeEnum.Reassign,
      label: $t('sys.appDesigner.approval.button.Reassign'),
      opinionMode: ButtonOpinionMode.Optional,
    },
  ],
  [BpmnNodeTypeEnum.BpmnSubmit]: [
    { operate: ButtonTypeEnum.Save, label: $t('sys.appDesigner.approval.button.Save') },
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

/**
 * 获取节点支持的事件，根据不同应用会有差别
 * @export
 * @param nodeType
 * @param suiteKey
 * @return {*}
 */
export function getNodeOperateBySuiteKey(nodeType: BpmnNodeTypeEnum, suiteKey: string) {
  const operateList = [...(NodeTypeOperateButtonMap[nodeType] || [])];
  if (suiteKey === 'MEDPRO' && nodeType === BpmnNodeTypeEnum.BpmnSubmit) {
    operateList.splice(1, 0, {
      operate: ButtonTypeEnum.PartialSubmit,
      label: $t('sys.appDesigner.approval.button.PartialSubmit'),
    });
  }
  return operateList;
}

/**
 * 处理不同应用的流程表单内置按钮配置
 * - 缺的内置配置补全
 * - 不该显示的内置配置删除
 * @export
 * @param btnConfigs 存储的按钮配置
 * @param suiteKey 应用标识
 * @return {*}
 */
export function handleBuiltinButtonConfig(opts: {
  btnConfigs: any[];
  suiteKey: string;
  nodeType: BpmnNodeTypeEnum;
}) {
  const { btnConfigs, suiteKey, nodeType } = opts;
  const nodeOperateList = getNodeOperateBySuiteKey(nodeType, suiteKey);

  // const allowTypes = nodeOperateList.map((item) => item.operate);
  let arr: any[] = [];
  const hasBuiltInMap: any = {};
  btnConfigs.forEach((item) => {
    if (item.isCustom) {
      // 非内置按钮直接添加
      arr.push(item);
    } else {
      // 已有的内置按钮临时存一下
      hasBuiltInMap[item.type] = item;
    }
  });

  const allowBtns = nodeOperateList.map((item) => {
    const type = item.operate;
    if (hasBuiltInMap[type]) {
      return hasBuiltInMap[type];
    }
    return {
      type,
      enable: true,
      signatureType: SignatureTypeEnum.None,
      isCustom: false,
      ...pick(item, ['signatureType', 'opinionMode']),
    };
  });

  // 补全支持的内置按钮里面没有的
  arr = [...allowBtns, ...arr];
  return arr;
}
