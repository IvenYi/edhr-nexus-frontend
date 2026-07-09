import { FlowNodeInstStatus } from '@gct/flow';

/**
 * bpmn节点类型
 */
export enum BpmnNodeTypeEnum {
  BpmnTrigger = 'trigger', // 触发器节点
  BpmnConnector = 'connector', // 连接器节点
  BpmnScript = 'script', // 连接器节点
  BpmnApiResponse = 'apiResponse', // api响应节点
  BpmnCondition = 'condition', // api响应节点
  BpmnExclusive = 'exclusive', // 条件分支
  BpmnParallel = 'parallel', // 并行节点
  BpmnLoop = 'loop', // 循环节点
}

/**
 * 连接器类型
 */
export enum ConnectorType {
  App = 'App',
  Http = 'Http',
  Script = 'Script',
  Db = 'Db',
  Ftp = 'Ftp',
}

export const ConnectorTypeOptions: Array<{
  key: ConnectorType;
  icon: string;
}> = [
  {
    key: ConnectorType.App,
    icon: 'icon-lianjieyingyong',
  },
  {
    key: ConnectorType.Http,
    icon: 'icon-http',
  },
  // {
  //   key: ConnectorType.Script,
  //   icon: 'icon-a-APIjiekou_api2',
  // },
  {
    key: ConnectorType.Db,
    icon: 'icon-shujumoxing',
  },
  // {
  //   key: ConnectorType.Ftp,
  //   icon: 'icon-ftp',
  // },
];

export enum PanelStep {
  Trigger = 'Trigger', // 触发器
  Access = 'Access', // 接入方式
  Timer = 'Timer', // 定时类型
  Connector = 'Connector', // 连接器
  Setting = 'Setting', // 配置
  Test = 'Test', // 测试
  Action = 'Action', // 操作
  Branch = 'Branch', // 分支大纲
  Apps = 'Apps', // 应用选择
  Debug = 'debug', // 应用选择
}

/** 业务端点类型 */
export enum EndpointType {
  webhook = 'webhook',
  baseHttp = 'baseHttp',
  apiConnector = 'apiConnector',
  apiResponse = 'apiResponse',
  scheduleTrigger = 'scheduleTrigger',
  condition = 'condition',
  if = 'if',
  else = 'else',
  script = 'script',
  modelBs = 'modelBs',
  db = 'platformDataSource',
  parallel = 'parallel',
  pipeline = 'pipeline',
  /** ad域 */
  ldap = 'ldap',
  platform = 'platform',
  doWhile = 'doWhile',
  /** sapRfc */
  sapRfc = 'sapRfc',
}

export enum QuartzType {
  CRON = 'CRON',
  SIMPLE = 'SIMPLE',
}

export enum ResponseMethod {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
}

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum ParamType {
  JSON = 'JSON',
  // XML = 'XML',
  FORMDATA = 'FORM_DATA',
  X_WWW_FORM_URLENCODED = 'X_WWW_FORM_URLENCODED',
  // RAW = 'RAW',
  // BINARY = 'BINARY',
  // NONE = 'NONE',
}

export enum ResponseParamType {
  JSON = 'JSON',
  // XML = 'XML',
  // BINARY = 'BINARY',
}

export enum TriggerType {
  Fixed = 'Fixed',
  Timed = 'Timed',
}

/**
 * 连接流状态
 */
export enum ConnectionFlowStatus {
  Init = 'init',
  Draft = 'draft',
  Online = 'online',
  Offline = 'offline',
  Publish = 'publish',
}

/**
 * 是否鉴权(带请求参数: DIRECT_ACCESS,获取token: ACCESS_TOKEN,无:NONE,自定义: CUSTOM)
 */
export enum AuthModeEnum {
  /** token鉴权 */
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  /** 自定义鉴权 */
  DIRECT_ACCESS = 'DIRECT_ACCESS',
  CUSTOM = 'CUSTOM',
  /** 无鉴权 */
  NONE = 'NONE',
  /** AD域连接 */
  AD = 'AD',
  /** SAP RFC 连接 */
  SAP_RFC = 'SAP_RFC',
}

/**
 * 鉴权有效时间 单位(秒:SECONDS/小时:HOURS/天:DAYS/分钟:MINUTES)
 */
export enum EffectiveTimeUnitEnum {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES',
  SECONDS = 'SECONDS',
}

/**
 * 鉴权字段数据类型(Array,Object,String,Integer,Boolean,BigDecimal,Long)
 */
export enum AuthKeyTypeEnum {
  String = 'String',
  /** 废弃的字段类型 */
  Integer = 'Integer',
  /** 废弃的字段类型 */
  BigDecimal = 'BigDecimal',
  /** 废弃的字段类型 */
  Long = 'Long',
  Number = 'Number',
  Boolean = 'Boolean',
  Object = 'Object',
  Array = 'Array',
}

/**
 * 取值类型(填入值:INPUT/鉴权函数:FUNC/表达式取值:EXPRESSION/脚本函数:SCRIPT)
 */
export enum AuthValueTypeEnum {
  INPUT = 'INPUT',
  FUNC = 'FUNC',
  EXPRESSION = 'EXPRESSION',
  SCRIPT = 'SCRIPT',
}

/**
 * 连接结果
 */
export enum AuthConnectStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum AuthConnectModeEnum {
  TEST = 'TEST',
  BIZ = 'BIZ',
}

/**
 * 连接流调用日志 结果枚举
 */
export enum FlowCallLogStatusEnum {
  Pending = '1',
  Success = '2',
  Failure = '3',
}

export enum MetaTypeEnum {
  String = 'String',
  Integer = 'Integer',
  Long = 'Long',
  Double = 'Double',
  Boolean = 'Boolean',
  Float = 'Float',
  Object = 'Object',
  Array = 'Array',
}

/**
 * 条件运算符
 */
export enum OperatorEnum {
  EQ = '==',
  GT = '>',
  GE = '>=',
  LT = '<',
  LE = '<=',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export const IPaaSNodeStatusMap = {
  [FlowCallLogStatusEnum.Success]: FlowNodeInstStatus.COMPLETED,
  [FlowCallLogStatusEnum.Pending]: FlowNodeInstStatus.RUNNING,
  [FlowCallLogStatusEnum.Failure]: FlowNodeInstStatus.EXCEPTION,
};

export const ProtocolTypes = {
  Http: 'http',
  Https: 'https',
};

export enum LdapScopeEnum {
  One = 'one',
  Sub = 'sub',
}
