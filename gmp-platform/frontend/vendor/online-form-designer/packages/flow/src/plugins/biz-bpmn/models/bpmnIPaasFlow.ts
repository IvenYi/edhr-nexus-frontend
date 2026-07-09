import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validatePushMessage, validateOnlineForm } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnIPassFlow> = {},
): GctBpmnNode.BpmnIPassFlow {
  const id = 'Activity_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnIPassFlow;
  const node: GctBpmnNode.BpmnIPassFlow = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnIPassFlow,
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

const bpmnTransformer = function (node: GctBpmnNode.BpmnIPassFlow): object {
  const { data } = node;
  return {
    tag: 'bpmn:receiveTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnIPaasFlow.vue'));

const validator = [validateName, validatePushMessage, validateOnlineForm];

export { generator, bpmnTransformer, nodeView, validator };
