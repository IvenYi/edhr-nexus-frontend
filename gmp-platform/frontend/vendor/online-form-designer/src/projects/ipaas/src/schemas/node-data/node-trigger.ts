import type { GctBpmnNode, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import {
  PanelStep,
  BpmnNodeTypeEnum,
  EndpointType,
  TriggerType,
  QuartzType,
} from '@gct/flow/src/plugins/ipaas-bpmn/enums';

export const NodeDataConstant: NodeDataSchema.Trigger = {
  step: PanelStep.Trigger,
  type: BpmnNodeTypeEnum.BpmnTrigger,
  triggerType: undefined,
  bizData: {
    nodeId: '',
    nodeName: '',
    nodeDescription: '',
    nodeConfig: {},
  },
};

export function validator(node: GctBpmnNode.BpmnTrigger) {
  const triggerType = node.data?.triggerType;
  if (!triggerType) {
    return ['请选择触发器'];
  }
  const endpointType = node.data?.bizData.endpointType;
  const { requestMethod, responseMethod, cronPattern, quartzType, isValid } =
    node.data?.bizData?.nodeConfig || {};

  if (triggerType && !endpointType) return ['请选择接入方式'];

  const msg: string[] = [];
  if (triggerType === TriggerType.Fixed && endpointType === EndpointType.webhook) {
    if (!requestMethod) msg.push('请选择请求方式');
    if (!responseMethod) msg.push('请选择响应方式');
  }
  if (triggerType === TriggerType.Timed && quartzType === QuartzType.CRON) {
    if (!cronPattern) msg.push('cron表达式不能为空');
    if (cronPattern && cronPattern.trim() && !isValid) msg.push('cron表达式格式错误');
  }
  return msg;
}
