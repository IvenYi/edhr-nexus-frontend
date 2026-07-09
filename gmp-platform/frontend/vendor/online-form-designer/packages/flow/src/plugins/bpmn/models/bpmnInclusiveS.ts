import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum, CaseOperatorEnum, CaseValueType, CaseValueSource } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '../../../enums';
import { validateName } from '../utils/node-validator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnInclusiveS> = {},
): GctBpmnNode.BpmnInclusiveS {
  const id = 'Gateway' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnInclusiveS;
  const node: GctBpmnNode.BpmnInclusiveS = {
    ...opts,
    id,
    type,
    allowNext: false,
    data: {
      key: id,
      name: '并行分支',
      type,
    },
    children: [caseIfGenerator(), caseElseGenerator()],
  };
  return node;
};

const DefaultCaseElement = {
  type: CaseValueType.String,
  operator: CaseOperatorEnum.EQ,
  lType: CaseValueSource.Model,
  rType: CaseValueSource.Manual,
};

const caseIfGenerator = function (): GctBpmnNode.BpmnInclusiveS['children'][number] {
  return {
    id: 'Case_' + randomId(),
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '条件',
      type: 'JSON',
      json: {
        logicalOperators: 'and',
        elements: [
          {
            type: 'condition',
            element: {
              ...DefaultCaseElement,
            },
          },
        ],
      },
    },
    children: [],
  };
};

const caseElseGenerator = function (): GctBpmnNode.BpmnInclusiveS['children'][number] {
  return {
    id: 'Case_' + randomId(),
    type: FlowNodeTypeEnum.Flow,
    caseCfg: {
      name: '否则',
    },
    children: [],
  };
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnInclusiveS): object {
  const { key, name } = node.data!;
  return {
    tag: 'bpmn:inclusiveGateway',
    attrs: {
      id: key,
      name,
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnInclusiveS.vue'));

const validator = [validateName];

export {
  generator,
  bpmnTransformer,
  nodeView,
  caseIfGenerator,
  caseElseGenerator,
  DefaultCaseElement,
  validator,
};
