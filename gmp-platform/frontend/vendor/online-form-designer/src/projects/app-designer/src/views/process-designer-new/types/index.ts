export interface InitializeOptions {
  container: HTMLElement;
}

export interface RuleItem {
  id: string;
  expr: string;
  title: string;
}

export interface GlobalSetting {
  rules: Record<string, Array<RuleItem> | undefined>; // 用于存放网关规则
  graphData: any; // 图表数据
  formTodo?: string;
  formView?: string;
  mobileFormTodo?: string;
  mobileFormView?: string;
}

/**
 * 元素类型
 */
export enum BpmnElementEnum {
  StartEvent = 'startEvent',
  EndEvent = 'endEvent',
  UserTask = 'userTask',
  SubmitTask = 'submitTask',
  ApprovalTask = 'approvalTask',
  ServiceTask = 'serviceTask',
  ReceiveTask = 'receiveTask',
  BusinessTask = 'businessTask',
  ExclusiveGateway = 'exclusiveGateway',
  ApprovalCateway = 'approvalGateway',
  ParallelGateway = 'parallelGateway',
  InclusiveGateway = 'inclusiveGateway',
  SequenceFlow = 'sequenceFlow',
}

/**
 * 任务模式
 */
export enum TaskMode {
  Competitive = 'Competitive',
  Together = 'Together',
  Sequential = 'Sequential',
}

/**
 * 用户类型
 */
export enum UserType {
  User = 'User',
  DeptManager = 'DeptManager',
  // Role = 'Role',
  ModelUser = 'ModelUser',
  ModelUserSuperior = 'ModelUserSuperior',
  ModelDeptManager = 'ModelDeptManager',
  UserScript = 'UserScript',
}

/**
 * 退回重新提交后审批规则
 */
export enum RollbackRule {
  Step = 'step_by_step',
  Skip = 'skip',
}

export namespace BpmnNode {
  export interface UserTask {
    taskMode?: TaskMode;
    juel?: string;
    userType?: UserType;
    userTypeValue?: string[] | string;
    formTodo?: string;
    formView?: string;
    mobileFormTodo?: string;
    mobileFormView?: string;
    beforeEnter?: string;
    beforeLeave?: string;
  }
  export interface SubmitTask {
    _extends_: 'userTask';
    formTodo?: string;
    formView?: string;
    mobileFormTodo?: string;
    mobileFormView?: string;
  }
  export interface ApprovalTask extends UserTask {
    _extends_: 'userTask';
    rollbackRule?: RollbackRule;
  }
  export interface BusinessTask {
    _extends_: 'serviceTask';
    service?: string;
  }
  export interface ExclusiveGateway {
    rules?: any[];
  }
  export interface ApprovalCateway {
    _extends_: 'exclusiveGateway';
  }
  export interface SequenceFlow {
    rule?: string;
  }
}

export interface BpmnElementProperty {
  [BpmnElementEnum.UserTask]?: BpmnNode.UserTask;
  [BpmnElementEnum.SubmitTask]?: BpmnNode.SubmitTask;
  [BpmnElementEnum.ApprovalTask]?: BpmnNode.ApprovalTask;
  [BpmnElementEnum.BusinessTask]?: BpmnNode.BusinessTask;
  [BpmnElementEnum.ExclusiveGateway]?: BpmnNode.ExclusiveGateway;
  [BpmnElementEnum.ApprovalCateway]?: BpmnNode.ApprovalCateway;
  [BpmnElementEnum.SequenceFlow]?: BpmnNode.SequenceFlow;
}
