// import LogicFlow from '@logicflow/core';
import StartEvent, { StartEventModel, StartEventView } from './events/StartEvent';
import EndEvent, { EndEventView, EndEventModel } from './events/EndEvent';

import UserTask, { UserTaskView, UserTaskModel } from './tasks/UserTask';
// import ApprovalTask from './tasks/ApprovalTask';
import ServiceTask, { ServiceTaskView, ServiceTaskModel } from './tasks/ServiceTask';
import SequenceFlow, { SequenceFlowView, SequenceFlowModel } from './flow/SequenceFlow';

import ExclusiveGateway, {
  ExclusiveGatewayView,
  ExclusiveGatewayModel,
} from './gateways/ExclusiveGateway';
import InclusiveGateway from './gateways/InclusiveGateway';
import ParallelGateway from './gateways/ParallelGateway';

import { theme } from '../../constants';

// todo: name
class BpmnElement {
  static pluginName = 'bpmnElement';
  constructor({ lf }) {
    lf.setTheme(theme);
    lf.register(StartEvent);
    lf.register(EndEvent);
    lf.register(UserTask);
    // lf.register(ApprovalTask);
    lf.register(ServiceTask);
    lf.register(ExclusiveGateway);
    lf.register(InclusiveGateway);
    lf.register(ParallelGateway);
    // 支持自定义bpmn元素的边
    if (!lf.options.customBpmnEdge) {
      lf.register(SequenceFlow);
      lf.setDefaultEdgeType('bpmn:sequenceFlow');
    }
  }
}

export {
  BpmnElement,
  StartEventModel,
  StartEventView,
  EndEventView,
  EndEventModel,
  ExclusiveGatewayView,
  ExclusiveGatewayModel,
  UserTaskView,
  UserTaskModel,
  ServiceTaskView,
  ServiceTaskModel,
  SequenceFlowView,
  SequenceFlowModel,
};
