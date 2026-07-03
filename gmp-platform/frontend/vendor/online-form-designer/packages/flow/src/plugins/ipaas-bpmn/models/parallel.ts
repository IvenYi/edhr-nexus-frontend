import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum, EndpointType } from '../enums/index.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '../../../enums/index.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnParallel> = {},
): GctBpmnNode.BpmnParallel {
  const id = 'PAR' + randomId(13);
  const type = BpmnNodeTypeEnum.BpmnParallel;
  const node: GctBpmnNode.BpmnParallel = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      bizData: {
        nodeId: id,
      },
      type,
    },
    children: [caseGenerator(), caseGenerator()],
  };
  return node;
};

const caseGenerator = function (): GctBpmnNode.BpmnParallel['children'][number] {
  const caseId = 'CASE' + randomId(12);
  return {
    id: caseId,
    type: FlowNodeTypeEnum.Flow,
    data: {
      bizData: {
        nodeId: caseId,
        nodeName: '分支',
        nodeDescription: caseId,
        endpointType: EndpointType.pipeline,
      },
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

const nodeView = defineAsyncComponent(() => import('../views/Parallel.vue'));

const validator = [];

export { generator, bpmnTransformer, nodeView, caseGenerator, validator };
