import type { IGctBpmnNode, GctBpmnNode, ICase } from '../types';
import { CaseOperatorEnum } from '../enums';

type ValidateFn = (node: IGctBpmnNode) => string | string[] | undefined;
export const validateName: ValidateFn = (node) => {
  const { name } = node.data;
  if (!name) {
    return $t('sys.notEmptySth', { sth: $t('sys.appDesigner.approval.nodeName') });
  }
};

export const validateTargetUserConfig: ValidateFn = (node: IGctBpmnNode) => {
  const { targetUserConfig } = node.data;
  if (!targetUserConfig) {
    return $t('sys.notEmptySth', { sth: $t('sys.onlineForm.noticeUsers') });
  }
};

export const validateOpinionType: ValidateFn = (node: IGctBpmnNode) => {
  const { enabled, opinionType } = node.data.opinionConfig ?? {};
  if (enabled && !opinionType) {
    return $t('sys.notEmptySth', { sth: $t('sys.appDesigner.approval.opinion') });
  }
};

export const validateButtonConfig: ValidateFn = (node: IGctBpmnNode) => {
  if (node.data.buttonConfig?.length) {
    let errorMsg = '';
    node.data.buttonConfig.find((b) => {
      if (b.isCustom && b.type && !/^[a-zA-Z_][a-zA-Z_0-9]?/.test(b.type)) {
        errorMsg = $t('sys.bpmn.cusButtonKeyValidatorMsg');
        return true;
      }
    });
    if (errorMsg) {
      return errorMsg;
    }
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
      const { operator, lValue, rValue, lSubOperator, lSubValue } = e.element;
      if (
        [
          CaseOperatorEnum.IS_NULL,
          CaseOperatorEnum.IS_NOT_NULL,
          CaseOperatorEnum.IS_EMPTY,
          CaseOperatorEnum.IS_NOT_EMPTY,
        ].includes(operator)
      ) {
        if (!lValue) {
          throw new Error($t('sys.bpmn.conditionError'));
        }
      } else if (
        operator === CaseOperatorEnum.FIELD_VALUE &&
        [
          CaseOperatorEnum.IS_NULL,
          CaseOperatorEnum.IS_NOT_NULL,
          CaseOperatorEnum.IS_EMPTY,
          CaseOperatorEnum.IS_NOT_EMPTY,
        ].includes(lSubOperator)
      ) {
        if (!lSubValue) {
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
  } else if (type === 'JSON') {
    try {
      json && _validateCase(json);
    } catch (err) {
      tips.push(err.message);
    }
  }
  return tips;
};

export const validatePermGroups: ValidateFn = (node: IGctBpmnNode) => {
  const { permissionConfig } = node.data;
  const hasError = permissionConfig?.some((e) => {
    const { _isEditing } = e;
    return _isEditing;
  });
  if (hasError) {
    return $t('sys.bpmn.permGroupNotSaved');
  }
};

export const validateTransactionConfig: ValidateFn = (node: IGctBpmnNode) => {
  const { transactionId } = node.data ?? {};
  const msg: string[] = [];
  if (!transactionId) {
    msg.push($t('sys.notEmptySth', { sth: $t('sys.edhr.materialStatus.TXN') }));
  }
  return msg;
};
