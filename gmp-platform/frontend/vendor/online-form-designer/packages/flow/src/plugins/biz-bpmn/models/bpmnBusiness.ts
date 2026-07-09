import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnBusiness> = {},
): GctBpmnNode.BpmnBusiness {
  const id = 'Activity_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnBusiness;
  const node: GctBpmnNode.BpmnBusiness = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '表单隐藏节点',
      type,
      builtinMsgEnabled: 0,
      msgReceiverConfig: '',
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnBusiness): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${formTaskDelegate.execute(execution,' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnBusiness.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
