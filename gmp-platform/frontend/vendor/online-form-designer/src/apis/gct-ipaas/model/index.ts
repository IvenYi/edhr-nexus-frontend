/**
 * title: undefined
 */
export interface CategoryTreeResp {
  name: string;
  children: Array<CategoryTreeL2Resp>;
}

/**
 * title: undefined
 */
export interface CategoryTreeL2Resp {
  name: string;
  children: Array<CategoryResp>;
}

/**
 * title: undefined
 */
export interface FlowAppUpdateReq {
  id: number; // ID
  name: string; // 名称
  brand: string; // 品牌
  version: string; // 版本
}

/**
 * title: undefined
 */
export interface FlowNodeLogDetailReq {
  fuuid: string;
  reqId: string;
  nodeId: string;
}

/**
 * title: undefined
 */
export interface FlowNodeLogResp {
  fuuid: string;
  nodeId: string;
  nodeName: string;
  processTime: number;
  status: string;
  reqId: string;
  processTimeStart: string;
  processTimeEnd: string;
  nodeDesc: string;
}

/**
 * title: undefined
 */
export interface FlowLogResp {
  id: number;
  reqId: string;
  fuuid: string;
  name: string;
  fkey: string;
  modelKey: string;
  triggerKey: string;
  version: string;
  versionStr: string;
  processTime: string;
  status: string; // 1 执行 2成功 3失败
  statusStr: string;
  triggerTime: string;
  tenantId: string;
}

/**
 * title: undefined
 */
export interface FlowCreateWithCategoryReq {
  name: string;
  fAppId: string;
  modelKey: string;
  mark: string;
}

/**
 * title: undefined
 */
export interface FlowAppReq {
  name: string;
  brand: string;
  version: string;
}

/**
 * title: undefined
 */
export interface BizFlowMainResp {
  flow: FlowMainResp; // 摘要信息
  versions: Array<FlowVersionResp>;
  currentVersion: object;
  category: CategoryResp;
}

/**
 * title: undefined
 */
export interface FlowVersionResp {
  version: string; // 不带V的
  status: number; // 默认1
  statusStr: string; // 草稿、上线、下线、发布
  displayName: string; // 前端使用
  fuuid: string;
}

/**
 * title: undefined
 */
export interface FlowActionReq {
  fuuid: string;
  version: string; // 不包含V，例如1，2，3
}

/**
 * title: undefined
 */
export interface FlowUpdateReq {
  name?: string; // 名称
  fAppId?: string;
  modelKey?: string;
  mark?: string;
}

/**
 * title: undefined
 */
export interface ResponseEntity {
  code: number;
  data?: string;
  message?: string;
  ok: boolean;
  subCode?: string;
  subMessage?: string;
}

/**
 * title: undefined
 */
export interface FlowLogSearchReq {
  key: string;
  name: string;
  appId: string;
  triggerType: string;
  status: number;
}

/**
 * title: undefined
 */
export interface PageBase {
  data: string;
  pageSize: number;
  pageNo: number;
  totalCount: number;
  totalPage: number;
}

/**
 * title: undefined
 */
export interface CategoryFlowResp {
  categories: Array<CategoryResp>;
}

/**
 * title: undefined
 */
export interface CategoryResp {
  id: string; // ID 编号
  name: string;
  brand: string; // 品牌
  version: string;
  nameStr: string;
  children: Array<FlowMainResp>;
}

/**
 * title: undefined
 */
export interface FlowCategoryDragReq {
  targetSortNum: number; // 最高顺序+1
}

/**
 * title: undefined
 */
export interface FlowCategoryReq {
  name: string;
}

/**
 * title: undefined
 */
export interface FlowLogResp1 {
  id: number; // ID 编号
  reqId: string;
  fuuid: string;
  name: string;
  fkey: string;
  triggerType: string;
  processTime: number;
  status: string;
  triggerTime: string;
  tenantId: string;
}

/**
 * title: undefined
 */
export interface AccountMain {
  id: number; // 雪花
  aTypeId: string;
  aTypeName: string;
  name: string;
  createTime: string;
  lastUsedTime: string;
  status: number;
  links: number; // 关联连接流
}

/**
 * title: undefined
 */
export interface FlowMainResp {
  id: number;
  name: string;
  nameStr: string;
  fuuid: string;
  createTime: string;
  updateTime: string;
  status: number;
  statusStr: string;
  modelKey: string;
  appName: string;
}

/**
 * title: undefined
 */
export interface ComponentOutpuHandlerDef {
  type: string;
  fun: string;
  k: string;
  desc: string;
  fieldPaths: Array<string>;
}

/**
 * title: undefined
 */
export interface WebHookComponentDef {
  name: string;
  type: string; // webhook必定是trigger
  service: string; // WebHookComponentService
  version: string; // 0.0.1
  input: WebHookInputParamDef;
  outputHandlers: ComponentOutpuHandlerDef;
  netxRef: string; // 下一个组件的name
}

/**
 * title: undefined
 */
export interface FlowDef {
  flowName: string;
  flowUuid: string;
  tenantId: string;
  elements: any;
}

/**
 * title: undefined
 */
export interface WebHookInputParamDef {
  method: string;
  apiPath: string;
  authType?: string;
  authCode?: string;
  condition?: string; // 可选
}
