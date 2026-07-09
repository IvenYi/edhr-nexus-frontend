import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName } from '../utils/node-validator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnEnd> = {}): GctBpmnNode.BpmnEnd {
  const id = '__end__';
  const type = BpmnNodeTypeEnum.BpmnEnd;
  const node: GctBpmnNode.BpmnEnd = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '结束',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnEnd): object {
  const { data } = node;
  return {
    tag: 'bpmn:endEvent',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnEnd.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
