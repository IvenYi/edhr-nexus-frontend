import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { AppTypes } from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.Platform = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.platform,
  appType: AppTypes.Platform,
  nodeConfig: {
    apiId: '',
    tenantId: '',
    body: [
      {
        key: '*',
        keyType: '',
        value: '',
        valueType: 'EXPRESSION',
      },
    ],
  },
};
