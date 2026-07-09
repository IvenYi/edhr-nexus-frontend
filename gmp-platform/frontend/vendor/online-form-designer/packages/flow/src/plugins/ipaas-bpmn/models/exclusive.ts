import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum, EndpointType } from '../enums/index.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '../../../enums/index.ts';
import { ConditionOperatorEnum, ConditionTypeEnum } from '/@/projects/ipaas/src/enums';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnExclusive> = {},
): GctBpmnNode.BpmnExclusive {
  const id = 'EXC' + randomId(13);
  const type = BpmnNodeTypeEnum.BpmnExclusive;
  const node: GctBpmnNode.BpmnExclusive = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      bizData: {
        nodeId: id,
        nodeName: '条件节点',
        nodeDescription: id,
      },
      type,
    },
    children: [caseIfGenerator(), caseElseGenerator()],
  };
  return node;
};

function caseIfGenerator(): GctBpmnNode.BpmnExclusive['children'][number] {
  const caseId = 'CASE' + randomId(12);
  return {
    id: caseId,
    type: FlowNodeTypeEnum.Flow,
    data: {
      bizData: {
        nodeId: caseId,
        nodeName: '条件',
        endpointType: EndpointType.if,
        nodeDescription: caseId,
        nodeConfig: {
          logicalOperators: 'and',
          elements: [
            {
              type: 'condition',
              element: {
                left: '',
                type: ConditionTypeEnum.String,
                operator: ConditionOperatorEnum.eq,
              },
            },
          ],
        },
      },
    },
    children: [],
  };
}

function caseElseGenerator(): GctBpmnNode.BpmnExclusive['children'][number] {
  const caseId = 'CASE' + randomId(12);
  return {
    id: caseId,
    type: FlowNodeTypeEnum.Flow,
    data: {
      bizData: {
        nodeId: caseId,
        nodeName: '默认条件',
        nodeDescription: caseId,
        endpointType: EndpointType.else,
      },
    },
    children: [],
  };
}

const nodeView = defineAsyncComponent(() => import('../views/Exclusive.vue'));

const validator = [];

export { generator, nodeView, caseIfGenerator, validator };
