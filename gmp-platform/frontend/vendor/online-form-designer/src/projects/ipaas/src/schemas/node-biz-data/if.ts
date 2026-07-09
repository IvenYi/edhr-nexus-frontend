import type { NodeBizDataSchema } from '../../types';
import { FlowNodeTypeEnum } from '@gct/flow';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
  MetaTypeEnum,
  OperatorEnum,
} from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.If = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.if,
  nodeConfig: {
    whenDefinition: [
      [
        {
          left: '',
          right: '',
          metaType: MetaTypeEnum.String,
          operator: OperatorEnum.EQ,
        },
      ],
    ],
  },
};
