import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validatePushMessage, validateOnlineForm } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnForm> = {}): GctBpmnNode.BpmnForm {
  const id = 'Activity_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnForm;
  const node: GctBpmnNode.BpmnForm = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnForm,
    data: {
      key: id,
      name: '表单节点',
      type,
      builtinMsgEnabled: 0,
      msgReceiverConfig: '',
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnForm): object {
  const { data } = node;
  return {
    tag: 'bpmn:receiveTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnForm.vue'));

const validator = [validateName, validatePushMessage, validateOnlineForm];

export { generator, bpmnTransformer, nodeView, validator };
