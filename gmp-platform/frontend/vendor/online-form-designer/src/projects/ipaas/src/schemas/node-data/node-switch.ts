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
import { NodeBizDataConstant } from '/@ipaas/schemas/node-biz-data/switch';

export const NodeDataConstant: NodeDataSchema.Switch = {
  fNode: FlowNodeTypeEnum.Switch,
  step: PanelStep.Branch,
  bizData: NodeBizDataConstant,
};
