import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateEvents, validatePermGroups } from '../utils/node-validator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnSubmit> = {}): GctBpmnNode.BpmnSubmit {
  const id = '__initiator__';
  const type = BpmnNodeTypeEnum.BpmnSubmit;
  const node: GctBpmnNode.BpmnSubmit = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnSubmit,
    data: {
      key: id,
      name: '开始',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnStart): object {
  const { data } = node;
  return {
    tag: 'bpmn:userTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnStart.vue'));

const validator = [validateName, validateEvents, validatePermGroups];

export { generator, bpmnTransformer, nodeView, validator };
