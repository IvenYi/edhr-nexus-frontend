import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '../../../enums';
import { validateName } from '../utils/node-validator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnParallel> = {},
): GctBpmnNode.BpmnParallel {
  const id = 'Parallel' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnParallel;
  const node: GctBpmnNode.BpmnParallel = {
    ...opts,
    id,
    type,
    allowNext: false,
    data: {
      key: id,
      name: '并行节点',
      type,
    },
    children: [caseGenerator(), caseGenerator()],
  };
  return node;
};

const caseGenerator = function (): GctBpmnNode.BpmnParallel['children'][number] {
  return {
    id: 'Case_' + randomId(),
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '分支',
    },
    children: [],
  };
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnParallel): object {
  const { key, name } = node.data!;
  return {
    tag: 'bpmn:parallelGateway',
    attrs: {
      id: key,
      name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnParallel.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, caseGenerator, validator };
