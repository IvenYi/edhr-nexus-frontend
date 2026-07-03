import type { NodeBizDataSchema } from '../../types';
import { FlowNodeTypeEnum } from '@gct/flow';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
} from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.Else = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.else,
  nodeConfig: {},
};
