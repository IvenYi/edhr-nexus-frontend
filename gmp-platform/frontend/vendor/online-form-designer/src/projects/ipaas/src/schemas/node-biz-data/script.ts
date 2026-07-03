import type { NodeBizDataSchema } from '../../types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.Script = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.script,
  nodeConfig: {
    arguments: [],
    tsCode: '',
    script: '',
    returnKeys: [],
  },
};
