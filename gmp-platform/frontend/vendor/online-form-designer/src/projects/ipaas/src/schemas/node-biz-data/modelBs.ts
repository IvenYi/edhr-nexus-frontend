import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { AppTypes } from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.ModelBs = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.modelBs,
  appType: AppTypes.Internal,
  nodeConfig: {
    uriParameters: [],
    headerParameters: [],
    queryParameters: [],
    body: [],
    dataType: 'business',
    modelKey: undefined,
    modelCategory: 'entity',
    bsKey: undefined,
    env: undefined,
  },
};
