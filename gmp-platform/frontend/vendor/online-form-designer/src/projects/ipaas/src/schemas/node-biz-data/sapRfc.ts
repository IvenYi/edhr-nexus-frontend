import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { AppTypes } from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.SapRfc = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.sapRfc,
  appType: AppTypes.External,
  nodeConfig: {
    authId: undefined,
    platformAppId: '',
    branchId: '',
    env: '',
    functionName: '',
    imports: [],
    tables: [],
  },
};
