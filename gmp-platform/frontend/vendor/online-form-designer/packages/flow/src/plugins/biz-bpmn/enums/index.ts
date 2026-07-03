import { FIELD_TYPE } from '/@/enums/appEnum';
import { FlowNodeInstStatus as FlowInstStatus } from '@gct/flow/src/enums';
/**
 * bpmn节点类型
 */
export enum BpmnNodeTypeEnum {
  /** 开始节点 */
  BpmnStart = 'bizStart',
  /** 提交流程节点 */
  BpmnSubmit = 'bizSubmit',
  /** 结束节点 */
  BpmnEnd = 'bizEnd',
  /** 条件分支 */
  BpmnExclusive = 'bizExclusive', // 条件分支
  /** 脚本节点 */
  BpmnJs = 'bizJs', // 脚本节点
  /** 并行分支节点 */
  BpmnParallelReal = 'bizParallelReal', // 并行节点
  /** 条件并行节点 */
  BpmnParallel = 'bizParallel', // 条件并行节点
  /** 聚合节点 */
  BpmnJoin = 'bizJoin', // 聚合节点
  /** 表单节点 */
  BpmnForm = 'bizForm', // 表单节点
  /** 表单节点自动带一个业务节点 */
  BpmnBusiness = 'bizBusiness', // 表单节点自动带一个业务节点
  /** 配置节点 */
  BpmnAllocat = 'bizAllocat', // 配置节点
  /** 事务节点 */
  BpmnTransaction = 'bizTransaction', // 事务节点
  /** 消息节点 */
  BpmnMessage = 'bizMessage', // 消息节点
  /** 判断节点 */
  BpmnJudge = 'bizJudge', // 判断节点
  /** （表单节点）业务单据节点 */
  BpmnBizDocument = 'bizBizDocument', // 表单节点（业务单据节点）
  /** 连接节点 */
  BpmnIPassFlow = 'bizIPassFlow', // 连接节点
  /** 仅作为receiveTask隐藏节点使用 */
  BpmnReceiveTask = 'bizReceiveTask', // 仅作为receiveTask隐藏节点使用
  /** 带有事件监听的结束节点 */
  BpmnEndWithListener = 'bizEndWithListener', // 带有事件监听的结束节点
  /** 检验执行 */
  BpmnInspection = 'bizInspection',
  /**  放行执行 */
  BpmnRelease = 'bizRelease',
  /** 入库执行 */
  BpmnInBound = 'bizInBound',
  /** 出库执行 */
  BpmnOutBound = 'bizOutBound',
  /** 下料执行 */
  BpmnMaterialUnLoading = 'bizMaterialUnLoading',
  /** 上料执行 */
  BpmnMaterialLoading = 'bizMaterialLoading',
  /** 标签打印 */
  BpmnLabelPrint = 'bizLabelPrint',
}

/**
 * tips: 增加枚举时同步后端增加，该值会作为变量运行在 bpmn 中
 */
export enum ButtonTypeEnum {
  /** 重新提交 */
  Resubmit = 'Resubmit',
  /** 终止 */
  End = 'Terminate',
  /** 撤回 */
  Withdraw = 'Withdraw',
  /** 同意 */
  Approve = 'Approve',
  /** 拒绝 */
  Refuse = 'Refuse',
  /** 转交 */
  Reassign = 'Reassign',
  /** 加签 */
  Countersign = 'Countersign',
  /** 驳回 */
  Reject = 'Reject',
}

export enum ButtonEventsEnum {
  /**流程启动时 */
  StartInstance = 'StartInstance',
  /**流程结束后 */
  EndInstance = 'EndInstance',
  /**重新提交 */
  BeforeReSubmit = 'BeforeReSubmit',
  AfterReSubmit = 'AfterReSubmit',
  /**终止 */
  BeforeEnd = 'BeforeTerminate',
  AfterEnd = 'AfterTerminate',
  /**撤回 */
  BeforeWithdraw = 'BeforeWithdraw',
  AfterWithdraw = 'AfterWithdraw',
  /** 同意 */
  BeforeApprove = 'BeforeApprove',
  AfterApprove = 'AfterApprove',
  /** 拒绝 */
  BeforeRefuse = 'BeforeRefuse',
  AfterRefuse = 'AfterRefuse',
  /** 转交 */
  BeforeReassign = 'BeforeReassign',
  AfterReassign = 'AfterReassign',
  /** 加签 */
  BeforeCountersign = 'BeforeCountersign',
  AfterCountersign = 'AfterCountersign',
  /** 驳回 */
  BeforeReject = 'BeforeReject',
  AfterReject = 'AfterReject',
}

