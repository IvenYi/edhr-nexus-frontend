import type { GctBpmnNode, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { PanelStep, BpmnNodeTypeEnum, EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeDataConstant: NodeDataSchema.Loop = {
  step: PanelStep.Setting,
  type: BpmnNodeTypeEnum.BpmnLoop,
  bizData: {
    endpointType: EndpointType.doWhile,
    nodeId: '',
    nodeName: '循环节点',
    nodeDescription: '',
    nodeConfig: {},
  },
};

export function validator(node: GctBpmnNode.BpmnTrigger) {
  const { nodeName } = node.data?.bizData || {};
  if (!nodeName || !nodeName.trim()) {
    return ['节点名称不能为空'];
  }
}
