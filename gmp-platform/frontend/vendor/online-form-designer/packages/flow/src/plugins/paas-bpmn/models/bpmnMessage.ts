import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateMsgTmpl } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnMessage> = {}): GctBpmnNode.BpmnMessage {
  const id = 'Activity' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnMessage;
  const node: GctBpmnNode.BpmnMessage = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnMessage,
    data: {
      key: id,
      name: '消息通知',
      type,
      msgTmplKey: '',
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnMessage): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression': '${sendTaskDelegate.execute(execution,' + `'${data!.key}'` + ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnMessage.vue'));

const validator = [validateName, validateMsgTmpl];

export { generator, bpmnTransformer, nodeView, validator };
