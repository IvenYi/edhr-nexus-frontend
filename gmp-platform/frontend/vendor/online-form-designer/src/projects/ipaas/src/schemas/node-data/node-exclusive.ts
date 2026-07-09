import type { NodeDataSchema } from '/@ipaas/types';
import { PanelStep, EndpointType } from '/@ipaas/enums';
import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { GctBpmnNode } from '@gct/flow/src/plugins/ipaas-bpmn/types';

export const NodeDataConstant: NodeDataSchema.Condition = {
  step: PanelStep.Setting,
  type: BpmnNodeTypeEnum.BpmnExclusive,
  bizData: {
    nodeId: '',
    nodeName: '条件节点',
    nodeDescription: '',
    nodeConfig: {},
    endpointType: EndpointType.condition,
  },
};

// export function validator(node: GctBpmnNode.BpmnTrigger) {
//   const { nodeName } = node.data?.bizData || {};
//   if (!nodeName || !nodeName.trim()) {
//     return ['节点名称不能为空'];
//   }
// }
