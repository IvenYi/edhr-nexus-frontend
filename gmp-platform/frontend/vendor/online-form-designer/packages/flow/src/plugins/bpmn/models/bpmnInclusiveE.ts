import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnInclusiveE> = {},
): GctBpmnNode.BpmnInclusiveE {
  const id = 'Gateway' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnInclusiveE;
  const node: GctBpmnNode.BpmnInclusiveE = {
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

const bpmnTransformer = function (node: GctBpmnNode.BpmnInclusiveE): object {
  const { key, name } = node.data!;
  return {
    tag: 'bpmn:inclusiveGateway',
    attrs: {
      id: key,
      name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnInclusiveE.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
