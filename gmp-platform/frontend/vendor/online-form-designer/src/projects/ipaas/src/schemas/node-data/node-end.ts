import { FlowNodeTypeEnum } from '@gct/flow';
import type { NodeDataSchema } from '/@ipaas/types';
import {
  PanelStep,
  IPaasNodeType,
  EndpointType,
  RequestMethod,
  ResponseMethod,
  ResponseParamType,
} from '/@ipaas/enums';

export const NodeDataConstant = {
  type: FlowNodeTypeEnum.End,
  steps: [PanelStep.Setting],
  data: {
    step: PanelStep.Setting,
    [PanelStep.Setting]: {},
  },
};
