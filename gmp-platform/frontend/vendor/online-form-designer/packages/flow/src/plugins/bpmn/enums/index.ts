/**
 * bpmn节点类型
 */
export enum BpmnNodeTypeEnum {
  BpmnStart = 'bpmnStart',
  BpmnSubmit = 'bpmnSubmit',
  BpmnApproval = 'bpmnApproval', // 审批节点
  BpmnEnd = 'bpmnEnd',
  BpmnExclusive = 'bpmnExclusive', // 条件分支
  BpmnJudge = 'bpmnJudge', // 判断节点
  BpmnInclusiveS = 'bpmnInclusiveS',
  BpmnInclusiveE = 'bpmnInclusiveE', // 包容
  BpmnParallel = 'bpmnParallel', // 并行
  BpmnMessage = 'bpmnMessage', // 通知
  BpmnTransaction = 'bpmnTransaction', // 事务节点
  BpmnReceiveTask = 'bpmnReceiveTask', // 仅作为receiveTask隐藏节点使用
}

/**
 * tips: 增加枚举时同步后端增加，该值会作为变量运行在 bpmn 中
 */
export enum ButtonTypeEnum {
  /** 保存 */
  Save = 'Save',
  /** 提交 */
  Submit = 'Submit',
  /** 审核 */
  Approve = 'Approve',
  /** 退回 */
  Return = 'Return',
  /** 转办 */
  Reassign = 'Reassign',
  /** 合格 */
  Qualified = 'Qualified',
  /** 不合格 */
  Unqualified = 'Unqualified',
  /** 部分提交（会校验的保存）[MedPro] */
  PartialSubmit = 'PartialSubmit',
  /** 流程干预-撤回 */
  // Return4Interfere = 'Return4Interfere',
  /** 表单填报-转办 */
  // Reassign4Interfere = 'Reassign4Interfere',
}

/** 审批意见枚举 */
export enum OpinionTypeEnum {
  /** 全部必填 */
  Required = 'Required',
  /** 全部非必填 */
  Optional = 'Optional',
  /** 审核时必填 */
  ApproveRequired = 'ApproveRequired',
  /** 转办时必填 */
  ReassignRequired = 'ReassignRequired',
  /** 退回时必填 */
  ReturnRequired = 'ReturnRequired',
  /** 合格时必填 */
  QualifiedRequired = 'QualifiedRequired',
  /** 不合格时必填 */
  UnqualifiedRequired = 'UnqualifiedRequired',
}

export enum ApproveWayEnum {
  Competitive = 'Competitive',
  Sequential = 'Sequential',
  Joint = 'Joint',
}

export enum DismissRuleEnum {
  Step = 'Step',
  Skip = 'Skip',
}

export enum SignatureTypeEnum {
  None = 'None',
  Account = 'Account',
  Handwritten = 'Handwritten',
  Any = 'Any',
}

export enum CaseOperatorEnum {
  EQ = 'eq',
  GT = 'gt',
  GE = 'ge',
  LT = 'lt',
  LE = 'le',
  NE = 'ne',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
  FIELD_VALUE = 'fieldValue',
}

export enum CaseValueType {
  String = 'String',
  Integer = 'Integer',
  Double = 'Double',
  Time = 'LocalTime',
  Date = 'LocalDate',
  DateTime = 'LocalDateTime',
  Boolean = 'Boolean',
  EnumMuilt = 'Enum_Muilt',
}

export enum CaseValueSource {
  Manual = 'Manual',
  Model = 'Model',
  Node = 'Node',
}

export enum ButtonFlowAction {
  /** 上一个节点 */
  PreviousNode = 'PreviousNode',
  /** 下一个节点 */
  NextNode = 'NextNode',
  /** 开始节点 */
  StartNode = 'StartNode',
  /** 结束节点 */
  EndNode = 'EndNode',
}

export enum ButtonOpinionMode {
  /** 必填 */
  Required = 'Required',
  /** 非必填  */
  Optional = 'Optional',
  /** 关闭 */
  Closed = 'Closed',
}
