import type { IGctBpmnNode, GctBpmnNode, ICase } from '../types';
import { BpmnNodeTypeEnum, CaseOperatorEnum } from '../enums';

type ValidateFn = (node: IGctBpmnNode) => string | string[] | undefined;
export const validateName: ValidateFn = (node) => {
  const { name } = node.data;
  if (!name) {
    return $t('sys.notEmptySth', { sth: $t('sys.appDesigner.approval.nodeName') });
  }
};

export const validateMsgTmpl: ValidateFn = (node: IGctBpmnNode) => {
  const { msgTmplKey } = node.data;
  if (!msgTmplKey) {
    return $t('sys.notEmptySth', { sth: $t('sys.model.message_tmpl') });
  }
};

export const validateTargetUserConfig: ValidateFn = (node: IGctBpmnNode) => {
  const { targetUserConfig } = node.data;
  if (!targetUserConfig) {
    return $t('sys.notEmptySth', { sth: $t('sys.onlineForm.noticeUsers') });
  }
};

export const validateService: ValidateFn = (node: IGctBpmnNode) => {
  const { events } = node.data;
  if (!events || !events.length) {
    return $t('sys.notEmptySth', { sth: $t('sys.script') });
  }
};

export const validateOpinionType: ValidateFn = (node: IGctBpmnNode) => {
  const { enabled, opinionType } = node.data.opinionConfig ?? {};
  if (enabled && !opinionType) {
    return $t('sys.notEmptySth', { sth: $t('sys.appDesigner.approval.opinion') });
  }
};

export const validateEvents: ValidateFn = (node: IGctBpmnNode) => {
  const { events } = node.data;
  const hasError = events?.some((e) => {
    const { key, executeResourceId, executeResourceConfig } = e;
    return !key || !executeResourceId || !executeResourceConfig;
  });
  if (hasError) {
    return $t('sys.bpmn.nodeEventError');
  }
};

const _validateCase = (value: ICase) => {
  value.elements.forEach((e) => {
    if (e.type === 'condition') {
      const { operator, lValue, rValue } = e.element;
      if ([CaseOperatorEnum.IS_NULL, CaseOperatorEnum.IS_NOT_NULL].includes(operator)) {
        if (!lValue) {
          throw new Error($t('sys.bpmn.conditionError'));
        }
      } else {
        if (!lValue || ['', undefined, null].includes(rValue)) {
          throw new Error($t('sys.bpmn.conditionError'));
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
    tips.push($t('sys.notEmptySth', { sth: $t('sys.appDesigner.approval.caseName') }));
  }
  if (type === 'FORMULA' && !formula?.exp) {
    tips.push($t('sys.notEmptySth', { sth: $t('sys.appDesigner.formulaExpress') }));
  } else if (type === 'JSON' && !json?.dataRule) {
    tips.push($t('sys.notEmptySth', { sth: $t('sys.process.fieldCondition') }));
  }
  return tips;
};

export const validateOnlineForm: ValidateFn = (node: IGctBpmnNode) => {
  const { onlineFormTmplId } = node.data ?? {};
  if (!onlineFormTmplId) {
    return $t('sys.notEmptySth', { sth: $t('sys.model.online_form') });
  }
};

export const validatePushMessage: ValidateFn = (node: IGctBpmnNode) => {
  const { builtinMsgEnabled, msgTmplKey, msgReceiverConfig } = node.data ?? {};
  const msg: string[] = [];
  if (builtinMsgEnabled && !msgTmplKey) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.model.message_tmpl') }));
  }
  if (builtinMsgEnabled && !msgReceiverConfig) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.process.messagePusher') }));
  }
  return msg;
};

export const validateBizDoc: ValidateFn = (node: IGctBpmnNode) => {
  const { onlineFormTmplId } = node.data ?? {};
  const msg: string[] = [];
  if (!onlineFormTmplId) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.edhr.bizDocument') }));
  }
  return msg;
};

export const validateBizOptionConfig: ValidateFn = (node: IGctBpmnNode) => {
  const { bizCompId } = node.data ?? {};
  const msg: string[] = [];
  if (!bizCompId) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.edhr.bizComp') }));
  }
  return msg;
};

export const validateTransactionConfig: ValidateFn = (node: IGctBpmnNode) => {
  const { transactionId } = node.data ?? {};
  const msg: string[] = [];
  if (!transactionId) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.edhr.materialStatus.TXN') }));
  }
  return msg;
};

export const validateLabelRules: ValidateFn = (node: IGctBpmnNode) => {
  const { labelParsingRules } = node.data ?? {};
  const msg: string[] = [];
  if (!labelParsingRules) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.edhr.labelParsingRules') }));
  }
  return msg;
};

export const validateLabelPrintNode: ValidateFn = (node: IGctBpmnNode) => {
  const { printTmplId, printService, printNumber, templateType } = node.data ?? {};
  const msg: string[] = [];
  if (!printTmplId) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.pageDesigner.labelTemplateRef') }));
  }
  if (templateType === 'zpl' && !printService) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.pageDesigner.printService') }));
  }
  if (!printNumber) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.pageDesigner.printNumber') }));
  }
  return msg;
};
