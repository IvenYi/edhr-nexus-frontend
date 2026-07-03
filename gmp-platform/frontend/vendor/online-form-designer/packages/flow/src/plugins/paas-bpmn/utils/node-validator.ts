import type { IGctBpmnNode, GctBpmnNode, ICase } from '../types';
import { BpmnNodeTypeEnum, CaseOperatorEnum } from '../enums';

type ValidateFn = (node: IGctBpmnNode) => string | string[] | undefined;
export const validateName: ValidateFn = (node) => {
  const { name } = node.data;
  if (!name) {
    return '节点名称不能为空';
  }
};

export const validateMsgTmpl: ValidateFn = (node: IGctBpmnNode) => {
  const { msgTmplKey } = node.data;
  if (!msgTmplKey) {
    return '消息模板不能为空';
  }
};

export const validateService: ValidateFn = (node: IGctBpmnNode) => {
  const { events } = node.data;
  if (!events || !events.length) {
    return '脚本不能为空';
  }
};

export const validateOpinionType: ValidateFn = (node: IGctBpmnNode) => {
  const { enabled, opinionType } = node.data.opinionConfig ?? {};
  if (enabled && !opinionType) {
    return '审批意见不能为空';
  }
};

export const validateEvents: ValidateFn = (node: IGctBpmnNode) => {
  const { events } = node.data;
  const hasError = events?.some((e) => {
    const { key, executeResourceId, executeResourceConfig } = e;
    return !key || !executeResourceId || !executeResourceConfig;
  });
  if (hasError) {
    return '节点事件配置有误';
  }
};

const _validateCase = (value: ICase) => {
  value.elements.forEach((e) => {
    if (e.type === 'condition') {
      const { operator, lValue, rValue } = e.element;
      if ([CaseOperatorEnum.IS_NULL, CaseOperatorEnum.IS_NOT_NULL].includes(operator)) {
        if (!lValue) {
          throw new Error('条件规则配置有误');
        }
      } else {
        if (!lValue || ['', undefined, null].includes(rValue)) {
          throw new Error('条件规则配置有误');
        }
      }
    } else {
      _validateCase(e.element);
    }
  });
};

/**
 * 验证条件分支
 * @param flow
 * @returns
 */
export const validateCaseCfg = (flow: GctBpmnNode.BpmnExclusive['children'][number]): string[] => {
  const { name, type, json, formula } = flow.caseCfg;
  const tips: string[] = [];
  if (!name) {
    tips.push('分支名称不能为空');
  }
  if (type === 'FORMULA' && !formula?.exp) {
    tips.push('条件表达式不能为空');
  } else if (type === 'JSON' && !json?.dataRule) {
    tips.push('字段条件不能为空');
  }
  return tips;
};

export const validateOnlineForm: ValidateFn = (node: IGctBpmnNode) => {
  const { onlineFormTmplId } = node.data ?? {};
  if (!onlineFormTmplId) {
    return '在线表单不能为空';
  }
};

export const validatePushMessage: ValidateFn = (node: IGctBpmnNode) => {
  const { builtinMsgEnabled, msgTmplKey, msgReceiverConfig } = node.data ?? {};
  const msg: string[] = [];
  if (builtinMsgEnabled && !msgTmplKey) {
    msg.push('消息模板不能为空');
  }
  if (builtinMsgEnabled && !msgReceiverConfig) {
    msg.push('消息推送人不能为空');
  }
  return msg;
};
