import type { NodeBizDataSchema } from '../../types';
import { EndpointType, ResponseParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.ApiResponse = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.apiResponse,
  nodeConfig: {
    responseParamType: ResponseParamType.JSON,
    headerParameters: [],
    body: [],
  },
};
