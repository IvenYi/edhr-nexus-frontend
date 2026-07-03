import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { randomId } from '@gct/flow/src/utils/NodeGenerator.js';
import { FlowNodeTypeEnum } from '../../../enums';
import { validateName } from '../utils/node-validator.js';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnExclusive> = {},
): GctBpmnNode.BpmnExclusive {
  const id = 'Exclusive' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnExclusive;
  const node: GctBpmnNode.BpmnExclusive = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '条件分支',
      type,
    },
    children: [caseIfGenerator(), caseElseGenerator()],
  };
  return node;
};

const caseIfGenerator = function (index?: number): GctBpmnNode.BpmnExclusive['children'][number] {
  return {
    id: 'Case_' + randomId(),
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '条件' + (index || 1),
      type: 'JSON',
    },
    children: [],
  };
};

const caseElseGenerator = function (): GctBpmnNode.BpmnExclusive['children'][number] {
  return {
    id: 'Case_' + randomId() + '_else',
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '否则',
    },
    children: [],
  };
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnApproval): object {
  const { key, name } = node.data!;
  return {
    tag: 'bpmn:exclusiveGateway',
    attrs: {
      id: key,
      name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnExclusive.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, caseIfGenerator, caseElseGenerator, validator };
