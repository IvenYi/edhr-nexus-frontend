import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeBizDataConstant: NodeBizDataSchema.DoWhile = {
  nodeId: '',
  nodeName: '循环节点',
  nodeDescription: '',
  endpointType: EndpointType.doWhile,
  nodeConfig: {},
};
