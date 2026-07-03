import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum, EndpointType } from '../enums/index.ts';
// import { validateTrigger } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { FlowNodeTypeEnum } from '@gct/flow/src/enums/index.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnLoop> = {}): GctBpmnNode.BpmnLoop {
  const id = 'LOOP' + randomId(12);
  const caseId = 'CASE' + randomId(12);
  const type = BpmnNodeTypeEnum.BpmnLoop;
  const node: GctBpmnNode.BpmnLoop = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnLoop,
    data: {
      key: id,
      bizData: {
        nodeId: id,
      },
      ...opts.data,
      type,
    },
    children: [
      {
        id: caseId,
        type: FlowNodeTypeEnum.Flow,
        data: {
          bizData: {
            nodeId: caseId,
            nodeName: '分支',
            nodeDescription: caseId,
          },
        },
        children: [],
      },
    ],
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnLoop): object {
  const { data } = node;
  return {
    // tag: 'bpmn:userTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(
  () => import('@gct/flow/src/plugins/ipaas-bpmn/views/Loop.vue'),
);

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
