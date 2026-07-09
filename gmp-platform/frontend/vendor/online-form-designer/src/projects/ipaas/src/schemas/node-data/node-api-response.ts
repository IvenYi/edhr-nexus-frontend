import type { GctBpmnNode, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { PanelStep, BpmnNodeTypeEnum } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { NodeBizDataConstant } from '/@ipaas/schemas/node-biz-data/apiResponse';

export const NodeDataConstant: NodeDataSchema.ApiResponse = {
  type: BpmnNodeTypeEnum.BpmnApiResponse,
  step: PanelStep.Setting,
  bizData: NodeBizDataConstant,
};

export function validator(node: GctBpmnNode.BpmnTrigger) {
  const { responseParamType } = node.data?.bizData.nodeConfig || {};
  if (!responseParamType) {
    return ['请选择响应类型'];
  }
}
