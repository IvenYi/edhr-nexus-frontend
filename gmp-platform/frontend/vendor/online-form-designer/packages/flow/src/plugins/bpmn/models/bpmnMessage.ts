import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { validateName, validateTargetUserConfig } from '../utils/node-validator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnMessage> = {}): GctBpmnNode.BpmnMessage {
  const id = 'Msg' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnMessage;
  const node: GctBpmnNode.BpmnMessage = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '消息通知',
      type,
      msgContentConfig: {
        content: '',
        placeholder: [],
        contentName: '',
      },
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnMessage): object {
  const { key, name, taskName } = node.data!;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: key,
      name: name,
      'camunda:expression':
        '${' + (taskName || 'ofSendTaskDelegate') + '.execute(execution,' + `'${key}'` + ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnMessage.vue'));

const validator = [validateName, validateTargetUserConfig];

export { generator, bpmnTransformer, nodeView, validator };
