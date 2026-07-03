import type { NodeBizDataSchema } from '../../types';
import {
  EndpointType,
  RequestMethod,
  ResponseMethod,
} from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.Webhook = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.webhook,
  nodeConfig: {
    requestMethod: RequestMethod.GET,
    path: '',
    responseMethod: ResponseMethod.SYNC,
    // headerParameters: [],
    // queryParameters: [],
    // body: [],
    // outputBody: [],
    // metaHeader: '',
    // metaQuery: '',
    // metaBody: '',
    // metaUri: '',
  },
};
