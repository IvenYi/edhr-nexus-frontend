import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { BpmnNodeTypeEnum, EndpointType, PanelStep } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeDataConstant: NodeDataSchema.Script = {
  step: PanelStep.Setting,
  type: BpmnNodeTypeEnum.BpmnScript,
  bizData: {
    endpointType: EndpointType.script,
    nodeId: '',
    nodeName: '脚本',
    nodeDescription: '',
    nodeConfig: {
      arguments: [],
      tsCode: '',
      script: '',
      returnKeys: [],
    },
  },
};
