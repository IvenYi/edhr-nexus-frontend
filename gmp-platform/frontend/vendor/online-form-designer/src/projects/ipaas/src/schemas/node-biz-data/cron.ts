import type { NodeBizDataSchema } from '../../types';
import { FlowNodeTypeEnum } from '@gct/flow';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
  QuartzType,
} from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.Cron = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.scheduleTrigger,
  nodeConfig: {
    quartzType: QuartzType.CRON,
    cronPattern: '',
  },
};
