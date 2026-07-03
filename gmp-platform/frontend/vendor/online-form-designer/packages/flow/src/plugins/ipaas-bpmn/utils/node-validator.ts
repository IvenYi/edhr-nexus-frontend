import type { IGctBpmnNode, GctBpmnNode, ICase } from '../types';
import { BpmnNodeTypeEnum } from '../enums';

type ValidateFn = (node) => string | string[] | undefined;

export const validateTrigger: ValidateFn = (node: GctBpmnNode.BpmnTrigger) => {
  const { triggerType } = node.data || {};
  if (!triggerType) {
    return '请选择触发器';
  }
};

/**
 * 验证条件分支
 * @param flow
 * @returns
 */
export const validateCaseCfg = (flow: GctBpmnNode.BpmnExclusive['children'][number]): string[] => {
  const { nodeName } = flow.data.bizData;
  const tips: string[] = [];
  if (!nodeName) {
    tips.push('条件名称不能为空');
  }
  return tips;
};
