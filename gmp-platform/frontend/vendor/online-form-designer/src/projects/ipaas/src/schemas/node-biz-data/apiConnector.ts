import { AppTypes } from '../../enums';
import type { NodeBizDataSchema } from '../../types';
import { EndpointType, HttpMethod, ParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.ApiConnector = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.apiConnector,
  appType: AppTypes.External,
  nodeConfig: {
    httpMethod: HttpMethod.GET,
    paramType: ParamType.JSON,
    authId: undefined,
    path: '',
    connectTimeOut: 0,
    encode: 'UTF_8',
    uriParameters: [],
    headerParameters: [],
    queryParameters: [],
    body: [],
  },
};
