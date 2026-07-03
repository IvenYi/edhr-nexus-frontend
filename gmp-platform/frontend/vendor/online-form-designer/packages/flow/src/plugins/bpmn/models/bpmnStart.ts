import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';

const generator = function (opts: Partial<GctBpmnNode.BpmnStart> = {}): GctBpmnNode.BpmnStart {
  const id = '__start__';
  const type = BpmnNodeTypeEnum.BpmnStart;
  const node: GctBpmnNode.BpmnStart = {
    ...opts,
    id,
    type,
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
    tag: 'bpmn:startEvent',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnStart.vue'));

export { generator, bpmnTransformer, nodeView };
