import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum } from '../enums/index.ts';
// import { validateTrigger } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnTrigger> = {}): GctBpmnNode.BpmnTrigger {
  const id = 'TRIG' + randomId(12);
  const type = BpmnNodeTypeEnum.BpmnTrigger;
  const node: GctBpmnNode.BpmnTrigger = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnTrigger,
    data: {
      key: id,
      bizData: {
        nodeId: id,
      },
      ...opts.data,
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnTrigger): object {
  const { data } = node;
  return {
    // tag: 'bpmn:userTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(
  () => import('@gct/flow/src/plugins/ipaas-bpmn/views/Trigger.vue'),
);

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
