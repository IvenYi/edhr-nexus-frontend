import { BpmnElementEnum, TaskMode, UserType, BpmnElementProperty, RollbackRule } from '../types';

export const JUEL_PRESET = [
  '${nrOfCompletedInstances == 1}',
  '${nrOfCompletedInstances == nrOfInstances}',
];

export const BaseEventConfig = {
  width: 40,
  height: 40,
};
export const BaseTaskConfig = {
  width: 100,
  height: 56,
};
export const BaseGatewayConfig = {
  width: 60,
  height: 60,
};

export const StartEventConfig = BaseEventConfig;
export const EndEventConfig = BaseEventConfig;

export const theme = {
  rect: {
    radius: 4,
    stroke: '#7F8695',
  },
  circle: {
    r: 18,
    stroke: '#7F8695',
  },
  polygon: {
    stroke: '#7F8695',
  },
  polyline: {
    stroke: '#7F8695',
    hoverStroke: '#7F8695',
    selectedStroke: '#7F8695',
  },
  edgeText: {
    background: {
      fill: 'white',
      height: 14,
      stroke: 'transparent',
      radius: 3,
    },
  },
};

export const PatternGroupList: Array<{
  type: string;
  name: string;
  nameI18n: string;
  nodes: any[];
}> = [
  {
    type: 'task',
    name: '节点',
    nameI18n: 'sys.process.node',
    nodes: [
      // BpmnElementEnum.StartEvent,
      // BpmnElementEnum.EndEvent,
      // BpmnElementEnum.SubmitTask,
      BpmnElementEnum.UserTask,
      BpmnElementEnum.ApprovalTask,
      BpmnElementEnum.BusinessTask,
    ],
  },
  {
    type: 'gateway',
    name: '网关',
    nameI18n: 'sys.process.gateway',
    nodes: [
      BpmnElementEnum.ExclusiveGateway,
      BpmnElementEnum.ApprovalCateway,
      BpmnElementEnum.ParallelGateway,
      BpmnElementEnum.InclusiveGateway,
    ],
  },
];

export const ApprovalRules = [
  {
    id: 'rule_agree',
    title: '同意',
    value: 'agree',
  },
  {
    id: 'rule_disagree',
    title: '拒绝',
    value: 'disagree',
  },
].map((item) => {
  // @ts-ignore
  item.titleI18n = 'sys.process.' + item.value;
  return item;
});

export const PropertySchema: BpmnElementProperty = {
  [BpmnElementEnum.UserTask]: {
    taskMode: TaskMode.Competitive,
    userType: UserType.User,
    userTypeValue: '',
    juel: JUEL_PRESET[0],
  },
  [BpmnElementEnum.SubmitTask]: {
    _extends_: BpmnElementEnum.UserTask,
  },
  [BpmnElementEnum.ApprovalTask]: {
    _extends_: BpmnElementEnum.UserTask,
    taskMode: TaskMode.Competitive,
    userType: UserType.User,
    userTypeValue: '',
    juel: JUEL_PRESET[0],
    rollbackRule: RollbackRule.Step,
  },
  [BpmnElementEnum.BusinessTask]: {
    _extends_: BpmnElementEnum.ServiceTask,
    service: '',
  },
  [BpmnElementEnum.ExclusiveGateway]: {
    rules: [],
  },
  [BpmnElementEnum.ApprovalCateway]: {
    _extends_: BpmnElementEnum.ExclusiveGateway,
  },
  [BpmnElementEnum.SequenceFlow]: {
    rule: '',
  },
};

export const ElementViewSchema: Partial<
  Record<
    BpmnElementEnum,
    {
      width: number;
      height: number;
      icon?: string;
      name: string;
      nameI18n: string;
    }
  >
> = {
  [BpmnElementEnum.StartEvent]: {
    ...BaseEventConfig,
    name: '开始',
    nameI18n: 'sys.process.element.start',
  },
  [BpmnElementEnum.EndEvent]: {
    ...BaseEventConfig,
    name: '结束',
    nameI18n: 'sys.process.element.end',
  },
  [BpmnElementEnum.UserTask]: {
    ...BaseTaskConfig,
    icon: 'icon-renwu',
    name: '任务',
    nameI18n: 'sys.process.element.task',
  },
  [BpmnElementEnum.SubmitTask]: {
    ...BaseTaskConfig,
    icon: 'icon-tijiao',
    name: '提交',
    nameI18n: 'sys.process.element.submit',
  },
  [BpmnElementEnum.ApprovalTask]: {
    ...BaseTaskConfig,
    icon: 'icon-shenpirenwu',
    name: '审批',
    nameI18n: 'sys.process.element.approval',
  },
  [BpmnElementEnum.ServiceTask]: {
    ...BaseTaskConfig,
    icon: 'icon-fuwu',
    name: '服务',
    nameI18n: 'sys.process.element.service',
  },
  [BpmnElementEnum.ReceiveTask]: {
    ...BaseTaskConfig,
    icon: 'icon-jieshou',
    name: '接收',
    nameI18n: 'sys.process.element.receive',
  },
  [BpmnElementEnum.BusinessTask]: {
    ...BaseTaskConfig,
    icon: 'icon-jiaoben',
    name: '脚本',
    nameI18n: 'sys.process.element.script',
  },
  [BpmnElementEnum.ExclusiveGateway]: {
    ...BaseGatewayConfig,
    icon: 'icon-paita',
    name: '排他',
    nameI18n: 'sys.process.element.exclusive',
  },
  [BpmnElementEnum.ApprovalCateway]: {
    ...BaseGatewayConfig,
    icon: 'icon-shenpijiedian',
    name: '审批',
    nameI18n: 'sys.process.element.approval',
  },
  [BpmnElementEnum.ParallelGateway]: {
    ...BaseGatewayConfig,
    icon: 'icon-binghang',
    name: '并行',
    nameI18n: 'sys.process.element.parallel',
  },
  [BpmnElementEnum.InclusiveGateway]: {
    ...BaseGatewayConfig,
    icon: 'icon-baorong',
    name: '包容',
    nameI18n: 'sys.process.element.inclusive',
  },
};

// todo auditGroup
export const UserTypeService: Record<
  UserType,
  {
    execution: boolean;
    function: string;
  }
> = {
  [UserType.User]: {
    execution: false,
    function: 'directUser',
  },
  [UserType.DeptManager]: {
    execution: false,
    function: 'orgPrincipal',
  },
  // [UserType.Role]: {
  //   execution: false,
  //   function: 'role',
  // },
  [UserType.ModelUser]: {
    execution: true,
    function: 'fieldUser',
  },
  [UserType.ModelUserSuperior]: {
    execution: true,
    function: 'immediateLeader',
  },
  [UserType.ModelDeptManager]: {
    execution: true,
    function: 'fieldOrgPrincipal',
  },
  [UserType.UserScript]: {
    execution: true,
    function: 'script',
  },
};

export const TaskModeOptions = Object.values(TaskMode).map((item) => ({
  value: item,
  i18nKey: `sys.process.${item}`,
}));

export const UserTypeOptions = Object.values(UserType).map((item) => ({
  value: item,
  i18nKey: `sys.process.${item}`,
}));

export const RollbackRuleOptions = Object.values(RollbackRule).map((item) => ({
  value: item,
  i18nKey: `sys.process.${item}`,
}));
