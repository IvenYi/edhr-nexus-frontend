import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnJoin> = {}): GctBpmnNode.BpmnJoin {
  const id = 'Gateway' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnJoin;
  const node: GctBpmnNode.BpmnJoin = {
    ...opts,
    id,
    type,
    allowDelete: false,
    data: {
      key: id,
      name: '聚合节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnJoin): object {
  const { data } = node;
  return {
    tag: 'bpmn:inclusiveGateway',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnJoin.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
