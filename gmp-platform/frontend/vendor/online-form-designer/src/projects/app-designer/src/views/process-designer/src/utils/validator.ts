import { computed } from 'vue';
import { BpmnElementEnum, BpmnNode, TaskMode, GlobalSetting } from '../types';
import { useI18n } from '/@/hooks/web/useI18n';
import LogicFlow from '@logicflow/core';
import { useAppInfoStore } from '/@/store/modules/app-info';

const { t } = useI18n();
const appInfoStore = useAppInfoStore();
const hasMobile = computed(() => appInfoStore.appInfo.mobileEnabled);

interface Options {
  data: any;
  globaSetting: GlobalSetting;
  lf: LogicFlow;
}

export class BpmnValidator {
  static [BpmnElementEnum.UserTask](payload: Options) {
    const { id, properties } = payload.data;
    const {
      taskMode,
      juel,
      userType,
      userTypeValue,
      formTodo,
      formView,
      mobileFormTodo,
      mobileFormView,
    } = properties as BpmnNode.UserTask;
    if (taskMode && [TaskMode.Competitive, TaskMode.Together].includes(taskMode) && !juel) {
      throw new Error(t('sys.process.validator.juelNotEmpty', { id }));
    }
    if (!userTypeValue) {
      throw new Error(
        t('sys.process.validator.nodePropertyNotEmpty', {
          id,
          prop: t('sys.process.' + userType),
        }),
      );
    }
    if (hasMobile.value) {
      if (!formTodo && !mobileFormTodo) {
        throw new Error(t('sys.process.validator.bothFormTodoNotEmpty', { id }));
      } else if (!formView && !mobileFormView) {
        throw new Error(t('sys.process.validator.bothFormViewNotEmpty', { id }));
      }
    } else {
      if (!formTodo) {
        throw new Error(t('sys.process.validator.formTodoNotEmpty', { id }));
      } else if (!formView) {
        throw new Error(t('sys.process.validator.formViewNotEmpty', { id }));
      }
    }
  }
  static [BpmnElementEnum.ApprovalTask](payload: Options) {
    BpmnValidator[BpmnElementEnum.UserTask](payload);
  }
  static [BpmnElementEnum.SubmitTask](payload: Options) {
    const { id, properties } = payload.data;
    const { formTodo, formView, mobileFormTodo, mobileFormView } = properties as BpmnNode.UserTask;
    if (hasMobile.value) {
      if (!formTodo && !mobileFormTodo) {
        throw new Error(t('sys.process.validator.bothFormTodoNotEmpty', { id }));
      } else if (!formView && !mobileFormView) {
        throw new Error(t('sys.process.validator.bothFormViewNotEmpty', { id }));
      }
    } else {
      if (!formTodo) {
        throw new Error(t('sys.process.validator.formTodoNotEmpty', { id }));
      } else if (!formView) {
        throw new Error(t('sys.process.validator.formViewNotEmpty', { id }));
      }
    }
  }
  static [BpmnElementEnum.BusinessTask](payload: Options) {
    const { id, properties } = payload.data;
    const { service } = properties as BpmnNode.BusinessTask;
    if (!service) {
      throw new Error(t('sys.process.validator.servieNotEmpty', { id }));
    }
  }
  static [BpmnElementEnum.ExclusiveGateway](payload: Options) {
    const { id } = payload.data;
    const rules = payload.globaSetting.rules[id] ?? [];
    if (rules?.length < 2) {
      throw new Error(t('sys.process.validator.rulesMustGe2', { id }));
    }
  }
  static [BpmnElementEnum.SequenceFlow](payload: Options) {
    const { id, sourceNodeId, properties } = payload.data;
    const node = payload.lf?.getNodeDataById(sourceNodeId);
    const { _type_ } = node.properties as any;
    if (
      [BpmnElementEnum.ExclusiveGateway, BpmnElementEnum.ApprovalCateway].includes(_type_) &&
      !properties.rule
    ) {
      throw new Error(t('sys.process.validator.ruleNotEmpty', { id }));
    }
  }
}
