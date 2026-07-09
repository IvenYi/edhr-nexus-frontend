import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnReceiveTask> = {},
): GctBpmnNode.BpmnReceiveTask {
  const id = 'Receive_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnReceiveTask;
  const node: GctBpmnNode.BpmnReceiveTask = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnReceiveTask,
    data: {
      key: id,
      name: 'receiceTask节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnReceiveTask): object {
  const { data } = node;
  return {
    tag: 'bpmn:receiveTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnBusiness.vue'));

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