/** 审批意见枚举 */
export enum OpinionTypeEnum {
  /** 全部必填 */
  Required = 'Required',
  /** 全部非必填 */
  Optional = 'Optional',
  /** 同意时必填 */
  ApproveRequired = 'ApproveRequired',
  /** 拒绝时必填 */
  RefuseRequired = 'RefuseRequired',
  /** 转交时必填 */
  ReassignRequired = 'ReassignRequired',
  /** 驳回时必填 */
  RejectRequired = 'RejectRequired',
  /** 加签时必填 */
  CountersignRequired = 'CountersignRequired',
}

export enum ApproveWayEnum {
  ApprovedByOne = 'ApprovedByOne',
  ApprovedByAll = 'ApprovedByAll',
}

export enum DismissRuleEnum {
  ReApprove = 'ReApprove',
  JumpToRejectNode = 'JumpToRejectNode',
}

export enum DismissToEnum {
  StartNode = 'StartNode',
  PreNode = 'PreNode',
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
}

export enum CaseValueType {
  String = 'String',
  Integer = 'Integer',
  Double = 'Double',
  Long = 'Long',
  Time = 'LocalTime',
  Date = 'LocalDate',
  DateTime = 'LocalDateTime',
  Boolean = 'Boolean',
}

export const FieldTypeToCaseType = {
  [FIELD_TYPE.TEXT]: CaseValueType.String,
  [FIELD_TYPE.LONG_TEXT]: CaseValueType.String,
  [FIELD_TYPE.DECIMAL]: CaseValueType.Double,
  [FIELD_TYPE.DOUBLE]: CaseValueType.Double,
  [FIELD_TYPE.INTEGER]: CaseValueType.Integer,
  [FIELD_TYPE.LONG]: CaseValueType.Long,
  [FIELD_TYPE.BOOLEAN]: CaseValueType.Boolean,
  [FIELD_TYPE.DATE]: CaseValueType.Date,
  [FIELD_TYPE.TIME]: CaseValueType.Time,
  [FIELD_TYPE.DATE_TIME]: CaseValueType.DateTime,
  [FIELD_TYPE.OPTION]: CaseValueType.String,
  [FIELD_TYPE.OPTION_MULTI]: CaseValueType.String,
  [FIELD_TYPE.ENUM]: CaseValueType.String,
  [FIELD_TYPE.ENUM_MULTI]: CaseValueType.String,
  [FIELD_TYPE.REF]: CaseValueType.String,
  [FIELD_TYPE.REF_MULTI]: CaseValueType.String,
  [FIELD_TYPE.USER]: CaseValueType.String,
  [FIELD_TYPE.USER_MULTI]: CaseValueType.String,
  [FIELD_TYPE.ORG]: CaseValueType.String,
  [FIELD_TYPE.ORG_MULTI]: CaseValueType.String,
};

export enum CaseValueSource {
  Manual = 'Manual',
  Model = 'Model',
  Node = 'Node',
}

export enum BizNodeInstStatus {
  Finished = 'finished',
  Running = 'running',
  Waiting = 'waiting',
  Ended = 'ended',
}

export const FlowNodeInstStatusColor = {
  [BizNodeInstStatus.Finished]: '#309C41',
  [BizNodeInstStatus.Running]: '#3168EC',
  [BizNodeInstStatus.Waiting]: '#8F8F8F',
  [BizNodeInstStatus.Ended]: '#F54547',
};

export const BizStatusToFlowStatus = {
  [BizNodeInstStatus.Finished]: FlowInstStatus.COMPLETED,
  [BizNodeInstStatus.Running]: FlowInstStatus.RUNNING,
  [BizNodeInstStatus.Waiting]: FlowInstStatus.PENDING,
  [BizNodeInstStatus.Ended]: FlowInstStatus.EXCEPTION,
};

export enum BizFlowModule {
  /** medpro */
  Medpro = 'medpro',
  /** edhr(生产) */
  Edhr = 'edhr',
  /** edhr(仓储) */
  Stock = 'stock',
  /** edhr(检验) */
  Inspection = 'inspection',
  /** edhr(放行) */
  Release = 'release',
}
