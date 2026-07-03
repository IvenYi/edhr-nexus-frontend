import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum, EndpointType, ResponseParamType } from '../enums/index.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';
// import { validResponseParamType } from '../utils/node-validator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnApiResponse> = {},
): GctBpmnNode.BpmnApiResponse {
  const id = 'APIRES' + randomId(10);
  const type = BpmnNodeTypeEnum.BpmnApiResponse;
  const node: GctBpmnNode.BpmnApiResponse = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnApiResponse,
    data: {
      key: id,
      bizData: {
        nodeId: id,
        endpointType: EndpointType.apiResponse,
        nodeConfig: {
          responseParamType: ResponseParamType.JSON,
          headerParameters: [],
          body: [],
        },
      },
      ...opts.data,
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnTrigger): object {
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
  () => import('@gct/flow/src/plugins/ipaas-bpmn/views/ApiResponse.vue'),
);

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
