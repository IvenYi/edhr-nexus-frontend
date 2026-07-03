import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum, CaseOperatorEnum, CaseValueType, CaseValueSource } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '../../../enums';
import { validateName } from '../utils/node-validator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnParallelReal> = {},
): GctBpmnNode.BpmnParallelReal {
  const id = 'Gateway' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnParallelReal;
  const node: GctBpmnNode.BpmnParallelReal = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '并行分支',
      type,
    },
    children: [caseGenerator(), caseGenerator()],
  };
  return node;
};

const DefaultCaseElement = {
  type: CaseValueType.String,
  operator: CaseOperatorEnum.EQ,
  lType: CaseValueSource.Model,
  rType: CaseValueSource.Manual,
};

const caseGenerator = function (): GctBpmnNode.BpmnParallel['children'][number] {
  return {
    id: 'Case_' + randomId(),
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '条件',
    },
    children: [],
  };
};

const caseElseGenerator = function (): GctBpmnNode.BpmnParallelReal['children'][number] {
  return {
    id: 'Case_' + randomId() + '_else',
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '否则',
    },
    children: [],
  };
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnParallelReal): object {
  const { key, name } = node.data!;
  return {
    tag: 'bpmn:inclusiveGateway',
    attrs: {
      id: key,
      name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnParallelReal.vue'));

const validator = [validateName];

export {
  generator,
  bpmnTransformer,
  nodeView,
  caseGenerator,
  caseElseGenerator,
  DefaultCaseElement,
  validator,
};
