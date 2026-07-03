import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.Parallel = {
  nodeId: '',
  nodeName: '并行节点',
  nodeDescription: '',
  endpointType: EndpointType.parallel,
  nodeConfig: {},
};
