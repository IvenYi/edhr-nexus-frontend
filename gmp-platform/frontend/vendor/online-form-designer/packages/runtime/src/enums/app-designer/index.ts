import { FIELD_TYPE } from '../appEnum';

/**
 * 支持显示字段的类型
 */
export const SHOW_FIELDTYPES = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.LONG,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.SERIAL,
];

/**
 * 自定义业务服务类型
 */
export enum UserServiceType {
  SCRIPT_SERVICE = 'SCRIPT_SERVICE',
  SQL_SERVICE = 'SQL_SERVICE',
  SO_SERVICE = 'SO_SERVICE',
  BUILTIN_SERVICE = 'SYS_BUILTIN',
}

/**
 * 模型大类
 */
export enum EntityModelCategoryEnum {
  /** 实体模型 */
  ENTITY = 'entity',
  /** 数据模型  */
  DATA = 'data',
  /** 视图模型*/
  VIEW = 'view',
  /** 表单模型 */
  FORM = 'form',
  /**
   * 数据集模式
   */
  DATA_SET = 'dataSet',
}

/**
 * 实体模型类型
 */
export enum EntityModelTypeEnum {
  /** 基础模型 */
  BASE = 'BASE',
  /** 命名模型 */
  NDO = 'NDO',
  /** 版本模型 */
  RDO = 'RDO',
  /** 树模型 */
  TREE = 'TREE',
  /** 动态表单模型 */
  DYNAMIC_FORM = 'DYNAMIC_FORM',
  /** 工作流模型 */
  WORKFLOW = 'WORKFLOW',
  /** 事务模型 */
  TRANSACTION = 'TRANSACTION',
  /** 检验项 */
  // CHECK_LIST = 'CHECK_LIST',
}

/**
 * 工作流节点元素类型
 */
// export enum WorkflowNodeTypeEnum {
//   NODE_START = 'NODE_START',
//   NODE_END = 'NODE_END',
//   NODE_SPEC = 'NODE_SPEC',
//   NODE_GROUP = 'NODE_GROUP',
//   NODE_WORKFLOW = 'NODE_WORKFLOW',
//   PATH_MAIN = 'PATH_MAIN',
//   PATH_OPTIONAL = 'PATH_OPTIONAL',
//   PATH_BACK = 'PATH_REWORK',
// }

/** 字段默认值类型 */
export enum FieldDefaultValueTypeEnum {
  /** 无 */
  NONE = 'NONE',
  /** 固定值 */
  FIXED = 'FIXED',
  /** 系统变量 */
  SYS_VAR = 'SYS_VAR',
}

/** 字段默认值系统变量 */
export enum FieldSysVarDefaultValueEnum {
  NULL = '',
  /** 系统日期 */
  SYS_DATE = 'SYS_DATE',
  /** 系统时间 */
  SYS_TIME = 'SYS_TIME',
  /** 系统日期时间 */
  SYS_DATE_TIME = 'SYS_DATE_TIME',
  /** 系统登录用户 */
  CURRENT_USER = 'CURRENT_USER',
  /** 当前登录用户主部门 */
  CURRENT_ORG = 'CURRENT_ORG',
}

export enum scriptTypeEnum {
  /**
   * 事件脚本
   */
  EVENT = 'event',
  /**模型业务服务 */
  BUSINESSSERVICE = 'businessService',
  /**定时器 */
  TIMER = 'timer',
}

export enum pageLayoutModeEnum {
  /**适配浏览器高度  内部滚动*/
  SHOW_BOX_SCROLL = 'showBoxScroll',
  /**展示所有数据 外部滚动*/
  SHOW_ALL_DATA = 'showAllData',
}
