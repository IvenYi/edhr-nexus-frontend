export enum MenuClickEvent {
  NEW = 'new',
  EDIT = 'edit',
  DELETE = 'delete',
}

export enum ModelTypeEnum {
  /** 实体模型 */
  ENTITY = 'entity_module',
  /** 枚举 */
  ENUM = 'enum_module',
  /** 虚拟 */
  VIRTUAL = 5,
  /** 视图 */
  VIEW = 'view_model_module',
  /** SQL */
  SQL = 7,
  /** 数据 */
  DATA = 'data_model',
}

export enum PageTypeEnum {
  /** WEB */
  WEB = 'web_module',
  /** MOBILE */
  MOBILE = 'mobile_module',
  /** PAD */
  PAD = 'pad_module',
  /** 统计 */
  STATISTICS = 8,
}

export enum ScriptTypeEnum {
  /** 公共方法 */
  GLOBAL_METHOD = 'global_method_module',
  /** 脚本 */
  DEFAULT = 'script_module',
  /** 编排 */
  ORCHESTRATION = 'so_module',
}

export enum PrintTypeEnum {
  /** 标签 */
  LABEL = 'label_module',
  /** 单据 */
  RECEIPT = 'document_module',
}

export enum ProcessTypeEnum {
  /** 业务流 */
  // BUSINESS = 'biz_process_module',
  /** 审批流 */
  APPROVAL = 'approval_process_module',
}

export enum FormDesignEnum {
  /**在线表单 */
  ONLINE_FORM = 'online_form_module',
  /**eDHR */
  EDHR = 'edhr_module',
}

export const CategoryEnum = {
  ...ModelTypeEnum,
  ...PageTypeEnum,
  ...ScriptTypeEnum,
  ...PrintTypeEnum,
  ...ProcessTypeEnum,
  ...FormDesignEnum,
};

export type CategoryType =
  | ModelTypeEnum
  | PageTypeEnum
  | ScriptTypeEnum
  | PrintTypeEnum
  | ProcessTypeEnum;
