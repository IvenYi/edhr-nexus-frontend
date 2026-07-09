/**
 * title: AccountConfig
 */
export interface AccountConfig {
  appType?: string; // 应用类型 枚举 (钉钉 DINGDING，企微 QIYEWEIXIN，飞书 FEISHU，微软 MICROSOFT)
  relationField?: string; // 域账号关联字段(username_/账号,emp_no_/工号,mobile_/手机号码)
}

/**
 * title: ApiInfo
 */
export interface ApiInfo {
  description?: string;
  method?: string;
  modelCategory?: string;
  modelKey?: string;
  modelName?: string;
  name?: string;
  requestBase?: Array<Parameter>;
  requestBaseTitle?: any[];
  requestBody?: Array<Parameter>;
  requestBodyExample?: string;
  requestBodyTitle?: any[];
  requestHeader?: Array<Parameter>;
  requestHeaderTitle?: any[];
  responseBody?: Array<Parameter>;
  responseBodyExample?: string;
  responseBodyTitle?: any[];
  url?: string;
}

/**
 * title: AppBranchRequest
 */
export interface AppBranchRequest {
  appVersion?: string; // 应用版本
  description?: string; // 备注
  head?: number; // 当前分支
  releasable?: number; // 可发行
  seq?: number; // 序号
}

/**
 * title: AppBranchResponse
 */
export interface AppBranchResponse {
  appPkgUrl?: string;
  appVersion?: string;
  appVersionNum?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  head?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  releasable?: number;
  releaseTag?: string;
  seq?: number;
}

/**
 * title: AppEditStatusResponse
 */
export interface AppEditStatusResponse {
  draft?: boolean;
}

/**
 * title: AppGlobalSettingsRequest
 */
export interface AppGlobalSettingsRequest {
  configJson?: string; // 设置详情
  key?: string; // 唯一标识
  name?: string; // 分类名称
  source?: string; // 来源
  type?: string; // 类型：模态框/变量/事件等
}

/**
 * title: AppGlobalSettingsResponse
 */
export interface AppGlobalSettingsResponse {
  configJson?: string; // 设置详情
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  key?: string; // 唯一标识
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 分类名称
  source?: string; // 来源
  type?: string; // 类型：模态框/变量/事件
}

/**
 * title: AppGrantedStatisticDTO
 */
export interface AppGrantedStatisticDTO {
  remain?: number; // 剩余
  shared?: number; // 共享席位
  total?: number; // 总共
  used?: number; // 授权席位
}

/**
 * title: AppGrantedUserBatchRequest
 */
export interface AppGrantedUserBatchRequest {
  userIds?: any[]; // 用户id
}

/**
 * title: AppGrantedUserRequest
 */
export interface AppGrantedUserRequest {
  userId?: string; // 用户id
}

/**
 * title: AppPublishLogRequest
 */
export interface AppPublishLogRequest {
  appVersion?: string; // 应用版本
  appVersionNum?: string; // 应用版本数字形式
  branchId?: string; // 分支id
  commitId?: string; // 提交id
  commitTag?: string; // 提交标识
  description?: string; // 内容
  env?: string; // 环境
  latest?: number; // 是否最新发布
  prePublishId?: string; // 上一次发布id
  releaseTag?: string; // 发行标识
  reverted?: number; // 已回退
  seq?: number; // 序号
  state?: string; // 状态
}

/**
 * title: AppPublishLogResponse
 */
export interface AppPublishLogResponse {
  appVersion?: string; // 应用版本
  appVersionNum?: string; // 应用版本数字形式
  branchId?: string; // 分支id
  commitId?: string; // 提交id
  commitTag?: string; // 提交标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 内容
  env?: string; // 环境
  id?: string; // 主键
  latest?: number; // 是否最新发布
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  prePublishId?: string; // 上一次发布id
  releaseTag?: string; // 发行标识
  reverted?: number; // 已回退
  seq?: number; // 序号
  state?: string; // 状态
}

/**
 * title: AppendRelatedInstRequest
 */
export interface AppendRelatedInstRequest {
  businessId?: string; // 工序ID
  businessType?: string; // 业务类型
  ext1?: string; // 扩展字段1
  ext2?: string; // 扩展字段2
  ext3?: string; // 扩展字段3
  materialStatus?: string; // LOT/SN
  mfgOrderId?: string; // 工单ID
  module?: string; // 模块类型
  ofRequired: number; // 在线表单是否必填 1: 必填 0 非必填
  relatedMaterialNo?: string; // 关联批次
  sourceMaterialNo?: string; // 来源批次/SN
  title?: string; // 表单备注名称
  tmplId?: string; // 表单模板ID
}

/**
 * title: ApprovalLogRequest
 */
export interface ApprovalLogRequest {
  activityName?: string; // 节点名称
  message?: string; // 消息内容
  modelId?: string; // 模型数据ID
  modelKey?: string; // 模型key
  name?: string; // 处理人姓名
  operationName?: string; // 操作名称
  processInstanceId?: string; // 流程实例ID
}

/**
 * title: ApprovalLogResponse
 */
export interface ApprovalLogResponse {
  activityName?: string; // 节点名称
  id?: string; // 主键
  message?: string; // 消息内容
  modelId?: string; // 模型数据ID
  modelKey?: string; // 模型key
  name?: string; // 处理人姓名
  operationName?: string; // 操作名称
  processInstanceId?: string; // 流程实例ID
}

/**
 * title: AssistantRequest
 */
export interface AssistantRequest {
  sessionId?: string; // 会话id
  tools?: object; // 额外参数
  usage?: string; // 使用场景
  userMessage?: string; // 用户输入
  vars?: object; // 变量
}

/**
 * title: AuditLogRequest
 */
export interface AuditLogRequest {
  apiName?: string;
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string;
  id?: string;
  inputContent?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string;
  operateType?: string;
  outputContent?: string;
  requestPath?: string;
  requestType?: string;
  tenantId?: string;
}

/**
 * title: AuditLogResponse
 */
export interface AuditLogResponse {
  apiName?: string; // 接口名称
  appId?: string; // 应用Id
  branchId?: string; //  分支Id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 应用环境
  id?: string; // 主键
  inputContent?: string; // 入参
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块名称
  operateType?: string; // 操作类型
  operatorName?: string; // 操作人
  outputContent?: string; // 出参
  requestPath?: string; // 请求路径
  requestType?: string; // 请求方式
  status?: boolean; // 状态
}

/**
 * title: AuditLogSearchRequest
 */
export interface AuditLogSearchRequest {
  appId?: string; // 系统分类,(企业管理后台：ENTERPRISE，租户管理后台：，开发者中心)
  beginCreateTime?: string; // 操作时间起
  createUserId?: string; // 操作人
  endCreateTime?: string; // 操作时间止
  module?: string; // 所属应用模块
  operateContent?: string; // 操作详情
  operateType?: string; // 操作类型(新增:INSERT,更新:UPDATE,删除:DELETE)
  pageNo?: number;
  pageSize?: number;
  status?: boolean; // 状态，0失败，1成功
  tenantId?: string;
}

/**
 * title: BackEndPrintRequest
 */
export interface BackEndPrintRequest {
  bizServiceKey: string; // 业务服务key（用于获取填充数据）
  data?: object; // 当业务服务为非 getById 时需要传的参数
  dataId?: string; // 当业务服务为 getById 时需要传 dataId 让后端获取当前表单所属模型数据
  fieldKey?: string; // 打印机字段key，printerKey 不传时需要去当前数据的 fieldKey 字段兑换打印机信息
  labelId: string; // 标签模板 id
  modelKey: string; // 当前表单所属模型 key
  printerKey?: string; // 系统打印机 或 前台打印机配置不在当前模型数据上时 前台会传值
  testVar?: object; // 测试场景下使用的变量数据
}

/**
 * title: Base64UploadRequest
 */
export interface Base64UploadRequest {
  fileContent: string; // base64文件内容
  filename: string; // 文件名
  type?: string; // 资源分类枚举 LABEL_IMAGE:标签图片/MODEL_EXCEL:模型导入模板
}

/**
 * title: BasicConfigRequest
 */
export interface BasicConfigRequest {
  description?: string; // 应用描述
  id?: string; // 配置的id
  logoConfig?: LogoConfigDTO; // 应用logo缩略图
  name?: string; // 应用名称
  pageIcon?: string; // 页签icon
  pageType: string; // 类型(WEB/MOBILE)配置
}

/**
 * title: BasicConfigResponse
 */
export interface BasicConfigResponse {
  description?: string; // 描述
  id?: string; // 配置的key
  logoConfig?: LogoConfigDTO; // 应用logo缩略图
  name?: string; // 应用名称
  pageIcon?: string; // 页签icon
  pageType?: string; // 类型(WEB/MOBILE)配置
}

/**
 * title: BindRelatedIndstRequest
 */
export interface BindRelatedIndstRequest {
  businessId?: string; // 工序ID
  ext1?: string; // 扩展字段1
  ext2?: string; // 扩展字段2
  ext3?: string; // 扩展字段3
  instId?: string; // 实例id
  mfgOrderId?: string; // 当前工单号
  module?: string; // 模块类型
  relatedMaterialNo?: string; // 当前批次
  sourceMaterialNo?: string; // 绑定表单对应的批次号
  title?: string; // 表单备注名
}

/**
 * title: BizEventRequest
 */
export interface BizEventRequest {
  bizServiceKey?: string; // 关联业务服务key
  description?: string; // 备注
  executeType?: string; // 执行方式(同步:SYNC、异步:ASYNC)
  modelKey?: string; // 模型定义表key
  relationId?: string; // 关联事件KEY
  resourceType?: string; // (脚本:SCRIPT 服务编排:ORCHESTRATION)
  type?: string; // 事件类型(前置事件:PRE、后置事件:POST)
}

/**
 * title: BizEventResponse
 */
export interface BizEventResponse {
  bizServiceKey?: string; // 关联业务服务key
  bizServiceName?: string; // 业务服务的名字
  bizServiceNameI18nKey?: string; // 业务服务的名字18n
  description?: string; // 备注
  enabled?: number; // 启用 1: 禁用 0
  executeType?: string; // 执行方式(同步:sync、异步:async)
  id?: string; // ID
  modelKey?: string; // 模型定义表key
  name?: string; // 触发内容
  relationId?: string; // 关联事件KEY
  resourceType?: string; // (脚本:SCRIPT 服务编排:ORCHESTRATION)
  type?: string; // 事件类型(前置事件:PRE、后置事件:POST)
}

/**
 * title: BizServiceDragRequest
 */
export interface BizServiceDragRequest {
  id?: string; // 服务id
  modelKey?: string; // 模型key
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: BizServiceMeta
 */
export interface BizServiceMeta {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string;
  id?: string;
  key?: string;
  method?: string;
  modelKey?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  mutex?: number;
  name?: string;
  openapiId?: string;
  serviceKey?: string;
  sortNum?: number;
  type?: string;
  usage?: string;
}

/**
 * title: BizServiceRequest
 */
export interface BizServiceRequest {
  description?: string; // 服务描述
  key?: string; // 服务key
  method?: string; // 服务方式
  modelKey?: string; // 模型定义表key
  mutex?: number; // 操作互斥
  name?: string; // 服务名称
  overrideBizKey?: string;
  serviceKey?: string; // 服务对应服务key(j0s脚本服务、sql服务、编排服务)
  type?: string; // 服务类型
}

/**
 * title: BizServiceResponse
 */
export interface BizServiceResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 服务描述
  id?: string; // 主键
  key?: string; // 服务key
  method?: string; // 服务方式
  modelKey?: string; // 模型定义表key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  mutex?: number; // 操作互斥
  name?: string; // 服务名称
  serviceKey?: string; // 服务对应服务key(j0s脚本服务、sql服务、编排服务)
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置服务(0自定义、1内置)
  type?: string; // 服务类型
}

/**
 * title: BooleanEntity
 */
export interface BooleanEntity {
  comment?: string; // 枚举值内容
  realValue?: number; // 数据库实际保存的值
  value?: string; // 枚举value
}

/**
 * title: BtwNodeVO
 */
export interface BtwNodeVO {
  children?: Array<BtwNodeVO>; // 子节点列表
  fullPath?: string; // 节点路径
  name?: string; // 节点名称（目录名称、btw文件名称）
  pathType?: string; // btw模板路径类型：local本地选择、common网络共享
  printKey?: string;
  type?: string; // 节点类型 (directory 或 file)
  varList?: any[]; // 模板中解析出来的变量集合
}

/**
 * title: CategoryCompleteResponse
 */
export interface CategoryCompleteResponse {
  children?: Array<RelationResponse>;
  hasChild?: boolean; // 是否子版本
  id?: string; // 主键
  module?: string; // 所属模块(实体、枚举、web页面)
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CategoryCompleteVO
 */
export interface CategoryCompleteVO {
  child?: Array<CategoryCompleteVO>; // 子分类
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属模块(实体、枚举、web页面)
  name?: string; // 分类名称
  parentId?: string; // 父节点id
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CategoryDragDTO
 */
export interface CategoryDragDTO {
  id: string; // 选中分类id
  targetParentId?: string; // 目标位置父节点id，不传或传「ROOT」则代表根节点
  targetSortNum: number; // 目标位置排序序号
}

/**
 * title: CategoryDragRequest
 */
export interface CategoryDragRequest {
  id?: string; // 分类id
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: CategoryRdoRelationResponse
 */
export interface CategoryRdoRelationResponse {
  child?: Array<RdoTreeResponse>; // 当前分类下的，rdo节点（父子结构）
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属模块(实体、枚举、web页面 ...)
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CategoryRelationDragRequest
 */
export interface CategoryRelationDragRequest {
  categoryId?: string; // 分类id
  relationId?: string; // 分类关联id
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: CategoryRelationRequest
 */
export interface CategoryRelationRequest {
  categoryId?: string; // 分类id
  relationId?: string; // 分类关联表id
}

/**
 * title: CategoryRelationResponse
 */
export interface CategoryRelationResponse {
  categoryId?: string; // 分类id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  relationId?: string; // 分类关联表id
  sortNum?: number; // 排序
}

/**
 * title: CategoryRequest
 */
export interface CategoryRequest {
  module?: string; // 所属模块(实体、枚举、web页面 document_module/单据打印模块,在线表单:online_form_module,edhr_module,check_list_module)
  name?: string; // 分类名称
  parentId?: string; // 父节点id ， 有则必传 无则不传即可
}

/**
 * title: CategoryResponse
 */
export interface CategoryResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属模块(实体、枚举、web页面 ...)
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CheckPwdRequest
 */
export interface CheckPwdRequest {
  password?: string;
  type?: string;
  username?: string;
}

/**
 * title: ChildEdhrInstanceRelationDTO
 */
export interface ChildEdhrInstanceRelationDTO {
  appId?: string;
  approveProcInstId?: string;
  associated?: boolean; // 是否被其他DHR关联
  canArchived?: boolean;
  children?: Array<ChildEdhrInstanceRelationDTO>;
  code?: string;
  completedTime?: string;
  createTime?: string;
  createType?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  docOutlineSnapshot?: string;
  id?: string;
  instRelationId?: string;
  instanceStatus?: string;
  materialNo?: string;
  materialRunningStatus?: string;
  materialStatus?: string;
  mfgOrderCode?: string;
  mfgOrderId?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string;
  onlineFormInstanceList?: Array<OnlineFormInstanceDTO>; // 引用详情
  orderCode?: string;
  params?: string;
  productCode?: string;
  productFamilyId?: string;
  productId?: string;
  productIdRbi?: string;
  productIdRi?: string;
  productName?: string;
  productVersion?: string;
  serialNo?: string;
  shopfloorId?: string;
  spec?: string;
  summarySnapshot?: string;
  tmplId?: string;
  tmplName?: string;
  tmplVersion?: string;
}

/**
 * title: ClientsDto
 */
export interface ClientsDto {
  clientid?: string;
  connected_at?: string;
  ip_address?: string;
  port?: string;
}

/**
 * title: CommitLogRequest
 */
export interface CommitLogRequest {
  description?: string; // 内容
  latest?: number; // 是否最新提交
  preCommitId?: string; // 上一次提交id
  releasable?: number; // 可发行
  releaseContent?: string; // 发行内容
  releasePackageUrl?: string; // 发行包地址
  releaseTag?: string; // 发行标识
  tag?: string; // 标识
}

/**
 * title: CommitLogResponse
 */
export interface CommitLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 内容
  id?: string; // 主键
  latest?: number; // 是否最新提交
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  preCommitId?: string; // 上一次提交id
  releasable?: number; // 可发行
  releaseContent?: string; // 发行内容
  releasePackageUrl?: string; // 发行包地址
  releaseTag?: string; // 发行标识
  releaseTime?: string; // 发行时间
  releaseUserId?: string; // 发行人id
  releaseUserName?: string; // 发行人名称
  tag?: string; // 标识
}

/**
 * title: CommitRequest
 */
export interface CommitRequest {
  description?: string; // 内容
}

/**
 * title: CommonInfoCardRequest
 */
export interface CommonInfoCardRequest {
  description?: string; // 备注
  designerJson?: string; // 设计json
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  edition?: string; // 卡片模式专业版:PROFESSIONAL 、普通版:EASY
  id?: string;
  initCommitId?: string; // 初始提交 id
  modelCategory?: string; // 绑定模型类型(实体:entity,视图:view,数据:data)
  modelKey?: string; // 关联模型key
  name?: string; // 卡片名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  runtimeJson?: string; // 运行时json
  screenShoot?: string; // 缩略图
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  sysBuiltin?: number; // 是否内置(1:内置菜单,0:用户创建)
  type?: string; // 信息卡类型 CARD卡片 WINDOW弹窗
}

/**
 * title: CommonInfoCardResponse
 */
export interface CommonInfoCardResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  designerJson?: string; // 设计json
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  edition?: string; // 卡片模式专业版:PROFESSIONAL 、普通版:EASY
  id?: string; // ID
  initCommitId?: string; // 初始提交 id
  modelCategory?: string; // 绑定模型类型(实体:entity,视图:view,数据:data)
  modelKey?: string; // 关联模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 卡片名称
  runtimeJson?: string; // 运行时json
  screenShoot?: string; // 缩略图
  sysBuiltin?: number; // 是否内置(1:内置菜单,0:用户创建)
  type?: string; // 信息卡类型 card卡片 window弹窗
}

/**
 * title: ControlConfigRequest
 */
export interface ControlConfigRequest {
  procDefId?: string; // 流程定义id
  refId?: string; // 分类id/模板id
  type?: string; // 关联关系类型(单据分类:ONLINE_FORM_CATEGORY/eDHR分类:EDHR_CATEGORY/特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG)
}

/**
 * title: ControlConfigResponse
 */
export interface ControlConfigResponse {
  code?: string; // 表单编号
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模板名称
  procDefId?: string; // 流程定义id
  refId?: string; // 分类id/模板id
  type?: string; // 关联关系类型(单据分类:ONLINE_FORM_CATEGORY/eDHR分类:EDHR_CATEGORY/特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG)
  version?: string; // 模板版本
}

/**
 * title: ControlProcessApproveRequest
 */
export interface ControlProcessApproveRequest {
  btnKey: string; // 点击的按钮key
  buttonConfig: string; // 操作的按钮配置
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  tmplId: string; // 受控文档模板id,格式：baseId:id
}

/**
 * title: ControlProcessJumpRequest
 */
export interface ControlProcessJumpRequest {
  btnKey: string; // 点击的按钮的key：下一个节点：NextNode、开始节点：StartNode、结束节点：EndNode、上一个节点 PreviousNode
  buttonConfig: string; // 操作的按钮配置
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  tmplId: string; // 受控文档模板id,格式：baseId:id
}

/**
 * title: ControlProcessReassign4InterfereRequest
 */
export interface ControlProcessReassign4InterfereRequest {
  taskId: string; // 任务id
  tmplId: string; // 受控文档模板id,格式：baseId:id
  toUserId: string; // 转给的用户id
}

/**
 * title: ControlProcessReassignRequest
 */
export interface ControlProcessReassignRequest {
  buttonConfig: string; // 操作的按钮配置
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  tmplId: string; // 受控文档模板id,格式：baseId:id
  toUserId: string; // 转给的用户id
}

/**
 * title: ControlProcessResubmitRequest
 */
export interface ControlProcessResubmitRequest {
  buttonConfig: string; // 操作的按钮配置
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id，重新提交时传值
  tmplId: string; // 受控文档模板id,格式：baseId:id
}

/**
 * title: ControlProcessReturn4InterfereRequest
 */
export interface ControlProcessReturn4InterfereRequest {
  tmplId: string; // 受控文档模板id,格式：baseId:id
}

/**
 * title: ControlProcessReturnRequest
 */
export interface ControlProcessReturnRequest {
  buttonConfig: string; // 操作的按钮配置
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  tmplId: string; // 受控文档模板id,格式：baseId:id
}

/**
 * title: CreateAppRequest
 */
export interface CreateAppRequest {
  appId?: string;
  appPkgUrl?: string;
  appVersion?: string;
}

/**
 * title: CreateBranchRequest
 */
export interface CreateBranchRequest {
  appId?: string; // 应用id
  appVersion?: string; // 应用版本号（自建应用需要传）
  description?: string; // 备注
  releaseTag?: string; // 发行标识
  sourceBranchId?: string; // 基线分支id（自建应用需要传）
}

/**
 * title: CreateImportAppResponse
 */
export interface CreateImportAppResponse {
  sourceAppJson?: string;
}

/**
 * title: CreateReleaseRequest
 */
export interface CreateReleaseRequest {
  commitTag?: string; // 提交标识
  releaseContent?: string; // 发行内容
}

/**
 * title: CronDTO
 */
export interface CronDTO {
  cron?: any[]; // corn 表达式 集合
}

/**
 * title: CrossReportConditionDTO
 */
export interface CrossReportConditionDTO {
  columnSelectItems?: Array<SelectItem>;
  columnSubTotalItems?: Array<SelectItem>;
  exp?: string;
  metricSelectItems?: Array<SelectItem>;
  modelCategory?: string;
  modelKey?: string;
  pageNo?: number;
  pageSize?: number;
  pageType?: boolean;
  query?: object;
  rowSelectItems?: Array<SelectItem>;
  rowSubTotalItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
}

/**
 * title: CustomerComplaintRequest
 */
export interface CustomerComplaintRequest {
  address?: string; // 抱怨地址
  adverseProcedure?: string; // 是否启动不良事件程序
  attachment?: string; // 抱怨附件信息
  batchNumber?: string; // 批号
  complaintCount?: string; // 抱怨数量
  contact?: string; // 联系方式
  description?: string; // 抱怨描述
  fatal?: string; // 致死
  firsttimeUse?: string; // 第一次使用
  instanceId?: string; // 实例Id
  measuresAvoidDamage?: string; // 采取措施避免损伤
  occurrenceTime?: string; // 抱怨发生时刻
  otherInfo?: string; // 其他信息
  patientCondition?: string; // 病人情况
  person?: string; // 抱怨人
  productName?: string; // 产品名称
  receiveDate?: string; // 抱怨接收日期
  recordId?: string; // 记录Id
  region?: string; // 抱怨地区
  repeatUse?: string; // 重复使用
  reportUrl?: string; // 报告地址
  severeLoss?: string; // 严重损伤
  source?: string; // 来源
  specificationModel?: string; // 规格型号
  status?: number; // 状态
  synced?: number; // 是否同步
  udi?: string; // UDI
}

/**
 * title: CustomerComplaintResponse
 */
export interface CustomerComplaintResponse {
  address?: string; // 抱怨地址
  adverseProcedure?: string; // 是否启动不良事件程序
  attachment?: string; // 抱怨附件信息
  batchNumber?: string; // 批号
  complaintCount?: string; // 抱怨数量
  contact?: string; // 联系方式
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 抱怨描述
  fatal?: string; // 致死
  firsttimeUse?: string; // 第一次使用
  id?: string; // 主键
  instanceId?: string; // 实例Id
  measuresAvoidDamage?: string; // 采取措施避免损伤
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  occurrenceTime?: string; // 抱怨发生时刻
  otherInfo?: string; // 其他信息
  patientCondition?: string; // 病人情况
  person?: string; // 抱怨人
  productName?: string; // 产品名称
  receiveDate?: string; // 抱怨接收日期
  recordId?: string; // 记录Id
  region?: string; // 抱怨地区
  repeatUse?: string; // 重复使用
  reportUrl?: string; // 报告地址
  severeLoss?: string; // 严重损伤
  source?: string; // 来源
  specificationModel?: string; // 规格型号
  status?: number; // 状态
  synced?: number; // 是否同步
  udi?: string; // UDI
}

/**
 * title: DashboardRequest
 */
export interface DashboardRequest {
  config?: string; // 仪表盘配置详情
  name?: string; // 名称
  sortNum?: number; // 排序号
  source?: number; // 仪表盘来源
  status?: number; // 状态
}

/**
 * title: DashboardResponse
 */
export interface DashboardResponse {
  config?: string; // 仪表盘配置详情
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  sortNum?: number; // 排序号
  source?: number; // 仪表盘来源
  status?: number; // 状态
}

/**
 * title: DashboardSortRequest
 */
export interface DashboardSortRequest {
  id: string; // 看板id主键
  targetSortNum: number; // 目标位置排序号
}

/**
 * title: DataCollectionInstanceAbandonRequest
 */
export interface DataCollectionInstanceAbandonRequest {
  id?: string; // 表单实例Id
  reason?: string; // 作废原因
  signHistoryIds?: any[]; // 签名历史id集合
  taskId?: string; // 数据采集任务id
}

/**
 * title: DataCollectionOnlineFormInstanceRequest
 */
export interface DataCollectionOnlineFormInstanceRequest {
  dataCollectionTaskId?: string; // 数据采集任务Id
  instanceAlias?: string; // 表单实例备注名
}

/**
 * title: DataCollectionOnlineFormInstanceUpdateRequest
 */
export interface DataCollectionOnlineFormInstanceUpdateRequest {
  id?: string; // 表单实例Id
  instanceAlias?: string; // 表单实例备注名
}

/**
 * title: DataCollectionTaskUpdateStatusRequest
 */
export interface DataCollectionTaskUpdateStatusRequest {
  taskId?: string; // 数据采集任务id
}

/**
 * title: DataModelRequest
 */
export interface DataModelRequest {
  categoryId?: string; // 分类id
  description?: string; // 描述
  fieldConfig?: Array<FieldAttribute>; // 字段配置json
  fieldMapping?: Array<SingleField>; // 字段映射关系
  key?: string; // 模型key
  name?: string; // 模型名称
}

/**
 * title: DataModelResponse
 */
export interface DataModelResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  fieldConfig?: Array<FieldAttribute>; // 字段配置json
  fieldMapping?: Array<SingleField>; // 字段映射关系
  id?: string; // 主键
  key?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模型名称
  type?: string; // 类型(默认为基础模型)
}

/**
 * title: DataSourceDTO
 */
export interface DataSourceDTO {
  dbName?: string; // 数据库名称
  id?: string; // 数据源id
  key?: string; // 数据源key
  name?: string; // 数据源名称
  type?: string; // 数据库类型
}

/**
 * title: DataSourceProperties
 */
export interface DataSourceProperties {
  driverClassName?: string;
  hikari?: HikariCpConfig;
  host?: string;
  password?: string;
  pollName?: string;
  port?: string;
  primaryDbName?: string;
  url?: string;
  username?: string;
}

/**
 * title: DataSourceSelectRequest
 */
export interface DataSourceSelectRequest {
  key?: string; // 数据源key
  sql?: string; // sql
}

/**
 * title: DataTraceRequest
 */
export interface DataTraceRequest {
  beginCreateTime?: string; // 操作时间起
  createUserId?: string;
  dataId?: string; // 数据Id
  detail?: string; // 详细数据
  endCreateTime?: string; // 操作时间止
  module?: string; // 模块名称
  modules?: any[]; // 多个模块
  operateType?: string; // 操作类型
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  triggerType?: number; // 触发方式
  type?: string;
  updateJson?: string; // 修改内容
}

/**
 * title: DataTraceResponse
 */
export interface DataTraceResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string; // 数据Id
  detail?: string; // 详细数据
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块名称
  operateType?: string; // 操作类型
  triggerType?: number; // 触发方式
  updateJson?: string; // 修改内容
  userName?: string; // 用户账号
}

/**
 * title: DatasourceMove
 */
export interface DatasourceMove {
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  detail?: DatasourceMoveDetail;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  status?: string;
  tenantId?: string;
}

/**
 * title: DatasourceMoveDetail
 */
export interface DatasourceMoveDetail {
  branchId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  destEnv?: string;
  id?: string;
  in?: boolean;
  modelKey?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  moveDataIds?: any[];
  moveId?: string;
  name?: string;
  sourceEnv?: string;
  status?: string;
  tenantId?: string;
  type?: string;
}

/**
 * title: DateExportConfig
 */
export interface DateExportConfig {
  date?: number; // 日期
  dateTime?: number; // 日期时间
  exportFormat?: string; // 导出连接值
  time?: number; // 时间
}

/**
 * title: DefaultValue
 */
export interface DefaultValue {
  name?: string;
  type?: string; // NONE/无默认值,FIXED/固定值,REF_FIELD/引用字段值
  value?: object;
}

/**
 * title: DeployRequest
 */
export interface DeployRequest {
  active?: number; // 是否激活(0 未激活,1 已激活)
  id?: string; // 流程id
  json?: string; // 流程设计json
  xml?: string; // 流程设计xml
}

/**
 * title: DesignerOperateLogResponse
 */
export interface DesignerOperateLogResponse {
  createTime?: string; // 创建时间
  createUserId?: string; // 创建人ID
  createUserName?: string; // 创建人
  id?: string; // ID
  inputContent?: string; // 入参
  module?: string; // 所属应用模块(模型设计:MODEL_DESIGN,页面设计:PAGE_DESIGN,打印设计:PRINT_DESIGN,逻辑开发:LOGIC_DEVELOP,流程设计:PROCESS_DESIGN,国际化:LANGUAGE,全局事件:GLOBAL_EVENT系统变量:SYSTEM_VARIABLES,一键部署:DEPLOY,基础设置:BASIC_SETTING,菜单设置:MENU_SETTING,版本管理:VERSION_CONTROL)
  operateType?: string; // 操作类型(新增:INSERT,更新:UPDATE,删除:DELETE)
  outputContent?: string; // 出参
  requestInfo?: string; // 接口请求信息
}

/**
 * title: DhrProcessApproveRequest
 */
export interface DhrProcessApproveRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId?: string;
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: DhrProcessJumpRequest
 */
export interface DhrProcessJumpRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  jumpMode: string; // 跳转模式：下一个节点：NextNode、开始节点：StartNode、结束节点：EndNode
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: DhrProcessReassign4InterfereRequest
 */
export interface DhrProcessReassign4InterfereRequest {
  businessId?: string; // 业务ID
  edhrInstanceId: string; // Edhr实例id
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: DhrProcessReassignRequest
 */
export interface DhrProcessReassignRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: DhrProcessReturn4InterfereRequest
 */
export interface DhrProcessReturn4InterfereRequest {
  businessId?: string; // 业务ID
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  taskId: string; // 任务id
}

/**
 * title: DhrProcessReturnRequest
 */
export interface DhrProcessReturnRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: DifyChatRequest
 */
export interface DifyChatRequest {
  id?: string; // 客诉id
  message?: string; // 用户输入/提问内容
  saleRecords?: any[]; // ERP mock数据
}

/**
 * title: DifyDocRequest
 */
export interface DifyDocRequest {
  ofInstId?: string; // 实例id
  url?: string; // pdf对应url
}

/**
 * title: DigitsFieldDTO
 */
export interface DigitsFieldDTO {
  key?: string; // 字段key
  modelCategory?: string; // 模型大类型 entity/实体,view/视图,data/数据
  modelKey?: string; // 模型定义表key
  modelName?: string; // 模型名称
  name?: string; // 名称
  type?: string; // 数据类型
}

/**
 * title: DocControlCategoryCompleteVO
 */
export interface DocControlCategoryCompleteVO {
  children?: Array<DocControlCategoryCompleteVO>; // 子分类
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属模块(实体、枚举、web页面)
  name?: string; // 分类名称
  parentId?: string; // 父节点id
  procDefId?: string; // 模板审批流程定义id
  refId?: string; // 分类id/模板id
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: DocControlProcessResponse
 */
export interface DocControlProcessResponse {
  docOutlines?: Array<DocOutlineResponse>; // edhr模板所关联之目录大纲
  edhrTmpl?: EdhrTmplResponse; // edhr实例对象
  ofTmpl?: OnlineFormTmplResponse; // 在线表单模板
  operationsDTO?: OfProcessOperationsDTO; // 用户可操作之按钮、节点信息、任务id
}

/**
 * title: DocControlStartedRequest
 */
export interface DocControlStartedRequest {
  controlTmplType?: string; // 受控文件类型：FORM表单模板、EDHR edhr模板
  docBaseId?: string; // 受控文件版本编码(表单/edhr模板编号)
  docCode?: string; // 受控文件版本编码(表单/edhr模板编号)
  docName?: string; // 受控文件名称(表单/edhr模板名称)
  docVersionId?: string; // 受控文件版本id(表单/edhr模板id)
  effectiveDate?: string; // 生效日期
  initiator?: string; // 发起人iD
  initiatorName?: string; // 发起人姓名
  offlineVersion?: string; // 线下版本号
  processInstanceId?: string; // 流程实例id
  snapshot?: string; // 发起审核时数据的快照
  startTime?: string; // 提报时间
  status?: string; // 状态
  version?: string; // 版本
}

/**
 * title: DocControlStartedResponse
 */
export interface DocControlStartedResponse {
  categoryName?: string; // 分类名称
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  controlTmplType?: string; // 受控文件类型：FORM表单模板、EDHR edhr模板
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docBaseId?: string; // 受控文件版本编码(表单/edhr模板编号)
  docCode?: string; // 受控文件版本编码(表单/edhr模板编号)
  docName?: string; // 受控文件名称(表单/edhr模板名称)
  docVersionId?: string; // 受控文件版本id(表单/edhr模板id)
  effectiveDate?: string; // 生效日期
  id?: string; // 主键
  initiator?: string; // 发起人iD
  initiatorName?: string; // 发起人姓名
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  offlineVersion?: string; // 线下版本号
  processInstanceId?: string; // 流程实例id
  snapshot?: string; // 发起审核时数据的快照
  startTime?: string; // 提报时间
  status?: string; // 状态
  version?: string; // 版本
}

/**
 * title: DocControlTaskDoneResponse
 */
export interface DocControlTaskDoneResponse {
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  categoryName?: string; // 分类名称
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  controlTmplType?: string; // 受控文件类型：FORM表单模板、EDHR edhr模板
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docBaseId?: string; // 受控文件(表单/edhr模板)BASE_ID
  docCode?: string; // 受控文件版本编码(表单/edhr模板编号)
  docControlStartedId?: string; // 文控管理-我的发起ID
  docName?: string; // 受控文件名称(表单/edhr模板名称)
  docVersionId?: string; // 受控文件版本id(表单/edhr模板id)
  id?: string; // 主键
  initiator?: string; // 发起人iD
  initiatorName?: string; // 发起人姓名
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  offlineVersion?: string; // 线下版本号
  processInstanceId?: string; // 流程实例id
  startTime?: string; // 提报时间
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务id
  taskStartTime?: string; // 任务开始时间
  version?: string; // 版本
}

/**
 * title: DocControlTaskTodoResponse
 */
export interface DocControlTaskTodoResponse {
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  categoryName?: string; // 分类名称
  controlStatus?: string; // 受控状态(UNCONTROLLED,RUNNING,CONTROLLED)
  controlTmplType?: string; // 受控文件类型：FORM表单模板、EDHR edhr模板
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docBaseId?: string; // 受控文件(表单/edhr模板)BASE_ID
  docCode?: string; // 受控文件版本编码(表单/edhr模板编号)
  docControlStartedId?: string; // 文控管理-我的发起ID
  docName?: string; // 受控文件名称(表单/edhr模板名称)
  docVersionId?: string; // 受控文件版本id(表单/edhr模板id)
  id?: string; // 主键
  initiator?: string; // 发起人iD
  initiatorName?: string; // 发起人姓名
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  offlineVersion?: string; // 线下版本号
  processInstanceId?: string; // 流程实例id
  startTime?: string; // 提报时间
  taskId?: string; // 任务id
  taskStartTime?: string; // 任务开始时间
  version?: string; // 版本
}

/**
 * title: DocOutlineBase
 */
export interface DocOutlineBase {
  baseId?: string; // 基础单据id(DHR ID)
  fullPath?: string;
  id?: string; // id
  name?: string; // 名称
  ofRequired?: number; // 在线表单是否必填 1: 必填 0 非必填
  refId?: string; // 引用id
  sortNum?: number; // 排序号
  type?: string; // 类型(大纲:OUTLINE/单据:DOC)
}

/**
 * title: DocOutlineRequest
 */
export interface DocOutlineRequest {
  baseId?: string; // 基础单据id(DHR ID)
  description?: string; // 备注
  name?: string; // 名称
  ofRequired?: number; // 在线表单是否必填 1: 必填 0 非必填
  parentId?: string; // 父节点id
  refId?: string; // 引用单据id
  type?: string; // 类型(大纲:OUTLINE/单据:DOC)
}

/**
 * title: DocOutlineResponse
 */
export interface DocOutlineResponse {
  baseId?: string; // 基础单据id(DHR ID)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单 、 VIEW 视图表单、TEXT 文本表单
  fullPath?: string; // 全路径
  id?: string; // id
  instanceStatus?: string; // 表单实例状态(此大纲关联下的表单状态)：UNFILLED 未填报、RUNNING 进行中、COMPLETED 已填报 
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  ofRequired?: number; // 在线表单是否必填 1: 必填 0 非必填
  parentId?: string; // 父节点id
  refId?: string; // 引用单据id
  rootNode?: boolean; // 是否为根节点(true: 根节点)
  sortNum?: number; // 排序号
  type?: string; // 类型(大纲:OUTLINE/单据:DOC)
}

/**
 * title: DocOutlineSortDTO
 */
export interface DocOutlineSortDTO {
  id?: string; // 选中目录id
  targetParentId?: string; // 目标位置父节点id
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: DocumentDTO
 */
export interface DocumentDTO {
  designerJson?: string; // 设计json
  runtimeJson?: string; // 运行时json
}

/**
 * title: DocumentInfo4Req
 */
export interface DocumentInfo4Req {
  ids?: any[]; // 单据id集合
}

/**
 * title: DocumentRequest
 */
export interface DocumentRequest {
  baseId?: string; // 父id
  categoryId?: string; // 分类id
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  designerJson?: string; // 设计json
  height?: number; // 尺寸（高度 单位/mm）
  key?: string; // 单据key
  modelCategory?: string; // 绑定模型类型(实体:entity,视图:view,数据:data)
  modelKey?: string; // 绑定模型key
  name?: string; // 单据名称
  paperSize: string; // 纸张大小
  runtimeJson?: string; // 运行时json
  version?: string; // 版本
  width?: number; // 尺寸（宽度 单位/mm）
}

/**
 * title: DocumentResponse
 */
export interface DocumentResponse {
  baseId?: string;
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  defaulted?: number;
  deleted?: number;
  description?: string; // 备注
  designerJson?: string; // 设计json
  draft?: number;
  height?: number; // 尺寸（高度 单位/mm）
  id?: string; // id
  initCommitId?: string;
  key?: string; // 单据key
  modelCategory?: string; // 绑定模型类型(实体:entity,视图:view,数据:data)
  modelKey?: string; // 绑定模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 单据名称
  paperSize?: string; // 纸张大小
  runtimeJson?: string; // 运行时json
  sysBuiltin?: number;
  version?: string;
  viewType?: string;
  width?: number; // 尺寸（宽度 单位/mm）
}

/**
 * title: EdhrCategoryRequest
 */
export interface EdhrCategoryRequest {
  fullPath?: string; // 全路径
  level?: number; // 层级
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
}

/**
 * title: EdhrCategoryResponse
 */
export interface EdhrCategoryResponse {
  createOrgId?: string; // 创建人部门id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  level?: number; // 层级
  modifyOrgId?: string; // 修改人部门id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
  tenantId?: string; // 租户id
}

/**
 * title: EdhrCirculationFormModelMetaRequest
 */
export interface EdhrCirculationFormModelMetaRequest {
  deletePolicy?: number; // 数据删除策略:(1 物理删除,0 逻辑删除)
  description?: string; // 模型描述
  displayField?: string; // 默认显示字段
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  initCommitId?: string; // 初始提交 id
  key?: string; // 模型key
  name?: string; // 模型名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  recycled?: number; // 是否进入回收站
  refModelKey?: string; // 关联的模型key
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  specificConfig?: string; // 特有属性配置选项(json格式)
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  supportMessage?: number; // 支持消息通知
  supportProcess?: number; // 支持流程
  supportStateMachine?: number; // 支持状态机
  sysBuiltin?: number; // 是否内置
  type?: string; // 模型类型
}

/**
 * title: EdhrCirculationFormModelMetaResponse
 */
export interface EdhrCirculationFormModelMetaResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number; // 数据删除策略:(1 物理删除,0 逻辑删除)
  description?: string; // 模型描述
  displayField?: string; // 默认显示字段
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  id?: string; // 主键
  initCommitId?: string; // 初始提交 id
  key?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模型名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  recycled?: number; // 是否进入回收站
  refModelKey?: string; // 关联的模型key
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  specificConfig?: string; // 特有属性配置选项(json格式)
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  supportMessage?: number; // 支持消息通知
  supportProcess?: number; // 支持流程
  supportStateMachine?: number; // 支持状态机
  sysBuiltin?: number; // 是否内置
  type?: string; // 模型类型
}

/**
 * title: EdhrInstance
 */
export interface EdhrInstance {
  appId?: string;
  approveProcInstId?: string;
  canArchived?: boolean;
  code?: string;
  completedTime?: string;
  createTime?: string;
  createType?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  docOutlineSnapshot?: string;
  id?: string;
  instanceStatus?: string;
  materialNo?: string;
  materialRunningStatus?: string;
  materialStatus?: string;
  mfgOrderCode?: string;
  mfgOrderId?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string;
  orderCode?: string;
  params?: string;
  productCode?: string;
  productFamilyId?: string;
  productId?: string;
  productIdRbi?: string;
  productIdRi?: string;
  productName?: string;
  productVersion?: string;
  serialNo?: string;
  shopfloorId?: string;
  spec?: string;
  summarySnapshot?: string;
  tmplId?: string;
  tmplName?: string;
  tmplVersion?: string;
}

/**
 * title: EdhrInstanceQueryRequest
 */
export interface EdhrInstanceQueryRequest {
  createUserId?: string; // 创建人id
  device?: string; // 设备
  endTime?: string; // 创建时间-结束
  instanceStatus?: string; // edhr状态
  materialNo?: string; // 记录标识
  materialNos?: any[]; // 批次/SN数组
  materialStatus?: string; // 记录类型(NO或SN)
  mfgOrderId?: string; // 工单id
  modifyUserId?: string; // 更新人id
  module?: string; // 模块类型
  operator?: string; // 操作人
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  productId?: string; // 产品ID
  serialNo?: string; // 流水号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建时间-开始
}

/**
 * title: EdhrInstanceRelationRequest
 */
export interface EdhrInstanceRelationRequest {
  childInstId?: string; // 子eDHR实例ID
  instId?: string; // eDHR实例ID
}

/**
 * title: EdhrInstanceRequest
 */
export interface EdhrInstanceRequest {
  materialNo: string; // 物料编号
  materialStatus: string; // 物料形态(批次或SN)
  module?: string; // 模块类型
  params?: string; // 实例参数(业务扩展属性)
  productId: string; // 产品ID
  productionType?: string; // 生产状态
  tmplId: string; // eDHR模板ID
}

/**
 * title: EdhrInstanceResponse
 */
export interface EdhrInstanceResponse {
  appId?: string; // 应用ID
  canArchived?: boolean; // 是否能归档
  completedTime?: string; // 完成时间
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键ID
  instanceStatus?: string; // edhr实例状态: 未填报：UNFILLED、进行中：RUNNING、已完成：COMPLETED、已归档：ARCHIVED
  materialNo?: string; // 物料编号
  materialRunningStatus?: string; // 物料状态
  materialStatus?: string; // 物料形态(LOT或SN)
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单号
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块类型
  params?: string; // 实例参数(业务扩展属性)
  productCode?: string;
  productId?: string; // 产品ID
  productName?: string; // 产品名称
  productVersion?: string; // 产品版本号
  serialNo?: string; // 流水号
  spec?: string;
  tmplId?: string; // eDHR模板ID
  tmplName?: string; // eDHR模板
  tmplVersion?: string; // eDHR模板版本
}

/**
 * title: EdhrInstanceSearchHistoryResponse
 */
export interface EdhrInstanceSearchHistoryResponse {
  createOrgId?: string; // 创建人部门id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataVersion?: number; // 数据版本
  id?: string; // ID
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料编号
  modifyOrgId?: string; // 修改人部门id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  tenantId?: string; // 租户id
}

/**
 * title: EdhrLogEntity
 */
export interface EdhrLogEntity {
  bindFormName?: string;
  btnCfg?: string;
  btnType?: string;
  createOrgId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataVersion?: number;
  edhrLogUserList?: Array<EdhrLogUserEntity>;
  formInstanceId?: string;
  formTmplId?: string;
  id?: string;
  instanceId?: string;
  modifyOrgId?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  recordJson?: string;
  remark?: string;
  startDate?: string;
  tenantId?: string;
  tmplId?: string;
  traceId?: string;
}

/**
 * title: EdhrLogUserEntity
 */
export interface EdhrLogUserEntity {
  avatar?: string;
  createOrgId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataVersion?: number;
  edhrLogId?: string;
  fullName?: string;
  id?: string;
  modifyOrgId?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  opeSeq?: string;
  opinion?: string;
  sortNum?: number;
  taskId?: string;
  tenantId?: string;
  userId?: string;
}

/**
 * title: EdhrSummaryRelationDhrTraceDetail
 */
export interface EdhrSummaryRelationDhrTraceDetail {
  container?: string; // 关联批次
  dhrName?: string; // DHR名称
  mfgOrder?: string; // 关联工单
  operateType?: string; // 操作类型
  productCode?: string; // 产品编码
  productName?: string; // 产品名称
  source?: string; // 来源
  spec?: string; // 规格型号
}

/**
 * title: EdhrSummaryTraceDetail
 */
export interface EdhrSummaryTraceDetail {
  formInstName?: string; // 表单备注名
  formTmplCode?: string; // 表单编号
  formTmplName?: string; // 表单名称
  operateType?: string; // 操作类型
  serialNo?: string; // 流水号
  source?: string; // 来源
}

/**
 * title: EdhrSummaryTraceEntity
 */
export interface EdhrSummaryTraceEntity {
  edhrInstList?: Array<EdhrSummaryRelationDhrTraceDetail>; // 关联eDhr实例
  formInstList?: Array<EdhrSummaryTraceDetail>; // 表单实例
}

/**
 * title: EdhrTmplCommonRequest
 */
export interface EdhrTmplCommonRequest {
  baseId?: string; // 父id
  categoryId?: string; // 分类id
  code?: string; // 编号
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  module: string; // 模块类型
  name?: string; // 名称
  offlineVersion?: string; // 电子记录-线下版本号
  version?: string; // 版本
}

/**
 * title: EdhrTmplRequest
 */
export interface EdhrTmplRequest {
  baseId?: string; // 父id
  categoryId?: string; // 分类id
  code?: string; // 编号
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  name?: string; // 名称
  offlineVersion?: string; // 电子记录-线下版本号
  version?: string; // 版本
}

/**
 * title: EdhrTmplResponse
 */
export interface EdhrTmplResponse {
  approveStatus?: string; // 审核状态
  baseId?: string; // 父id
  categoryId?: string; // 分类Id
  categoryName?: string; // 分类名称
  code?: string; // 编号
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  docControlStartedId?: string; // 文控管理-我的发起ID
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块类型
  name?: string; // 名称
  offlineVersion?: string; // 线下版本
  operatingState?: boolean; // 状态
  procInstId?: string; // 审批流程实例ID
  version?: string; // 版本
}

/**
 * title: ElementInfoResponse
 */
export interface ElementInfoResponse {
  appId?: string; // 应用Id
  branchId?: string; // 分支Id
  category?: string; // 分类
  categoryId?: string;
  code?: number; // 代号，标识唯一的路径
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 应用环境
  id?: string; // 主键
  key?: string; // 组件key
  location?: string; // 其他路径
  modelType?: string; // 类型
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块名称
  name?: string; // 组件名称
}

/**
 * title: EnumModelFieldDragRequest
 */
export interface EnumModelFieldDragRequest {
  id?: string; // 枚举字段id
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: EnumModelFieldRequest
 */
export interface EnumModelFieldRequest {
  enumModelId?: string; // 枚举模型id
  i18nConfig?: string; // 多语言配置
  icon?: string; // 图标字段
  iconColor?: string; // 图标颜色字段
  text?: string; // 枚举文本
  textColor?: string; // 枚举名称颜色字段
  value?: string; // 枚举值
}

/**
 * title: EnumModelFieldResponse
 */
export interface EnumModelFieldResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  enumModelId?: string; // 枚举模型id
  i18nConfig?: string; // 多语言配置
  icon?: string; // 图标字段
  iconColor?: string; // 图标颜色字段
  iconState?: number; // 图标启用关闭状态
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  sortNum?: number; // 排序
  source?: string;
  text?: string; // 枚举文本
  textColor?: string; // 枚举名称颜色字段
  textState?: number; // 字段颜色启用关闭状态
  value?: string; // 枚举值
}

/**
 * title: EnumModelFieldSortReq
 */
export interface EnumModelFieldSortReq {
  enumModelId?: string; // 枚举模型id
  ids?: any[];
}

/**
 * title: EnumModelRequest
 */
export interface EnumModelRequest {
  categoryId?: string; // 分类id
  description?: string; // 枚举模型描述
  key?: string; // 枚举模型key
  name?: string; // 枚举模型名称
}

/**
 * title: EnumModelResponse
 */
export interface EnumModelResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  code?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 枚举模型描述
  iconState?: number; // 图标开启关闭状态
  id?: string; // 主键
  key?: string; // 枚举模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 枚举模型名称
  source?: string;
  sysBuiltin?: number; // 是否系统内置服务(0自定义、1内置)
  textState?: number; // 配色开启关闭状态
  visible?: number;
}

/**
 * title: EnumModelState
 */
export interface EnumModelState {
  iconState?: number; // 图标开启关闭状态
  textState?: number; // 配色开启关闭状态
}

/**
 * title: EnumModelSubmitRequest
 */
export interface EnumModelSubmitRequest {
  code?: string; // 编码
  description?: string; // 描述
  fields?: Array<EnumModelFieldRequest>; // 项目列表
  id?: string; // ID，传值时走更新逻辑
  name?: string; // 名称
}

/**
 * title: EventLogResponse
 */
export interface EventLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  endTime?: string; // 结束时间
  error?: number; // 是否异常
  errorInfo?: string; // 异常信息
  id?: string; // ID
  jsKey?: string; // 脚本Key
  key?: string; // 事件key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  type?: string; // 类型(系统、自定义)
}

/**
 * title: EventRequest
 */
export interface EventRequest {
  description?: string; // 备注
  jsKey?: string; // 脚本Key
  key?: string; // key
  type?: string; // 类型
}

/**
 * title: EventResponse
 */
export interface EventResponse {
  appVersionTag?: string; // 应用版本标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  id?: string; // id
  jsKey?: string; // 脚本Key
  jsName?: string; // 脚本或编排名称
  key?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  type?: string; // 类型
}

/**
 * title: ExcelColumnInfo
 */
export interface ExcelColumnInfo {
  aliasName: string; // 列名
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  columnWidth?: number; // 列宽
  createType?: string; // 字段创建类型，前端使用，后端不需要关心
  dataDelimiter?: string; // 数据分割符
  dateFormat?: string; // 日期字段格式
  digits?: number; // 数值字段精度（小数点后位数）
  fieldDelimiter?: string; // 字段分割符
  id?: string; // 字段主键id
  key: string; // 字段key
  regularExp?: string; // 规则表达式
  regularExpForShow?: string; // 规则表达式展示 前端使用
  relationColumns?: any[]; // 关联字段导入
  required: number; // 是否必填，0-非必填；1-必填
  treeNodeColumnField?: string; // 父节点识别字段
  type?: string; // 字段类型type
  userDefined?: string; // 日期字段格式是否自定义格式 1是 ,0 否
  valueMap?: Array<BooleanEntity>;
}

/**
 * title: ExcelColumnInfoV1
 */
export interface ExcelColumnInfoV1 {
  aliasName: string; // 列名
  checked?: boolean; // checked，前端使用，后端不需要关心
  createType?: string; // 字段创建类型，前端使用，后端不需要关心
  dateExportFormat?: DateExportConfig; // 时间字段导出展示格式
  disabled?: boolean; // disabled，前端使用，后端不需要关心
  id?: string; // 字段主键id
  key: string; // 字段key
  mappingType?: string; // 前端用字段
  modelKey?: string; // 模型key
  name?: string; // 字段名，前端使用，后端不需要关心
  numberExportFormat?: NumberExportConfig; // 数据字段导出展示格式
  numberFormats?: any[]; // 数据字段导入格式
  relationColumns?: Array<ExcelColumnInfoV1>; // 关联字段导入
  required?: boolean; // 是否必填，true:必填
  type?: string; // 字段类型type
  width?: number; // 宽，前端使用，后端不需要关心
}

/**
 * title: ExcelTemplateConfigReq
 */
export interface ExcelTemplateConfigReq {
  configJson?: ExcelTmplConfig; // 模板配置
  key?: string; // 模板key
  modelKey?: string; // 模型key
}

/**
 * title: ExcelTemplateConfigV1Req
 */
export interface ExcelTemplateConfigV1Req {
  configJsons?: Array<ExcelTmplConfigV1>; // 模板配置
  exeType?: number; // 执行方式 0：同步，1：异步
  key?: string; // 模板key
  lsKey?: string; // 业务逻辑脚本key
  modelKey?: string; // 模型key
  modelTemplateName?: string; // 模板name
  vsKey?: string; // 验证规则脚本key
}

/**
 * title: ExcelTmplConfig
 */
export interface ExcelTmplConfig {
  columns?: Array<ExcelColumnInfo>; // 模板中的字段集合
  duplicateKeyUpdate: number; // 导入策略 1 新增及更新/0 忽略重复数据
  notes?: string; // 模板的备注信息 ,填写提示信息
  rowHeight?: number; // 模板备注信息行高度，默认100
  uniqueColumns: any[]; // 防重校验字段
  version?: number; // 版本：24年10月份重构版本号为1
}

/**
 * title: ExcelTmplConfigV1
 */
export interface ExcelTmplConfigV1 {
  columns?: Array<ExcelColumnInfoV1>; // 模板中的字段集合
  duplicateKeyUpdate: any[]; // 导入策略 0 仅新增（忽略重复数据）/1 新增及更新/2 仅更新数据
  modelKey?: string; // 模型key
  relationColumnKey?: string; //  主子导入时，子表对应的父表中的关联字段key
  relationColumnName?: string; //  主子导入时，子表对应的父表中的关联字段名
  required?: Array<ExcelColumnInfoV1>; // 必填字段
  rowHeight?: number; // 模板备注信息行高度，默认100
  tmplKey?: string; // 模板key
  tmplName?: string; // 模板名称
  type?: number; // 模型类型 1：主模型； 2：子模型
  uniqueColumns: Array<ExcelColumnInfoV1>; // 防重校验字段
}

/**
 * title: ExcelTmplRequest
 */
export interface ExcelTmplRequest {
  description?: string; // 描述
  exeType?: number; // 执行方式 0：同步，1：异步
  key?: string; // 模板key
  lsKey?: string; // 业务逻辑脚本key
  modelKey?: string; // 模型定义表key
  name?: string; // 模板名称
  type?: string; // 类型：IMPORT-导入;EXPORT-导出
  version?: number; // 版本号，区分历史模板，24年10月份重构版本号为1
  vsKey?: string; // 验证规则脚本key
}

/**
 * title: ExcelTmplResponse
 */
export interface ExcelTmplResponse {
  configJson?: string; // 模板配置详情(编码)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  exeType?: number; // 执行方式 0：同步，1：异步
  filePath?: string; // 模板相对路径,为空时没有配置模板
  id?: string; // 主键
  key?: string; // 模板key
  lsKey?: string; // 业务逻辑脚本key
  modelKey?: string; // 模型定义表key
  modelName?: string; // 模型定义表name
  modelType?: string; // 模型标志:(NDO/RDO)
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模板名称
  supportProcess?: number; // 支持流程
  supportStateMachine?: number; // 支持状态机
  supportTree?: number; // 支持树形结构
  type?: string; // 类型：IMPORT-导入;EXPORT-导出
  version?: number; // 模板版本
  vsKey?: string; // 验证规则脚本key
}

/**
 * title: ExcelValidateResponse
 */
export interface ExcelValidateResponse {
  dict?: object;
  errNumber?: number; // 导入失败条数
  error?: boolean;
  fileId?: string; // 导入文件id
  okData?: any[];
  okMSData?: object;
  resultReport?: Array<IEReport>; // 结果报告
  succeed?: number; // 导入成功条数
  total?: number; // 总条数
  updateData?: any[];
  updateMSData?: object;
}

/**
 * title: ExchangeUserRange
 */
export interface ExchangeUserRange {
  key?: string;
  value?: string;
  valueId?: string;
}

/**
 * title: ExpConfig
 */
export interface ExpConfig {
  exp?: string;
  expression?: string;
  relationColumns?: any[];
}

/**
 * title: ExportFormRequest
 */
export interface ExportFormRequest {
  ids: any[];
  type: string;
}

/**
 * title: ExprDTO
 */
export interface ExprDTO {
  alias?: string; // 字段名，最外层才有
  args?: Array<ExprEntity>; // 参数，当 type=FUNC 时才有
  name?: string; // 函数名，当 type=FUNC 时才有
  type?: string; // 类型，CONST(值)/COLUMN(列)/FUNC(函数)
  value?: object; // 值，当 type=CONST/COLUMN 时才有
}

/**
 * title: ExprEntity
 */
export interface ExprEntity {
  alias?: string; // 字段名，最外层才有
  args?: Array<ExprEntity>; // 参数，当 type=FUNC 时才有
  name?: string; // 函数名，当 type=FUNC 时才有
  type?: string; // 类型，CONST(值)/COLUMN(列)/FUNC(函数)
  value?: object; // 值，当 type=CONST/COLUMN 时才有
}

/**
 * title: ExtFieldConfig
 */
export interface ExtFieldConfig {
  encrypted?: number; // 启用密文展示(密文:1 ,明文:0)
  fieldName?: string; // 字段名称
  id?: string; // 主键
  relationField?: string; // 所属字段(ext0,ext1,ext2,ext3,ext4,ext5,...,ext9)
  required?: number; // 是否必填
  type?: number; // 字段数据类型
}

/**
 * title: FieldAttribute
 */
export interface FieldAttribute {
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  createTime?: string;
  createType?: string; // 字段创建类型，包含三种：SYSTEM-系统字段；BUILTIN-内置字段；USER_DEFINED-自定义字段
  createUserId?: string;
  createUserName?: string;
  defaultValue?: DefaultValue;
  defaultValueTips?: any[]; // 枚举默认值翻译
  description?: string;
  i18nConfig?: string; // 多语言配置
  id?: string;
  initCommitId?: string; // initCommitId
  key?: string; // 字段key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 字段name
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  specificConfig?: object; // 特有属性配置选项(json格式)
  type?: string; // 字段类型
}

/**
 * title: FieldBriefInfo
 */
export interface FieldBriefInfo {
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
  key?: string; // 字段key
  modelKey?: string; // 模型定义表key
  name?: string; // 名称
  required?: number; // 是否必填:(0否,1是)
  type?: string; // 数据类型
}

/**
 * title: FieldColumnMapping
 */
export interface FieldColumnMapping {
  column?: string; // 字段对应表列
  enabled?: number; // 状态 0：禁用 1：启用
  key?: string; // 字段key
  name?: string; // 名称
  type?: string; // 字段类型
}

/**
 * title: FieldConfig
 */
export interface FieldConfig {
  fields?: Array<SingleField>;
}

/**
 * title: FieldMeta
 */
export interface FieldMeta {
  backendOnly?: number; // 只在后端使用
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  bizType?: string; // 业务字段类型
  createTime?: string;
  createType?: string; // 字段创建类型，包含三种：SYSTEM-系统字段；BUILTIN-内置字段；USER_DEFINED-自定义字段
  createUserId?: string;
  createUserName?: string;
  defaultValue?: DefaultValue; // 默认值
  description?: string; // 描述
  draft?: number;
  expression?: string; // 公式字段的表达式
  functionName?: string; // 公式字段时,函数名
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
  initCommitId?: string;
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentField?: number;
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  sortNum?: number; // 排序
  source?: string;
  specificConfig?: object; // 特有属性配置选项(json格式)
  sysBuiltin?: number;
  type?: string; // 数据类型
  uniqueConstraint?: UniqueConstraint; // 唯一约束
}

/**
 * title: FieldMeta4Check
 */
export interface FieldMeta4Check {
  expConfig?: ExpConfig; // 公式属性配置
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
}

/**
 * title: FieldMetaBase
 */
export interface FieldMetaBase {
  key?: string; // 字段key
  name?: string; // 字段名称
}

/**
 * title: FieldMetaDTO
 */
export interface FieldMetaDTO {
  backendOnly?: number; // 只在后端使用
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  bizType?: string; // 业务字段类型
  createTime?: string;
  createType?: string; // 字段创建类型，包含三种：SYSTEM-系统字段；BUILTIN-内置字段；USER_DEFINED-自定义字段
  createUserId?: string;
  createUserName?: string;
  defaultValue?: DefaultValue; // 默认值
  defaultValueTips?: any[]; // 枚举默认值翻译
  description?: string; // 描述
  draft?: number;
  expression?: string; // 公式字段的表达式
  fieldCategory?: string; // 字段类型扩展(process 流程)
  functionName?: string; // 公式字段时,函数名
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
  initCommitId?: string;
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelCategory?: string; // 模型大类型 entity/实体,view/视图,data/数据
  modelKey?: string; // 模型定义表key
  modelMeta?: ModelMeta;
  modelName?: string; // 模型名称
  modelType?: string; // 模型类型
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  originFieldKey?: string;
  originModelKey?: string;
  parentField?: number;
  rdoUniqueFieldKey?: boolean;
  refModelSource?: string;
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  relationModelName?: string; // 关联模型名称
  required?: number; // 是否必填:(0否,1是)
  sortNum?: number; // 排序
  source?: string;
  specificConfig?: object; // 特有属性配置选项(json格式)
  sysBuiltin?: number;
  type?: string; // 数据类型
  uniqueConstraint?: UniqueConstraint; // 唯一约束
}

/**
 * title: FieldMetaFormVO
 */
export interface FieldMetaFormVO {
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  defaultValue?: DefaultValue; // 默认值
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  name?: string; // 名称
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  specificConfig?: object; // 特有属性配置选项(json格式)
  subFieldKeys?: Array<FieldMetaFormVO>;
  type?: string; // 数据类型 (primary_key/主键,tenant/租户关联,ref_master_id/关联主键,text/短文本,long_text/长文本,integer/整数,long/长整数,decimal/精度小数,boolean/布尔,binary/二进制流,date/日期,time/时间,date_time/日期时间,user_multi/人员多选,org_multi/部门多选,image/图片,attachment/附件enum/枚举,serial/序列号,ref/引用关联,master_slave/主子关联,enum_multi/枚举多选,ref_multi/模型多选,expression/公式,agg/汇总,esop/E-SOP)
  uniqueConstraint?: UniqueConstraint; // 约束类型 GLOBAL:全局唯一 LEVEL:层级唯一
}

/**
 * title: FieldMetaResponse
 */
export interface FieldMetaResponse {
  backendOnly?: number; // 只在后端使用
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  createTime?: string;
  createType?: string; // 字段创建类型，包含三种：SYSTEM-系统字段；BUILTIN-内置字段；USER_DEFINED-自定义字段
  createUserId?: string;
  createUserName?: string;
  defaultValueTips?: any[]; // 枚举默认值翻译
  description?: string; // 描述
  draft?: number;
  fieldCategory?: string; // 字段类型扩展(process 流程)
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
  initCommitId?: string;
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  modelName?: string;
  modelType?: string; // 模型类型
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentField?: number;
  refModelSource?: string;
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  relationModelName?: string; // 关联模型名称
  required?: number; // 是否必填:(0否,1是)
  sortNum?: number; // 排序
  source?: string;
  sysBuiltin?: number;
  type?: string; // 数据类型
}

/**
 * title: FieldMetaVO
 */
export interface FieldMetaVO {
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  bizType?: string; // 业务字段类型
  defaultValue?: DefaultValue; // 默认值
  description?: string; // 描述
  i18nConfig?: string; // 多语言配置
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  name?: string; // 名称
  parentField?: number; // 父字段（RDO模型使用，0/1）
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  specificConfig?: object; // 特有属性配置选项(json格式)
  type?: string; // 数据类型 (primary_key/主键,tenant/租户关联,ref_master_id/关联主键,text/短文本,long_text/长文本,integer/整数,long/长整数,decimal/精度小数,boolean/布尔,binary/二进制流,date/日期,time/时间,date_time/日期时间,user_multi/人员多选,org_multi/部门多选,image/图片,attachment/附件enum/枚举,serial/序列号,ref/引用关联,master_slave/主子关联,enum_multi/枚举多选,ref_multi/模型多选,expression/公式,agg/汇总,esop/E-SOP,expression_condition/公式条件)
  uniqueConstraint?: UniqueConstraint; // 约束类型 GLOBAL:全局唯一 LEVEL:层级唯一
}

/**
 * title: FieldSortRequest
 */
export interface FieldSortRequest {
  id: string; // 字段id主键
  targetSortNum: number; // 目标位置排序号
}

/**
 * title: FileResource4Req
 */
export interface FileResource4Req {
  ids: any[];
}

/**
 * title: FileResourceResponse
 */
export interface FileResourceResponse {
  createTime?: string; // 创建时间
  createUserId?: string; // 创建人id
  id?: string; // 主键
  name?: string; // 文件名称
  relationId?: string; // 关联id
  relationNav?: string; // 引用文件表相关数据信息(表名字段)
  relationType?: string; // 文件分类(BIZ 业务数据)
  size?: number; // 文件大小
  type?: string; // 文件类型
  url?: string; // 文件相对路径
}

/**
 * title: FileTaskDTO
 */
export interface FileTaskDTO {
  includeSemi?: boolean; // 是否包含半成品批次（当type为EDHR时使用，用于判断打印时是否需要打印半成品批次eDHR）
  tmplInstantId?: string; // 模板实例id
  type?: string; // 文件类型(EDHR/FORM/NOTEBOOK)
}

/**
 * title: FileTaskStatus
 */
export interface FileTaskStatus {
  failInfo?: string; // 失败信息
  fileId?: string; // 文件ID
  fileSize?: number; // 文件大小
  status?: string; // 文件生成状态(TIMEOUT/SUCCEED/FAIL)
}

/**
 * title: FilterConfig
 */
export interface FilterConfig {
  exp?: string;
  expJson?: string;
  query?: object;
  varKeys?: any[];
}

/**
 * title: Flux«string»
 */
export interface Fluxstring {
  prefetch?: number;
}

/**
 * title: FontConfig
 */
export interface FontConfig {
  category?: string;
  key?: string;
  value?: string;
}

/**
 * title: FormInstBomResponse
 */
export interface FormInstBomResponse {
  bomEntries?: any[];
  formTmplBomList?: any[];
  productionIdentificationId?: string;
  qty?: number;
  sequenceEntries?: any[];
}

/**
 * title: FormInstLockResponse
 */
export interface FormInstLockResponse {
  formInstanceId?: string;
  loginUserId?: string;
  loginUserName?: string;
}

/**
 * title: FormRelateDTO
 */
export interface FormRelateDTO {
  approveStatus?: string; // 审核状态
  baseId?: string; // rdo父id
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  children?: Array<FormRelateDTO>; // 版本
  code?: string; // 编码
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 描述
  docControlStartedId?: string; // 文控管理-我的发起ID
  edition?: string; // 版本 (PROFESSIONAL:专业版/EASY:普通版)
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  hasChild?: boolean; // 是否子版本
  hasConfig?: boolean; // 是否添加过配置(有配置:true)
  id?: string; // 关联表主键id
  key?: string; // 分类数据key
  modelKey?: string; // 模型key
  modifyTime?: string; // 最后修改时间
  modifyUserName?: string; // 最后修改人
  module?: string; // DHR所属模块
  name?: string; // 分类数据名称
  officeType?: string;
  offlineVersion?: string; // 线下版本号
  operatingState?: boolean; // 状态
  procInstId?: string; // 审批流程实例ID
  relationId?: string; // 分类数据id
  sortNum?: number; // 排序
  version?: string; // 版本
}

/**
 * title: FormTaskGetDTO
 */
export interface FormTaskGetDTO {
  code?: string; // 单据code
  createUserId?: string; // 创建人ID
  endTime?: string; // 截止时间
  modifyUserId?: string; // 修改人id
  relatedMaterialNo?: string; // 关联批次
  serialNo?: string; // 流水号
  startTime?: string; // 开始时间
  title?: string; // 任务标题
  tmplId?: string; // 表单模板
  tmplName?: string; // 表单名称
  type?: string; // 查询类型(我的单据填报:UNFILLED,我创建的:CREATED ,我已填单据:COMPLETED)
}

/**
 * title: FrontOperateLogResponse
 */
export interface FrontOperateLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // ID
  inputContent?: string; // 入参
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属应用模块
  operateType?: string; // 操作类型(新增:INSERT,更新:UPDATE,SAVE_OR_UPDATE,删除:DELETE)
  outputContent?: string; // 出参
  requestInfo?: string; // 接口请求信息
}

/**
 * title: FrontendPrintRequest
 */
export interface FrontendPrintRequest {
  bizServiceKey: string; // 业务服务key（用于获取填充数据）
  data?: object; // 当业务服务为非 getById 时需要传的参数
  dataId?: string; // 当业务服务为 getById 时需要传 dataId 让后端获取当前表单所属模型数据
  labelId: string; // 标签模板 id
  modelKey: string; // 当前表单所属模型 key
  testVar?: object; // 测试场景下使用的变量数据
}

/**
 * title: GetAppResponse
 */
export interface GetAppResponse {
  appPkgUrl?: string;
  appVersion?: string;
  authState?: number;
  clear?: number;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  id?: string;
  initFailReason?: string;
  logo?: string;
  logoBgColor?: string;
  logoColor?: string;
  logoThumbnail?: string;
  logoType?: string;
  mobileEnabled?: number;
  mobileJson?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  onlineFormBuiltinParamList?: Array<OnlineFormBuiltinParam>;
  pageIcon?: string;
  role?: string;
  sourceAppId?: string;
  sourceAppName?: string;
  sourceAppVersion?: string;
  sourceType?: string;
  state?: string;
  stateCause?: string;
  suiteKey?: string;
  suiteName?: string;
  tenantId?: string;
  type?: string;
  userGrantEnabled?: number;
}

/**
 * title: GlobalMethodRequest
 */
export interface GlobalMethodRequest {
  content?: string; // JS脚本数据
  description?: string; // 方法描述
  key?: string; // 方法key
  name?: string; // 方法名称
  type?: string; // 方法类型:java/自定义
  usage?: string; // markdown格式的使用说明
}

/**
 * title: GlobalMethodResponse
 */
export interface GlobalMethodResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  content?: string; // JS脚本数据
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 方法描述
  id?: string; // 主键
  key?: string; // 方法key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 方法名称
  type?: string; // 方法类型:java/自定义
  usage?: string; // markdown格式的使用说明
}

/**
 * title: GroupItem
 */
export interface GroupItem {
  fieldKey?: string;
  format?: string;
  function?: string;
}

/**
 * title: HikariCpConfig
 */
export interface HikariCpConfig {
  catalog?: string;
  connectionInitSql?: string;
  connectionTestQuery?: string;
  connectionTimeout?: number;
  dataSourceClassName?: string;
  dataSourceJndiName?: string;
  dataSourceProperties?: object;
  driverClassName?: string;
  healthCheckProperties?: object;
  idleTimeout?: number;
  initializationFailTimeout?: number;
  isAllowPoolSuspension?: boolean;
  isAutoCommit?: boolean;
  isIsolateInternalQueries?: boolean;
  isReadOnly?: boolean;
  isRegisterMbeans?: boolean;
  jdbcUrl?: string;
  leakDetectionThreshold?: number;
  maxLifetime?: number;
  maxPoolSize?: number;
  minIdle?: number;
  password?: string;
  poolName?: string;
  schema?: string;
  transactionIsolationName?: string;
  username?: string;
  validationTimeout?: number;
}

/**
 * title: I18nInfoRequest
 */
export interface I18nInfoRequest {
  info?: string; // 资源内容
  key?: string; // key
}

/**
 * title: I18nInfoResponse
 */
export interface I18nInfoResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  info?: string; // 资源内容
  key?: string; // 资源标识，主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  type?: string; // 资源类型
}

/**
 * title: IEReport
 */
export interface IEReport {
  errNumber?: number; // 导入失败条数
  name?: string; // 模型名
  succeed?: number; // 导入成功条数
  total?: number; // 总条数
}

/**
 * title: ImportModelData
 */
export interface ImportModelData {
  data?: any[];
  dict?: object;
  hasPermissionFieldList?: any[];
  sheetName?: string;
}

/**
 * title: ImportReportResponse
 */
export interface ImportReportResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fileId?: string; // 文件Id
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  report?: string; // 报告
}

/**
 * title: ImportResponse
 */
export interface ImportResponse {
  endTime?: number;
  errorCount?: number;
  errorMessage?: string;
  fileName?: string;
  fileSize?: number;
  list?: Array<ImportTmplResponse>;
  processingTime?: number;
  startTime?: number;
  successCount?: number;
  totalLines?: number;
}

/**
 * title: ImportTmplResponse
 */
export interface ImportTmplResponse {
  baseId?: string;
  categoryName?: string;
  createTime?: string;
  failsMessage?: string;
  name?: string;
  type?: string;
  version?: string;
}

/**
 * title: ImportVersionRequest
 */
export interface ImportVersionRequest {
  appId?: string; // 应用id
  appPkgUrl?: string; // 应用包路径
  description?: string; // 说明
  mergeConflictList?: Array<MergeConflictDTO>; // 冲突解决列表
}

/**
 * title: InputStream
 */
export interface InputStream {

}

/**
 * title: InspectionCategoryRequest
 */
export interface InspectionCategoryRequest {
  fullPath?: string; // 全路径
  level?: number; // 层级
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
}

/**
 * title: InspectionCategoryResponse
 */
export interface InspectionCategoryResponse {
  createOrgId?: string; // 创建人部门id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  level?: number; // 层级
  modifyOrgId?: string; // 修改人部门id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
  tenantId?: string; // 租户id
}

/**
 * title: InstanceRelationRequest
 */
export interface InstanceRelationRequest {
  businessId?: string; // 业务ID
  businessType?: string; // 业务类型(生产作业:production/返工作业:rework)
  instId: string; // 表单实例ID
  materialNo: string; // 批次号
  module?: string; // 模块类型
  sourceMaterialNo?: string; // 来源批次号
  tmplId?: string; // 表单模版ID
}

/**
 * title: InstanceRelationResponse
 */
export interface InstanceRelationResponse {
  businessId?: string; // 业务ID
  businessType?: string; // 业务类型
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  instId?: string; // 实例ID
  materialNo?: string; // 批次号
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块类型
  sourceMaterialNo?: string; // 来源批次号
  tmplId?: string; // 模版ID
}

/**
 * title: JobLogResponse
 */
export interface JobLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  duration?: number; // 执行时长
  endTime?: string; // 触发截止时间
  id?: string; // id
  jobId?: string; // 定时任务id
  jobName?: string; // 定时任务名称
  message?: string; // 执行信息
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  startTime?: string; // 触发开始时间
  status?: string; // 触发结果(成功 SUCCEED/失败 FAILURE)
  triggerMode?: string; // 触发方式(手动触发 MANUAL/定时触发 AUTO)
}

/**
 * title: JobRequest
 */
export interface JobRequest {
  cron?: any[]; // cron表达式
  description?: string; // 备注
  endTime?: string; // 触发截止时间
  jobName?: string; // 定时任务名称
  params?: string; // 参数
  resourceId?: string; // 关联资源id
  resourceType?: string; // 触发方式(js脚本:SCRIPT_SERVICE/服务编排:SO_SERVICE)
  startTime?: string; // 触发开始时间
  triggerConfig?: object; // 触发周期配置(json)
  triggerPolicy: string; // 触发类型(单次触发 ONCE/重复触发 REPEAT/ CRON)
}

/**
 * title: JobResponse
 */
export interface JobResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  cron?: any[]; // cron表达式
  description?: string; // 备注
  endTime?: string; // 触发截止时间
  id?: string; // id
  jobName?: string; // 定时任务名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  params?: string; // 参数
  resourceId?: string; // 关联资源id
  resourceType?: string; // 触发方式(js/服务编排)
  startTime?: string; // 触发开始时间
  status?: string; // 状态(启用/禁用)
  triggerConfig?: object; // 触发周期配置(json)
  triggerPolicy?: string; // 触发类型(单次触发/重复触发/cron)
}

/**
 * title: JoinConfig
 */
export interface JoinConfig {
  joins?: Array<SingleJoin>;
  mainModelKey?: string;
  mainModelName?: string;
}

/**
 * title: JoinOnExp
 */
export interface JoinOnExp {
  leftFieldKey?: string;
  leftFieldName?: string;
  leftModelKey?: string;
  leftModelName?: string;
  operator?: string;
  rightFieldKey?: string;
  rightFieldName?: string;
  rightModelKey?: string;
  rightModelName?: string;
}

/**
 * title: JsonNode
 */
export interface JsonNode {

}

/**
 * title: LabelBtwDesigner
 */
export interface LabelBtwDesigner {
  designerJson?: string;
  fullPath?: string; // btw模板的相对路径
  id?: string;
  modelKey?: string; // 绑定模型key
  name?: string; // BarTender 标签模板
  pathType?: string; // btw模板路径类型：local本地选择、common网络共享（打印服务掉线状态，前端回显使用，请在保存时传）
  printKey?: string; // 标签模板唯一标识（btw标签模板）
}

/**
 * title: LabelDesigner
 */
export interface LabelDesigner {
  designerJson?: string;
  id?: string;
}

/**
 * title: LabelLogRequest
 */
export interface LabelLogRequest {
  description?: string; // 备注
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  height?: number; // 尺寸（高度）
  labelKey?: string; // 标签key
  modelKey?: string; // 绑定模型key
  width?: number; // 尺寸（宽度）
}

/**
 * title: LabelLogResponse
 */
export interface LabelLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  height?: number; // 尺寸（高度）
  id?: string; // ID
  labelKey?: string; // 标签key
  modelKey?: string; // 绑定模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  width?: number; // 尺寸（宽度）
}

/**
 * title: LabelNameCheckRequest
 */
export interface LabelNameCheckRequest {
  name?: string; // 标签名称
}

/**
 * title: LabelRequest
 */
export interface LabelRequest {
  baseId?: string; // 父id
  categoryId?: string; // 分类id
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  fullPath?: string; // btw模板的相对路径
  height?: number; // 尺寸（高度）
  key?: string; // 标签key
  modelKey?: string; // 绑定模型key
  name?: string; // 标签名称
  pathType?: string; // btw模板路径类型：local本地选择、common网络共享（打印服务掉线状态，前端回显使用，请在保存时传）
  printKey?: string; // 标签模板唯一标识（标签模板）
  printType?: string; // 标签格式，zpl/tspl/cpcl/pos/esc/png/btw
  version?: string; // 版本
  width?: number; // 尺寸（宽度）
}

/**
 * title: LabelResponse
 */
export interface LabelResponse {
  baseId?: string;
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  default?: number; // 是否默认版本 1是 0否
  deleted?: number;
  description?: string;
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  draft?: number;
  fullPath?: string; // btw模板的相对路径
  height?: number; // 尺寸（高度）
  id?: string; // ID
  initCommitId?: string;
  key?: string; // 标签key
  macAddress?: string; // 关联的打印机的mac地址
  modelKey?: string; // 绑定模型key
  modelName?: string; // 绑定模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 标签名称
  pathType?: string;
  printKey?: string; // 标签模板唯一标识（标签模板）
  printName?: string; // 关联得打印机名称
  printType?: string; // 标签格式，zpl/tspl/cpcl/pos/esc/png
  sysBuiltin?: number;
  version?: string;
  viewType?: string;
  width?: number; // 尺寸（宽度）
}

/**
 * title: LogoConfigDTO
 */
export interface LogoConfigDTO {
  image?: string; // 应用logo图片
  logo?: string; // 应用logo图标
  logoBgColor?: string; // logo背景颜色
  logoColor?: string; // logo颜色
  thumbnail?: string; // 应用logo缩略
  type: string; // ICON/IMAGE
}

/**
 * title: MaterialNo4TaskResponse
 */
export interface MaterialNo4TaskResponse {
  materialNo?: string; // 批次号
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单ID
}

/**
 * title: MenuConfig
 */
export interface MenuConfig {
  color?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fullPath?: string;
  i18nConfig?: string;
  id?: string; // 菜单id
  level?: number; // 层级(一级菜单/二级菜单)
  linkPage?: string; // 关联页面id
  linkPageName?: string;
  logo?: string;
  menuType?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 菜单名称(多语言key)
  openMode?: string;
  pageId?: string; // 页面id
  parentId?: string; // 父节点id
  sortNum?: number; // 排序号
  suiteKey?: string;
  sysBuiltin?: number;
  type?: string; // 菜单分类
  url?: string; // 链接菜单地址
  visible?: number;
}

/**
 * title: MenuConfigMoveRequest
 */
export interface MenuConfigMoveRequest {
  id: string; // 当前节点id
  parentId: string; // 父节点id
  sortNum: number; // 目标位置排序号
}

/**
 * title: MenuConfigRequest
 */
export interface MenuConfigRequest {
  color?: string; // 颜色
  i18nConfig?: string; // 多语言配置
  level?: number; // 层级(一级菜单/二级菜单/三级菜单)
  linkPage?: string; // 关联页面
  logo?: string; // 图标url
  menuType: string; // 类型(WEB；MOBILE-移动端菜单 ；PAD)
  name?: string; // 名称(多语言key)
  openMode?: string; // 打开方式(PRESENT(当前页面),NEW(新页面),IFRAME)
  parentId?: string; // 父节点id
  type: string; // 菜单分类(CATALOG,STANDARD,LINK,PERMISSION)
  url?: string; // 链接查单 链接url
  visible: number; // 是否显示1 显示,0隐藏
}

/**
 * title: MenuConfigResponse
 */
export interface MenuConfigResponse {
  color?: string; // 颜色
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string;
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
  level?: number; // 层级(一级菜单/二级菜单)
  linkPage?: string; // 关联页面
  linkPageName?: string; // 关联页面名称
  logo?: string; // 图标url
  menuType?: string; // 类型(WEB；MOBILE-移动端菜单)
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称(多语言key)
  openMode?: string; // 打开方式(PRESENT(当前页面),NEW(新页面),IFRAME)
  parentId?: string; // 父节点id
  sortNum?: number; // 排序号
  suiteKey?: string;
  sysBuiltin?: number; // 是否内置(1:内置菜单,0:用户创建)
  type: string; // 菜单分类(CATALOG,STANDARD,LINK,PERMISSION)
  url?: string; // 链接查单 链接url
  visible?: number; // 是否显示
}

/**
 * title: MenuDTO
 */
export interface MenuDTO {
  color?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fullPath?: string;
  i18nConfig?: string;
  id?: string; // 菜单id
  level?: number; // 层级(一级菜单/二级菜单)
  linkPage?: string; // 关联页面id
  linkPageName?: string;
  logo?: string;
  menuType?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 菜单名称(多语言key)
  openMode?: string;
  pageId?: string; // 页面id
  parentId?: string; // 父节点id
  permissionList?: Array<PermissionPointDTO>; // 权限点
  sortNum?: number; // 排序号
  suiteKey?: string;
  sysBuiltin?: number;
  type?: string; // 菜单分类
  url?: string; // 链接菜单地址
  visible?: number;
}

/**
 * title: MenuPermissionDTO
 */
export interface MenuPermissionDTO {
  menus?: Array<MenuDTO>; // 菜单
  permissions?: any[]; // 权限点集合
}

/**
 * title: MergeConflictDTO
 */
export interface MergeConflictDTO {
  choice?: string; // 最终选择: SOURCE/TARGET
  pkValue?: string; // 主键值
  sourceCommitId?: string; // 来源分支提交id
  sourceCommitTag?: string; // 来源分支提交标识
  sourceContent?: string; // 源操作内容json
  sourceOpeDesc?: string; // 源操作内容
  sourceOpeTime?: string; // 源操作时间
  tableName?: string; // 配置数据表名
  targetCommitId?: string; // 目标分支提交id
  targetCommitTag?: string; // 目标分支提交标识
  targetContent?: string; // 目标作内容json
  targetOpeDesc?: string; // 目标操作内容
  targetOpeTime?: string; // 目标操作时间
}

/**
 * title: MergeLogRequest
 */
export interface MergeLogRequest {
  commitId?: string; // 此次合并的提交id
  conflictDetails?: string; // 冲突详情
  description?: string; // 说明
  sourceAppVersion?: string; // 来源分支应用版本
  sourceBranchId?: string; // 来源分支id
  sourceBranchSeq?: number; // 来源分支序号
  sourceCommitId?: string; // 来源分支提交id
  sourceCommitLogs?: string; // source_commit_logs_
  targetAppVersion?: string; // 目标分支应用版本
  targetBranchId?: string; // 目标分支id
  targetBranchSeq?: number; // 目标分支序号
  targetCommitId?: string; // 目标分支提交id
}

/**
 * title: MergeLogResponse
 */
export interface MergeLogResponse {
  commitId?: string; // 此次合并的提交id
  conflictDetails?: Array<MergeConflictDTO>; // 冲突详情
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 说明
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  sourceAppVersion?: string; // 来源分支应用版本
  sourceBranchId?: string; // 来源分支id
  sourceBranchSeq?: number; // 来源分支序号
  sourceCommitId?: string; // 来源分支提交id
  sourceCommitLogs?: Array<CommitLogResponse>; // source_commit_logs_
  targetAppVersion?: string; // 目标分支应用版本
  targetBranchId?: string; // 目标分支id
  targetBranchSeq?: number; // 目标分支序号
  targetCommitId?: string; // 目标分支提交id
}

/**
 * title: MergePreviewResponse
 */
export interface MergePreviewResponse {
  conflictDetails?: Array<MergeConflictDTO>;
  sourceCommitLogs?: Array<CommitLogResponse>;
}

/**
 * title: MergeRequest
 */
export interface MergeRequest {
  appId?: string; // 应用id
  description?: string; // 说明
  mergeConflictList?: Array<MergeConflictDTO>; // 冲突解决列表
  sourceBranchId?: string; // 来源分支id
  targetBranchId?: string; // 目标分支id
}

/**
 * title: MessageRecordRequest
 */
export interface MessageRecordRequest {
  endTime?: string; // 结束时间
  messageInfo?: string; // 消息体，参照消息模板消息体
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  pushTime?: string; // 推送时间
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  result?: string; // 推送结果
  resultMsg?: string; // 失败原因
  startTime?: string; // 开始时间
  tenantId?: string; // 租户id
  title?: string; // 标题
  tmplKey?: string; // 消息模板key
  tmplName?: string; // 消息模板名称
  userId?: string; // 接收人id
  userName?: string; // 接收人名称
}

/**
 * title: MessageRecordResponse
 */
export interface MessageRecordResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  formSerialNo?: string; // 表单流水码
  id?: string; // id
  messageInfo?: string; // 消息体，参照消息模板消息体
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  pushTime?: string; // 推送时间
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  result?: string; // 推送结果 成功: SUCCEED/失败: FAILURE
  resultMsg?: string; // 失败原因
  tenantId?: string; // 租户id
  title?: string; // 标题
  tmplKey?: string; // 消息模板key
  tmplName?: string; // 消息模板名称
  userId?: string; // 接收人id
  userName?: string; // 接收人名称
}

/**
 * title: MessageTmplOpenedRequest
 */
export interface MessageTmplOpenedRequest {
  key?: string; // 消息模板key
  opened?: number; // 1：公开，0:不公开
}

/**
 * title: MessageTmplRequest
 */
export interface MessageTmplRequest {
  custom?: number; // 数据源,0模型，1自定义
  description?: string; // 消息模板描述
  id?: string; // 消息模板id
  key?: string; // 消息模板KEY
  messageInfo?: JsonNode; // 消息内容json
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 关联对象key(模型key)
  name?: string; // 消息模板名称
  opened?: number; // 1：公开，0:不公开
  pushObjectKey?: string; // 发送对象key，涉及邮箱地址，钉钉企业微信等              多个数据逗号隔开，key和name顺序一致
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  rangUser?: string; // 字段值格式定义（多选、类型和id拼接、逗号分隔）
  tenantId?: string; // 租户id
}

/**
 * title: MessageTmplResponse
 */
export interface MessageTmplResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  custom?: number;
  description?: string; // 消息模板描述
  id?: string; // id
  key?: string; // 消息模板key
  messageInfo?: JsonNode; // 消息内容json
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 关联对象key(模型key)
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 消息模板名称
  opened?: number; // 1：公开，0:不公开
  pushObjectKey?: string; // 发送对象key，涉及邮箱地址，钉钉企业微信等              多个数据逗号隔开，key和name顺序一致
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  tenantId?: string; // 租户id
  type?: string; // 类型
}

/**
 * title: MessageTmplSendRequest
 */
export interface MessageTmplSendRequest {
  actId?: string; // 节点id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  custom?: number; // 数据源
  deleted?: number;
  description?: string;
  id?: string;
  key?: string; // 消息模板key
  messageBatchTag?: number; // 消息批次标识
  messageInfo?: string;
  modelCategory?: string;
  modelKey?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  nodeCheckType?: string; // 节点审核类型
  opened?: number;
  param?: object; // 发送消息参数
  processInstanceId?: string; // 流程实例id
  pushObjectKey?: string;
  pushType?: string;
  rangUser?: string; // 字段值格式定义（多选、类型和id拼接、逗号分隔）
  supportProcess?: number; // 支持流程
  tenantId?: string;
  type?: string;
}

/**
 * title: MobileHomepageRequest
 */
export interface MobileHomepageRequest {
  designerJson?: string; // 页面设计json
  name?: string; // 页面名称
  runtimeJson?: string; // 运行时json
  selected?: number; // 选中 1: 未选中 0
}

/**
 * title: MobileHomepageResponse
 */
export interface MobileHomepageResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number; // 是否删除
  designerJson?: string; // 页面设计json
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  runtimeJson?: string; // 运行时json
  selected?: number; // 选中 1: 未选中 0
}

/**
 * title: MobilePageRequest
 */
export interface MobilePageRequest {
  categoryId?: string; // app分类id
  description?: string; // 页面描述
  key?: string; // 页面key
  name?: string; // 页面名称
  newLogId?: string; // newLogId
}

/**
 * title: MobilePageResponse
 */
export interface MobilePageResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 页面描述
  designerJson?: string; // 页面设计json
  id?: string; // 主键
  key?: string; // 页面key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  newLogId?: string; // newLogId
  runtimeJson?: string; // 运行时json
  terminal?: string; // 终端 pad  pda
}

/**
 * title: ModelAssociationResponse
 */
export interface ModelAssociationResponse {
  dataCount?: number;
  fieldKey?: string;
  fieldType?: string;
  modelKey?: string;
  modelName?: string;
}

/**
 * title: ModelBriefInfo
 */
export interface ModelBriefInfo {
  category?: string; // 种类
  fields?: Array<SingleField>;
  group?: string; // 分组
  key?: string; // 实体key
  name?: string; // 实体名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  supportProcess?: number; // 支持流程
  type?: string; // 实体类型
}

/**
 * title: ModelCompleteResponse
 */
export interface ModelCompleteResponse {
  children?: Array<ModelRelationResponse>;
  hasChild?: boolean; // 是否子版本
  id?: string; // 主键
  module?: string; // 所属模块(实体、枚举、web页面)
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: ModelConstraint
 */
export interface ModelConstraint {
  convertFromFieldUniqueConstraint?: boolean;
  fieldKeys?: any[]; // 约束字段
  fieldNames?: any[]; // 约束字段名称，前端回显用
  type?: string; // 模型约束类型：GLOBAL_UNIQUE/LEVEL_UNIQUE/NOT_NULL
}

/**
 * title: ModelField
 */
export interface ModelField {
  fieldMetaList?: Array<FieldBriefInfo>;
  modelKey?: string;
  modelMeta?: ModelBriefInfo;
}

/**
 * title: ModelFieldAgg
 */
export interface ModelFieldAgg {
  fieldMetas?: Array<FieldMeta>;
  modelMeta?: ModelMeta;
}

/**
 * title: ModelFieldDTO
 */
export interface ModelFieldDTO {
  fieldKey: string;
  fieldName?: string;
  modelKey: string;
  modelName?: string;
}

/**
 * title: ModelFieldInfo
 */
export interface ModelFieldInfo {
  expression?: string; // 公式字段的表达式
  fieldKey?: string; // 字段key
  fieldName?: string; // 字段名称
  fieldType?: string; // 字段类型
  functionName?: string; // 公式字段时,函数名
  mappingType?: string; // 字段映射类型
  originFieldKey?: string; // 原字段key
  originFieldName?: string; // 原字段名称
  originModelKey?: string; // 原模型key
  originModelName?: string; // 原模型名称
  originModelType?: string; // 原模型类型
  viewFieldKey?: string;
  viewFieldName?: string;
  viewModelKey?: string;
}

/**
 * title: ModelFieldNode
 */
export interface ModelFieldNode {
  direction?: string; // 方向 forward/backward
  fieldKey: string; // 字段 key
  modelKey: string; // 模型 key
}

/**
 * title: ModelFieldPair
 */
export interface ModelFieldPair {
  direction?: string; // 方向 forward/backward
  fieldKey?: string; // 字段 key
  modelCategory?: string; // 模型种类:(entity/data/view)
  modelKey: string; // 模型 key
}

/**
 * title: ModelMeta
 */
export interface ModelMeta {
  constraint?: Array<ModelConstraint>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number;
  deleted?: number;
  description?: string;
  displayField?: string;
  hidden?: boolean;
  id?: string;
  initCommitId?: string;
  key?: string;
  maxSubLevel?: number;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  order?: number;
  permissionEnabled?: number;
  recycled?: number;
  refModelKey?: string;
  source?: string;
  specificConfig?: object; // 特有属性配置选项(json格式)
  subModel?: number;
  supportMessage?: number;
  supportProcess?: number;
  supportStateMachine?: number;
  sysBuiltin?: number;
  type?: string;
}

/**
 * title: ModelMetaDTO
 */
export interface ModelMetaDTO {
  categoryId?: string;
  children?: Array<ModelMeta>;
  constraint?: Array<ModelConstraint>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number;
  deleted?: number;
  description?: string;
  displayField?: string;
  fieldMetaList?: Array<FieldMetaDTO>;
  hidden?: boolean;
  id?: string;
  initCommitId?: string;
  key?: string;
  maxSubLevel?: number;
  modelCategory?: string; // 模型大类型 entity/实体,view/视图,data/数据
  modelTraceSettingEnabled?: number;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  order?: number;
  permissionEnabled?: number;
  recycled?: number;
  refModelKey?: string;
  source?: string;
  specificConfig?: object; // 特有属性配置选项(json格式)
  subModel?: number;
  supportMessage?: number;
  supportProcess?: number;
  supportStateMachine?: number;
  sysBuiltin?: number;
  type?: string;
}

/**
 * title: ModelMetaInfo
 */
export interface ModelMetaInfo {
  data?: TableMetaBase; // 表信息
  id?: string; // id 主键
  shape?: string; // 分类
  x?: number; // x坐标
  y?: number; // y坐标
}

/**
 * title: ModelMetaResponse
 */
export interface ModelMetaResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  constraint?: Array<ModelConstraint>; // 模型约束
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number; // 数据删除策略:(1 物理删除,0 逻辑删除)
  description?: string; // 模型描述
  displayField?: string; // 默认显示字段
  fieldMetas?: Array<PruneFieldMetaResponse>; // 字段信息
  id?: string; // 主键
  initCommitId?: string; // initCommitId
  key?: string; // 模型key
  maxSubLevel?: number; // 子模型被引用的最深的层级数 (最大为2，代表孙，默认为0，代表还未被引用)
  modelTraceSettingEnabled?: number; // modelTraceSettingEnabled
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模型名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  refModelKey?: string; // 关联的模型key
  specificConfig?: object; // 特殊配置
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  supportProcess?: number; // 支持流程
  supportStateMachine?: number; // 支持状态机
  supportTree?: number; // 支持树形结构
  sysBuiltin?: number;
  type?: string; // 模型标志:(NDO/RDO)
}

/**
 * title: ModelMetaVO
 */
export interface ModelMetaVO {
  categoryId?: string; // 分类id
  deletePolicy?: number; // 数据删除策略:(1 物理删除,0 逻辑删除)
  description?: string; // 模型描述
  key?: string; // 模型key
  modelTraceSettingEnabled?: number; // 模型是否启用模型追溯(1:启用,0:不启用)
  name?: string; // 模型名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  refModelKey?: string; // 关联的模型key
  specificConfig?: object; // 特殊配置
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  supportProcess?: number; // 支持流程
  supportStateMachine?: number; // 支持状态机
  type?: string; // 模型标志:(NDO/RDO/WORKFLOW/DYNAMIC_FORM/BASE/TREE)
}

/**
 * title: ModelMethodRequest
 */
export interface ModelMethodRequest {
  description?: string; // 方法描述
  key?: string; // 方法key
  modelKey?: string; // 模型定义表key
  name?: string; // 方法名称
  serviceKey?: string; // 服务对应服务key(j0s脚本服务、sql服务、编排服务)
  type?: string; // 方法类型
  usage?: string; // markdown格式的使用说明
}

/**
 * title: ModelMethodResponse
 */
export interface ModelMethodResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 方法描述
  id?: string; // 主键
  key?: string; // 方法key
  modelKey?: string; // 模型定义表key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 方法名称
  serviceKey?: string; // 服务对应服务key(j0s脚本服务、sql服务、编排服务)
  type?: string; // 方法类型
  usage?: string; // markdown格式的使用说明
}

/**
 * title: ModelMultiRow
 */
export interface ModelMultiRow {
  data?: any[];
  dict?: object;
}

/**
 * title: ModelPageableRow
 */
export interface ModelPageableRow {
  data?: any[];
  dict?: object;
  pageNo?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

/**
 * title: ModelPermissionRelationRequest
 */
export interface ModelPermissionRelationRequest {
  configJson?: Array<ModelFieldDTO>;
  modelKey?: string; // 模型KEY
  sortNum?: number; // 序号
}

/**
 * title: ModelPermissionRelationResponse
 */
export interface ModelPermissionRelationResponse {
  configJson?: Array<ModelFieldDTO>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modelKey?: string; // 模型KEY
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  sortNum?: number; // 序号
}

/**
 * title: ModelRelationResponse
 */
export interface ModelRelationResponse {
  categoryId?: string; // 分类id
  children?: Array<ModelRelationResponse>;
  displayField?: string; // 实体模型的默认显示字段
  displayFieldName?: string; // 实体模型的默认显示字段名称
  id?: string; // 分类数据id
  key?: string; // 分类数据key
  modelKey?: string; // 模型key
  name?: string; // 分类数据名称
  sortNum?: number; // 排序
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  sysBuiltin?: number; // 是否系统内置
  type?: string; // 分类数据类型
}

/**
 * title: ModelReport
 */
export interface ModelReport {
  modelKey?: string;
  modelName?: string;
  modelType?: string;
  reports?: Array<Report>;
}

/**
 * title: ModelSingleRow
 */
export interface ModelSingleRow {
  data?: object;
  dict?: object;
}

/**
 * title: NumberExportConfig
 */
export interface NumberExportConfig {
  currency?: number; // 货币币种
  exportFormat?: number; // 导出字段模式
  time?: number; // 时间展示样式
}

/**
 * title: OfBaseSubmitRequest
 */
export interface OfBaseSubmitRequest {
  attachmentNumber?: number; // 附件数量
  btnKey?: string; // 表单提交绑定的事件KEY(非必填(没绑定事件不需要传)
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮的配置
  checkEditUser?: boolean;
  data: object; // 提交的数据
  eventKey: string; // 操作的按钮的key
  exceptionFlag?: boolean; // 异常标记
  historyRequest?: OnlineFormChangeHistoryRequest; // 变更记录
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见(原因)
  remark?: string; // 备注
  signature?: string; // 签名数据
}

/**
 * title: OfProcessAbandonRequest
 */
export interface OfProcessAbandonRequest {
  btnKey: string; // 点击的按钮的key
  buttonConfig: string; // 操作的按钮配置
  change: boolean; // 是否是记录变更: true是、false否
  formType: string; // 表单类型：BASE 基础表单、PROCESS 流程表单 、 VIEW 视图表单、TEXT 文本表单
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  reason?: string; // 原因
  signHistoryIds?: any[];
  taskId?: string; // 任务id
}

/**
 * title: OfProcessApproveRequest
 */
export interface OfProcessApproveRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: OfProcessChangeRequest
 */
export interface OfProcessChangeRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  historyRequest: OnlineFormChangeHistoryRequest; // 变更记录
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion: string; // 原因(意见)
  taskId: string; // 任务id
}

/**
 * title: OfProcessControlRequest
 */
export interface OfProcessControlRequest {
  effectiveDate?: string; // 生效日期
  tmplId?: string; // 模板ID
}

/**
 * title: OfProcessJumpRequest
 */
export interface OfProcessJumpRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  jumpMode: string; // 跳转模式：下一个节点：NextNode、开始节点：StartNode、结束节点：EndNode
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: OfProcessOperationsDTO
 */
export interface OfProcessOperationsDTO {
  buttons?: any[]; // 有权限的按钮列表
  nodeDef?: ProcessNodeDefinition; // 节点定义
  taskId?: string; // 任务id
}

/**
 * title: OfProcessQualifiedRequest
 */
export interface OfProcessQualifiedRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: OfProcessReassign4InterfereRequest
 */
export interface OfProcessReassign4InterfereRequest {
  ofInstId: string; // 在线表单实例id
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: OfProcessReassignRequest
 */
export interface OfProcessReassignRequest {
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: OfProcessResubmitRequest
 */
export interface OfProcessResubmitRequest {
  btnKey: string; // 点击的按钮的key
  buttonConfig: string; // 操作的按钮配置
  formType: string; // 表单类型：BASE 基础表单、PROCESS 流程表单 、 VIEW 视图表单、TEXT 文本表单
  ofInstId: string; // 在线表单实例id
  taskId?: string; // 任务id
}

/**
 * title: OfProcessReturn4InterfereRequest
 */
export interface OfProcessReturn4InterfereRequest {
  ofInstId: string; // 在线表单实例id
  taskId: string; // 任务id
}

/**
 * title: OfProcessReturnRequest
 */
export interface OfProcessReturnRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: OfProcessSaveRequest
 */
export interface OfProcessSaveRequest {
  attachmentNumber?: number; // 附件数量
  auto: boolean; // 是否自动保存 true是、false否
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  checkEditUser?: boolean; // 是否检验编辑表单的用户
  data: object; // 提交的数据
  exceptionFlag?: boolean; // 异常标记
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: OfProcessSubmitRequest
 */
export interface OfProcessSubmitRequest {
  attachmentNumber?: number; // 附件数量
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  checkEditUser?: boolean; // 是否检验编辑表单的用户
  data: object; // 提交的数据
  exceptionFlag?: boolean; // 异常标记
  historyRequest?: OnlineFormChangeHistoryRequest; // 变更记录
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 意见
  remark?: string; // 备注
  signature?: string; // 签名数据
  taskId?: string; // 任务id，重新提交时传值
}

/**
 * title: OnlineFormBizRequest
 */
export interface OnlineFormBizRequest {
  bsKey: string; // 业务服务方法名称（后台模型) 和 表单模型）
  modelCategory?: string; // entity:实体模型、view视图模型（后台模型）
  modelKey: string; // 模型key（后台模型、表单主/子表模型）
  requestBody: object; // 查询算子（后台模型 和 表单模型)
  subModel?: boolean; // 是否子模型 - 表单模型时必传：true 是 false不是
  tmplId?: string; // 在线表单模板id（表单模型 ，与modelCategory、modelKey互斥）
}

/**
 * title: OnlineFormBuiltinParam
 */
export interface OnlineFormBuiltinParam {
  key?: string;
  name?: string;
  type?: string;
  visible?: number;
}

/**
 * title: OnlineFormCategoryRequest
 */
export interface OnlineFormCategoryRequest {
  createOrgId?: string; // 创建人部门id
  fullPath?: string; // 全路径
  level?: number; // 层级
  modifyOrgId?: string; // 修改人部门id
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
  tenantId?: string; // 租户id
}

/**
 * title: OnlineFormCategoryResponse
 */
export interface OnlineFormCategoryResponse {
  createOrgId?: string; // 创建人部门id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  level?: number; // 层级
  modifyOrgId?: string; // 修改人部门id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
  tenantId?: string; // 租户id
}

/**
 * title: OnlineFormChangeHistoryDetailRequest
 */
export interface OnlineFormChangeHistoryDetailRequest {
  afterLabel?: string; // 修改之后的值(展示值)
  afterValue?: string; // 修改之后的值(储存值)
  beforeLabel?: string; // 修改之前的值(展示值)
  beforeValue?: string; // 修改之前的值(储存值)
  cellLocation?: string; // 单元格坐标
  cellType?: string; // 单元格类型(对应前端组件类型)
  ofChangeHistoryId?: string; // 在线表单变更历史表id
}

/**
 * title: OnlineFormChangeHistoryDetailResponse
 */
export interface OnlineFormChangeHistoryDetailResponse {
  afterLabel?: string; // 修改之后的值(展示值)
  afterValue?: string; // 修改之后的值(储存值)
  beforeLabel?: string; // 修改之前的值(展示值)
  beforeValue?: string; // 修改之前的值(储存值)
  cellLocation?: string; // 单元格坐标
  cellType?: string; // 单元格类型(对应前端组件类型)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofChangeHistoryId?: string; // 在线表单变更历史表id
}

/**
 * title: OnlineFormChangeHistoryRequest
 */
export interface OnlineFormChangeHistoryRequest {
  changeType: string; // 变更类型(Form: 表单变更、Resubmit重新提交、Abandon废弃)
  details?: Array<OnlineFormChangeHistoryDetailRequest>; // 变更详情(模型字段)
  instanceId: string; // 在线表单实例ID
  reason: string; // 原因
  signHistoryIds: any[]; // 签名历史表id
  tmplId: string; // 在线表单模板ID
}

/**
 * title: OnlineFormChangeHistoryResponse
 */
export interface OnlineFormChangeHistoryResponse {
  avatar?: string; // 头像地址
  changeType?: string; // 变更类型(Form: 表单变更、Resubmit重新提交、Abandon废弃)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  details?: Array<OnlineFormChangeHistoryDetailResponse>; // 变更记录详情
  id?: string; // 主键
  instanceId?: string; // 在线表单实例ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  reason?: string; // 原因
  signHistoryId?: string; // 签名历史表id
  signInfo?: string; // 签名信息
  signUrl?: string; // 签名地址url
  tmplId?: string; // 在线表单模板ID
}

/**
 * title: OnlineFormDataInitProtocolDTO
 */
export interface OnlineFormDataInitProtocolDTO {
  key?: string; // 协议 key
  name?: string; // 协议名称
}

/**
 * title: OnlineFormDesignDTO
 */
export interface OnlineFormDesignDTO {
  communicationConfig?: string; // 通信配置
  designerJson?: string; // 设计json
  direction?: string; // 方向(portrait /landscape)
  formTmplBomList?: any[]; // 表单bom
  modifyTime?: string; // 修改时间
  modifyUserId?: string;
  modifyUserName?: string; // 修改人
  runtimeJson?: string; // 运行时json
}

/**
 * title: OnlineFormFieldMetaVO
 */
export interface OnlineFormFieldMetaVO {
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  bizType?: string; // 业务字段类型
  defaultValue?: DefaultValue; // 默认值
  description?: string; // 描述
  i18nConfig?: string; // 多语言配置
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  name?: string; // 名称
  parentField?: number; // 父字段（RDO模型使用，0/1）
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  specificConfig?: object; // 特有属性配置选项(json格式)
  subModelKey?: string; // 子模型Key
  type?: string; // 数据类型 (primary_key/主键,tenant/租户关联,ref_master_id/关联主键,text/短文本,long_text/长文本,integer/整数,long/长整数,decimal/精度小数,boolean/布尔,binary/二进制流,date/日期,time/时间,date_time/日期时间,user_multi/人员多选,org_multi/部门多选,image/图片,attachment/附件enum/枚举,serial/序列号,ref/引用关联,master_slave/主子关联,enum_multi/枚举多选,ref_multi/模型多选,expression/公式,agg/汇总,esop/E-SOP,expression_condition/公式条件)
  uniqueConstraint?: UniqueConstraint; // 约束类型 GLOBAL:全局唯一 LEVEL:层级唯一
}

/**
 * title: OnlineFormInsTaskRequest
 */
export interface OnlineFormInsTaskRequest {
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  module?: string; // 模块类型
  ofInstId?: string; // 表单实例Id - 更新时传递
  operatorRange: string; // 填报人员范围
  relatedMaterialNo?: string; // 关联批次(已过时，但前端目前还是老代码还在用)
  relatedMaterialNos?: any[]; // 关联批次
  title?: string; // 任务标题
  tmplId?: string; // 表单模板ID
  tmplName?: string;
}

/**
 * title: OnlineFormInsTaskTransmit
 */
export interface OnlineFormInsTaskTransmit {
  operator?: string; // 处理人
  operatorId?: string; // 处理人
}

/**
 * title: OnlineFormInstance
 */
export interface OnlineFormInstance {
  appId?: string;
  attachmentNumber?: number;
  bindKey?: string;
  businessId?: string;
  businessType?: string;
  categoryId?: string;
  categoryName?: string;
  completedTime?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string;
  dataStatus?: string;
  deleted?: number;
  description?: string;
  designerJson?: string;
  direction?: string;
  docOutlineId?: string;
  edhrInstanceId?: string;
  edhrInstanceStatus?: string;
  exceptionFlag?: boolean;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: string;
  ext6?: string;
  ext7?: string;
  ext8?: string;
  ext9?: string;
  fieldHash?: string;
  formType?: string;
  hash?: string;
  height?: number;
  id?: string;
  instanceRelationBusinessId?: string;
  instanceStatus?: string;
  materialId?: string;
  materialNo?: string;
  materialStatus?: string;
  mfgOrderCode?: string;
  modelKey?: string;
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofCode?: string;
  ofRequired?: number;
  officeType?: string;
  operation?: string;
  operator?: string;
  operatorId?: string;
  operatorRange?: string;
  paperSize?: string;
  params?: string;
  processStatus?: string;
  productName?: string;
  productionMaterialNo?: string;
  recordNo?: string;
  relatedMaterialNos?: any[];
  relationId?: string;
  resend?: number;
  runtimeJson?: string;
  runtimeJsonHash?: string;
  script?: string;
  serialNo?: string;
  sourceMaterialNo?: string;
  submitTime?: string;
  submitterId?: string;
  submitterName?: string;
  title?: string;
  tmplId?: string;
  tmplName?: string;
  tmplVersion?: string;
  txnInstId?: string;
  type?: string;
  viewType?: string;
  width?: number;
}

/**
 * title: OnlineFormInstanceDTO
 */
export interface OnlineFormInstanceDTO {
  businessId?: string;
  businessType?: string;
  dataId?: string;
  dataStatus?: string;
  formType?: string;
  id?: string;
  materialNo?: string;
  materialStatus?: string;
  modelKey?: string;
  ofCode?: string;
  params?: string;
  relationId?: string;
  serialNo?: string;
  tmplId?: string;
  tmplName?: string;
  txnInstId?: string;
}

/**
 * title: OnlineFormInstanceRelationInfoResponse
 */
export interface OnlineFormInstanceRelationInfoResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataStatus?: string; // 填报数据状态(暂存/提交/空)
  deleted?: number;
  edhrInstanceId?: string; // edhr实例id
  edhrSerialNo?: string; // edhr流水号
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  id?: string; // 主键ID
  instanceStatus?: string; // 表单实例状态:UNFILLED:未填报、STASH暂存、 RUNNING 进行中ABANDON 作废状态、COMPLETED:已完成
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofSerialNo?: string; // 表单流水号
  officeType?: string; // office类型
  productName?: string; // 产品名称
  relatedFormCount?: number; // edhr实例其下关联的表单实例
  tmplId?: string; // 表单模板ID
  tmplName?: string; // 表单模板名称
}

/**
 * title: OnlineFormInstanceRequest
 */
export interface OnlineFormInstanceRequest {
  businessId?: string; // 业务ID
  businessType?: string; // 业务类型
  ext1?: string; // 扩展属性1
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: string;
  ext6?: string;
  ext7?: string;
  ext8?: string;
  ext9?: string;
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  materialNo?: string; // 物料编号
  materialStatus?: string; // 来源(FORM/批次LOT或SN/PRODUCT_RELEASE)
  modelKey?: string; // 模型key
  params?: string; // 实例参数(业务扩展属性)
  relationId?: string; // 关联id
  tmplId?: string; // 表单模板ID
}

/**
 * title: OnlineFormInstanceResponse
 */
export interface OnlineFormInstanceResponse {
  attachmentNumber?: number; // 附件数量
  bindKey?: string; // 绑定KEY
  businessId?: string; // 业务ID
  businessType?: string; // 业务类型
  completedTime?: string; // 单据完成时间
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string; // 填报数据id
  dataStatus?: string; // 填报数据状态(暂存(STASH)/提交(SUBMIT))
  description?: string; // 备注
  designerJson?: string; // 表单设计json
  direction?: string;
  docOutlineId?: string;
  edhrInstanceId?: string; // edhr实例id
  edhrInstanceList?: Array<EdhrInstanceResponse>; // edhr实例集合
  edhrInstanceStatus?: string; // edhr实例状态: 未填报：UNFILLED、进行中：RUNNING、已完成：COMPLETED、已归档：ARCHIVED
  exceptionFlag?: boolean; // 异常标记
  ext1?: string; // 扩展属性1
  ext2?: string; // 扩展属性2
  ext3?: string; // 扩展属性3
  ext4?: string; // 扩展属性4
  ext5?: string; // 扩展属性5
  formInstBom?: FormInstBomResponse; // 表单BOM
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  height?: number;
  id?: string; // 主键ID
  instanceStatus?: string; // 表单实例状态:UNFILLED:未填报、STASH暂存、 RUNNING 进行中ABANDON 作废状态、COMPLETED:已完成
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料形态(批次: LOT、SN、单据：FORM、电子放行:PRODUCT_RELEASE)
  mfgOrderCode?: string; // 工单编号
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofCode?: string; // 在线表单code
  ofProcessOperations?: OfProcessOperationsDTO;
  ofRequired?: number; // 在线表单是否必填 1: 必填 0 非必填
  officeType?: string;
  operation?: string; // 操作
  operator?: string; // 处理人
  operatorId?: string; // 处理人Id
  operatorRange?: string; // 填报人员范围
  paperSize?: string;
  params?: string; // 实例参数(业务扩展属性)
  processFieldPermission?: string; // 制程字段权限
  processOperation?: string; // 制程按钮权限
  productName?: string; // 产品名称
  productionMaterialNo?: string; // 生产的批次/SN号
  recordNo?: string; // 当前表单中填的-记录单号
  relatedMaterialNo?: string; // 关联批次(已过时，但前端目前还是老代码还在用)
  relatedMaterialNos?: any[]; // 关联批次
  relationId?: string; // 关联id
  resend?: number; // 是否重新发送了表单任务：1重新发送了，0没有重新发送(允许重新发送)
  runtimeJson?: string; // 表单运行时json
  serialNo?: string; // 流水号
  sourceMaterialNo?: string; // 附录中表单关联-来源批次
  submitTime?: string; // 单据提交时间
  submitterId?: string; // 提交人id
  submitterName?: string; // 提交人名称
  title?: string; // 任务标题
  tmplId?: string; // 表单模板ID
  tmplName?: string; // 表单模板名称
  tmplVersion?: string; // 表单模板版本
  txnInstId?: string; // 事务实例ID
  type?: string; // 类型：PROCESS制成、FORM新增表单
  viewType?: string;
  width?: number;
}

/**
 * title: OnlineFormInstanceTmplRelationResponse
 */
export interface OnlineFormInstanceTmplRelationResponse {
  edhrInstance?: EdhrInstance; // edhr实例
  ofInstances?: Array<OnlineFormInstanceResponse>; // 表单实例对象
  ofTmpl?: OnlineFormTmplResponse; // 表单模板
}

/**
 * title: OnlineFormLogResponse
 */
export interface OnlineFormLogResponse {
  btnType?: string; // 操作按钮的类型
  buttonConfig?: string; // 操作的按钮配置
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  instanceId?: string; // 在线表单实例ID
  logUsers?: Array<OnlineFormLogUser>; // 人员操作记录（一对多 - 转办/并行、一对一 - 保存、提交、审批、转办）
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefType?: string; // 流程类型: 电子表单审批 OF_APPROVE、文控审批 DOC_CONTROL_APPROVE
  remark?: string; // 备注
  tmplId?: string; // 在线表单模板ID
  traceId?: string; // 链路追踪id
}

/**
 * title: OnlineFormLogUser
 */
export interface OnlineFormLogUser {
  avatar?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fullName?: string;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  onlineFormLogId?: string;
  opeSeq?: string;
  opinion?: string;
  sortNum?: number;
  taskId?: string;
  userId?: string;
}

/**
 * title: OnlineFormModelMeta
 */
export interface OnlineFormModelMeta {
  id?: string; // 模型id
  key?: string; // 模型key
  name?: string; // 模型名称
}

/**
 * title: OnlineFormStashRequest
 */
export interface OnlineFormStashRequest {
  attachmentNumber?: number; // 附件数量
  auto: boolean; // 是否自动保存 true是、false否
  btnKey?: string; // 按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  checkEditUser?: boolean;
  data: object; // 提交的数据
  exceptionFlag?: boolean; // 异常标记
  noLog?: boolean; // 是否不记录表单日志
  ofInstId: string; // 在线表单实例id
  opinion?: string; // 审批意见
  remark?: string; // 备注
  signature?: string; // 签名
}

/**
 * title: OnlineFormTmplLogRequest
 */
export interface OnlineFormTmplLogRequest {
  designerJson?: string; // 设计json
  runtimeJson?: string; // 运行时json
  status?: string; // 状态
  tmplId?: string; // 表单id
}

/**
 * title: OnlineFormTmplLogResponse
 */
export interface OnlineFormTmplLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  designerJson?: string; // 设计json
  id?: string; // ID
  runtimeJson?: string; // 运行时json
  status?: string; // 状态
  tmplId?: string; // 表单id
}

/**
 * title: OnlineFormTmplModelResponse
 */
export interface OnlineFormTmplModelResponse {
  approveStatus?: string; // 审核状态
  baseId?: string; // 父id
  bindKey?: string; // 绑定KEY
  categoryId?: string; // 分类Id
  categoryName?: string; // 分类名称
  code?: string; // 编号
  communicationConfig?: string; // 通信配置
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  designerJson?: string; // 设计json
  direction?: string; // 方向(横向:crosswise/纵向:lengthways)
  docControlStartedId?: string; // 文控管理-我的发起ID
  dsKey?: string; // 数据源key
  edition?: string; // SQL脚本
  extFieldStatus?: string; // 拓展字段-模型字段启用/禁用状态json: [{key:字段key,status:true/false}]
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  height?: number; // 尺寸（高度）
  id?: string; // ID
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  models?: Array<ModelBriefInfo>;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  officeType?: string; // 文档类型
  offlineVersion?: string; // 线下版本号
  operatingState?: boolean; // 状态
  operation?: string; // 操作
  paperSize?: string; // 纸张大小
  permissionConfig?: string; // 权限配置列表
  procInstId?: string; // 审批流程实例ID
  runtimeJson?: string; // 运行时json
  script?: string; // SQL脚本
  sourceImportFormTmplId?: string; // 原导入模板ID
  updateRemark?: string; // 升级配置
  version?: string; // 版本
  viewType?: string; // 视图类型：VIEW_MODEL 视图模型、SQL:SQL视图、VIEW
  width?: number; // 尺寸（宽度）
}

/**
 * title: OnlineFormTmplOperationConfig
 */
export interface OnlineFormTmplOperationConfig {
  id?: string; // id
  operation?: string; // 操作
  permissionConfig?: string; // 权限配置
}

/**
 * title: OnlineFormTmplRequest
 */
export interface OnlineFormTmplRequest {
  baseId?: string; // 父id
  bindKey?: string; // 绑定key
  categoryId?: string; // 分类id
  code?: string; // 编号
  communicationConfig?: string; // 通信配置
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  designerJson?: string; // 设计json
  direction?: string; // 方向
  dsKey?: string; // 数据源key
  edition?: string; // 版本：专业版:PROFESSIONAL 、普通版:EASY
  extFieldStatus?: string; // 拓展字段-模型字段启用/禁用状态json: [{key:字段key,status:true/false}]
  fieldConfig?: Array<FieldColumnMapping>;
  formTmplBomList?: any[]; // 表单bom
  formType: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  height?: number; // 尺寸（高度）
  modelKey?: string; // 模型key
  name?: string; // 名称
  officeType?: string; // 文档类型
  offlineVersion?: string; // 电子记录-线下版本号
  operation?: string; // 操作
  paperSize?: string; // 纸张大小
  permissionConfig?: string;
  runtimeJson?: string; // 运行时json
  script?: string; // SQL脚本
  updateRemark?: string; // 升级备注
  version?: string; // 版本
  viewType?: string; // 视图类型：VIEW_MODEL 视图模型、SQL:SQL视图、VIEW、JS
  width?: number; // 尺寸（宽度）
}

/**
 * title: OnlineFormTmplResponse
 */
export interface OnlineFormTmplResponse {
  approveStatus?: string; // 审核状态
  baseId?: string; // 父id
  bindKey?: string; // 绑定KEY
  categoryId?: string; // 分类Id
  categoryName?: string; // 分类名称
  code?: string; // 编号
  communicationConfig?: string; // 通信配置
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  designerJson?: string; // 设计json
  direction?: string; // 方向(横向:crosswise/纵向:lengthways)
  docControlStartedId?: string; // 文控管理-我的发起ID
  dsKey?: string; // 数据源key
  edition?: string; // SQL脚本
  extFieldStatus?: string; // 拓展字段-模型字段启用/禁用状态json: [{key:字段key,status:true/false}]
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  height?: number; // 尺寸（高度）
  id?: string; // ID
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  officeType?: string; // 文档类型
  offlineVersion?: string; // 线下版本号
  operatingState?: boolean; // 状态
  operation?: string; // 操作
  paperSize?: string; // 纸张大小
  permissionConfig?: string; // 权限配置列表
  procInstId?: string; // 审批流程实例ID
  runtimeJson?: string; // 运行时json
  script?: string; // SQL脚本
  sourceImportFormTmplId?: string; // 原导入模板ID
  updateRemark?: string; // 升级配置
  version?: string; // 版本
  viewType?: string; // 视图类型：VIEW_MODEL 视图模型、SQL:SQL视图、VIEW
  width?: number; // 尺寸（宽度）
}

/**
 * title: OnlineUserSummary
 */
export interface OnlineUserSummary {
  dateValue?: string;
  endPeriod?: number;
  id?: string;
  maxCount?: number;
  maxOnlineUsersInfo?: Array<OnlineUsers>;
  maxTime?: string;
  maxUserIds?: string;
  onlineUserIds?: string;
  startPeriod?: number;
}

/**
 * title: OnlineUserSummaryRequest
 */
export interface OnlineUserSummaryRequest {
  dateValue?: string; // 日期值
  endPeriod?: number; // 结束时间区间
  maxCount?: number; // 最大在线用户数
  maxTime?: string; // 最大在线用户时间点
  maxUserIds?: string; // 最大在线用户ids
  onlineUserIds?: string; // 实时在线用户ids
  startPeriod?: number; // 开始时间区间
}

/**
 * title: OnlineUserSummaryResponse
 */
export interface OnlineUserSummaryResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dateValue?: string; // 日期值
  endPeriod?: number; // 结束时间区间
  id?: string; // ID
  maxCount?: number; // 最大在线用户数
  maxTime?: string; // 最大在线用户时间点
  maxUserIds?: string; // 最大在线用户ids
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  onlineUserIds?: string; // 实时在线用户ids
  startPeriod?: number; // 开始时间区间
}

/**
 * title: OnlineUsers
 */
export interface OnlineUsers {
  browserTag?: string;
  clientId?: string;
  clientType?: string;
  connectedTime?: string;
  fullname?: string;
  ip?: string;
  role?: string;
  tenantName?: string;
  userId?: string;
  username?: string;
}

/**
 * title: OnlineUsersResponse
 */
export interface OnlineUsersResponse {
  browserTag?: string; // 浏览器标识
  clientId?: string; // 连接id
  clientType?: string; // 客户端类型
  connectedTime?: string; // 上传登录时间
  fullname?: string; // 姓名
  ip?: string; // ip地址
  role?: string; // 角色
  tenantName?: string; // 租户名称
  username?: string; // 账号
}

/**
 * title: OpenapiRequest
 */
export interface OpenapiRequest {
  bsKey: string; // 服务key
  description?: string; // 接口描述
  i18nConfig?: string;
  key: string; // 接口key
  method: string; // 请求方法
  modelCategory: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey: string; // 模型key
  name: string; // 接口名称
  url: string; // 请求路径
}

/**
 * title: OpenapiResponse
 */
export interface OpenapiResponse {
  bsKey?: string; // 服务key
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 接口描述
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  i18nConfig?: string;
  id?: string; // id
  initCommitId?: string; // 初始提交 id
  key?: string; // 接口key
  method?: string; // 请求方法
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 接口名称
  sysBuiltin?: number; // 是否系统内置服务(0自定义、1内置)
  url?: string; // 请求路径
}

/**
 * title: OperateTypeDTO
 */
export interface OperateTypeDTO {
  key?: string;
  name?: string;
}

/**
 * title: OperatingStateRequest
 */
export interface OperatingStateRequest {
  operatingState: boolean; // 状态
}

/**
 * title: OrgAddOrUpdateUserRequest
 */
export interface OrgAddOrUpdateUserRequest {
  avatar?: string; // 头像url相对路径
  birthday?: string; // 生日
  country?: string; // 国家区号
  duty?: string; // 职务
  email?: string; // 邮箱
  empNo?: string; // 工号
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string; // 姓名
  gender?: number; // 性别 : 0 女, 1 男, -1 保密
  managerId?: string; // 直属上级
  mobile?: string; // 手机号码
  orgId?: string; // 组织id
  password?: string; // 密码
  platSeat?: boolean; // 平台席位 true勾选
  signPassword?: string;
  signType?: string; // 签名类型
  signatureImage?: string; // 签名照片
  signatureImageWrite?: string; // 签名手写图片相对路径
  suiteSeat?: boolean; // 套件席位 (true 选中,false 未选中)
  telephone?: string; // 座机号码
  userId?: string; // 用户id
  userOrgList?: Array<UserOrgRequest>; // 用户所在组织列表
  username?: string; // 账号
}

/**
 * title: OrgConfig
 */
export interface OrgConfig {
  accountConfigs?: Array<AccountConfig>; // 第三方系统集成
  enableDeleteUser?: number; // 支持删除用户
  enableIdentifier?: number; // 支持部门编号
  extFieldConfigs?: Array<ExtFieldConfig>; // 扩展字段配置
  id?: string;
  initialPassword?: string; // 初始登录密码
  initialSealPassword?: string; // 初始印章密码
  initialSignPassword?: string; // 初始签名密码
  requiredFields?: any[]; // 必填字段/字段key(empNo/工号,mobile/手机号,email/邮箱)
  supportLoginFields?: any[]; // 支持登录字段/字段key(username_/账号,emp_no_/工号,mobile_/手机号码,ext1_/扩展字段1)
}

/**
 * title: OrgCreateAndAddUserRequest
 */
export interface OrgCreateAndAddUserRequest {
  avatar?: string; // 头像
  birthday?: string; // 生日
  country?: string; // 国家区号
  duty?: string; // 职务
  email?: string; // 邮箱
  empNo?: string; // 工号
  enabled?: number;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string; // 姓名
  gender?: number; // 性别
  id?: string;
  managerId?: string; // 直属上级
  mobile?: string; // 手机号
  orgId?: string; // 组织id
  password?: string; // 密码
  platSeat?: boolean; // 平台席位
  signPassword?: string;
  signType?: string; // 签名方式
  signatureImage?: string; // 签名照片
  signatureImageWrite?: string; // 签名手写图片相对路径
  suiteSeat?: boolean; // 套件席位
  telephone?: string; // 座机号码
  userId?: string; // 用户id
  userOrgList?: Array<UserOrgRequest>; // 用户所在组织列表
  username?: string; // 账号
}

/**
 * title: OrgDragRequest
 */
export interface OrgDragRequest {
  id?: string; // 选中组织id
  targetParentId?: string; // 目标位置父节点id，不传或传「ROOT」则代表根节点
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: OrgMoveUserRequest
 */
export interface OrgMoveUserRequest {
  fromOrgId?: string; // 移出组织id
  toOrgId?: string; // 移入组织id
  userIds?: any[]; // 用户id集合
}

/**
 * title: OrgRemoveUserRequest
 */
export interface OrgRemoveUserRequest {
  orgId?: string; // 组织id
  userIds?: any[]; // 用户id集合
}

/**
 * title: OrgRequest
 */
export interface OrgRequest {
  fullPath?: string; // 父节点集合
  id?: string;
  identifier?: string; // 组织编号
  name?: string; // 组织名称
  parentId?: string; // 父节点id
  sortNum?: number; // 排序序号
  tenantId?: string; // 租户 id
  type?: string; // 类型（集团 GROUP/公司 COMPANY/部门 DEPARTMENT）
}

/**
 * title: OrgResponse
 */
export interface OrgResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 父节点集合
  id?: string; // 主键
  identifier?: string; // 组织编号
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 组织名称
  parentId?: string; // 父节点id
  sortNum?: number; // 排序序号
  tenantId?: string; // 租户 id
  type?: string; // 类型（集团/公司/部门）
}

/**
 * title: OrgTransferAndDeleteRequest
 */
export interface OrgTransferAndDeleteRequest {
  id?: string; // 选中组织id
  targetParentId?: string; // 目标位置父节点id，不传或传「ROOT」则代表根节点
}

/**
 * title: OrgUserResponse
 */
export interface OrgUserResponse {
  avatar?: string; // 头像url相对路径
  birthday?: string; // 生日
  country?: string; // 国际区号
  createTime?: string; // 创建时间
  createUserName?: string; // 创建人姓名
  duty?: string; // 职务
  email?: string; // 邮箱
  empNo?: string; // 工号
  enabled?: number; // 是否启用
  ext0?: string; // 扩展字段0
  ext1?: string; // 扩展字段1
  ext2?: string; // 扩展字段2
  ext3?: string; // 扩展字段3
  ext4?: string; // 扩展字段4
  ext5?: number; // 扩展字段5
  ext6?: number; // 扩展字段6
  ext7?: number; // 扩展字段7
  ext8?: number; // 扩展字段8
  ext9?: number; // 扩展字段9
  fullname?: string; // 姓名
  gender?: number; // 性别 : 0 女, 1 男, -1 保密
  managerId?: string; // 直属上级id
  managerName?: string; // 直属上级姓名
  mobile?: string; // 手机号码
  modifyTime?: string; // 修改时间
  modifyUserId?: string;
  modifyUserName?: string;
  orgId?: string; // 部门id
  orgNames?: any[]; // 所属部门名称
  platSeat?: boolean; // 平台席位 true勾选
  principal?: number; // 是否是部门负责人,0: 否 1: 是
  signType?: string; // 签名类型
  signatureImage?: string; // 签名照片url相对路径
  signatureImageWrite?: string; // 签名手写路径
  suiteSeat?: boolean; // 套件席位 (true 选中,false 未选中)
  telephone?: string; // 座机号码
  tenantList?: Array<UserTenantDTO>; // 所属租户列表
  userId?: string; // 用户 ID
  userOrgList?: Array<UserOrgResponse>; // 部门列表
  username?: string; // 账号
}

/**
 * title: PadPageRequest
 */
export interface PadPageRequest {
  categoryId?: string; // app分类id
  description?: string; // 页面描述
  key?: string; // 页面key
  name?: string; // 页面名称
  newLogId?: string; // newLogId
}

/**
 * title: PadPageResponse
 */
export interface PadPageResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 页面描述
  designerJson?: string; // 页面设计json
  id?: string; // 主键
  key?: string; // 页面key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  runtimeJson?: string; // 运行时json
}

/**
 * title: PageBase«AppBranchResponse»
 */
export interface PageBaseAppBranchResponse {
  data?: Array<AppBranchResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«AppPublishLogResponse»
 */
export interface PageBaseAppPublishLogResponse {
  data?: Array<AppPublishLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ApprovalLogResponse»
 */
export interface PageBaseApprovalLogResponse {
  data?: Array<ApprovalLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«AuditLogResponse»
 */
export interface PageBaseAuditLogResponse {
  data?: Array<AuditLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«BizEventResponse»
 */
export interface PageBaseBizEventResponse {
  data?: Array<BizEventResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«BizServiceResponse»
 */
export interface PageBaseBizServiceResponse {
  data?: Array<BizServiceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«CategoryRelationResponse»
 */
export interface PageBaseCategoryRelationResponse {
  data?: Array<CategoryRelationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«CategoryResponse»
 */
export interface PageBaseCategoryResponse {
  data?: Array<CategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«CommitLogResponse»
 */
export interface PageBaseCommitLogResponse {
  data?: Array<CommitLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«CommonInfoCardResponse»
 */
export interface PageBaseCommonInfoCardResponse {
  data?: Array<CommonInfoCardResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ControlConfigResponse»
 */
export interface PageBaseControlConfigResponse {
  data?: Array<ControlConfigResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«CustomerComplaintResponse»
 */
export interface PageBaseCustomerComplaintResponse {
  data?: Array<CustomerComplaintResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DashboardResponse»
 */
export interface PageBaseDashboardResponse {
  data?: Array<DashboardResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DataModelResponse»
 */
export interface PageBaseDataModelResponse {
  data?: Array<DataModelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DataSourceDTO»
 */
export interface PageBaseDataSourceDTO {
  data?: Array<DataSourceDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DataTraceResponse»
 */
export interface PageBaseDataTraceResponse {
  data?: Array<DataTraceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DesignerOperateLogResponse»
 */
export interface PageBaseDesignerOperateLogResponse {
  data?: Array<DesignerOperateLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DocControlStartedResponse»
 */
export interface PageBaseDocControlStartedResponse {
  data?: Array<DocControlStartedResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DocControlTaskDoneResponse»
 */
export interface PageBaseDocControlTaskDoneResponse {
  data?: Array<DocControlTaskDoneResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DocControlTaskTodoResponse»
 */
export interface PageBaseDocControlTaskTodoResponse {
  data?: Array<DocControlTaskTodoResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DocOutlineResponse»
 */
export interface PageBaseDocOutlineResponse {
  data?: Array<DocOutlineResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DocumentResponse»
 */
export interface PageBaseDocumentResponse {
  data?: Array<DocumentResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EdhrCategoryResponse»
 */
export interface PageBaseEdhrCategoryResponse {
  data?: Array<EdhrCategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EdhrCirculationFormModelMetaResponse»
 */
export interface PageBaseEdhrCirculationFormModelMetaResponse {
  data?: Array<EdhrCirculationFormModelMetaResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EdhrInstanceResponse»
 */
export interface PageBaseEdhrInstanceResponse {
  data?: Array<EdhrInstanceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EnumModelFieldResponse»
 */
export interface PageBaseEnumModelFieldResponse {
  data?: Array<EnumModelFieldResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EnumModelResponse»
 */
export interface PageBaseEnumModelResponse {
  data?: Array<EnumModelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EventLogResponse»
 */
export interface PageBaseEventLogResponse {
  data?: Array<EventLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«EventResponse»
 */
export interface PageBaseEventResponse {
  data?: Array<EventResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ExcelTmplResponse»
 */
export interface PageBaseExcelTmplResponse {
  data?: Array<ExcelTmplResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FieldMetaDTO»
 */
export interface PageBaseFieldMetaDTO {
  data?: Array<FieldMetaDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FormRelateDTO»
 */
export interface PageBaseFormRelateDTO {
  data?: Array<FormRelateDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FrontOperateLogResponse»
 */
export interface PageBaseFrontOperateLogResponse {
  data?: Array<FrontOperateLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«GlobalMethodResponse»
 */
export interface PageBaseGlobalMethodResponse {
  data?: Array<GlobalMethodResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«I18nInfoResponse»
 */
export interface PageBaseI18nInfoResponse {
  data?: Array<I18nInfoResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ImportReportResponse»
 */
export interface PageBaseImportReportResponse {
  data?: Array<ImportReportResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«InspectionCategoryResponse»
 */
export interface PageBaseInspectionCategoryResponse {
  data?: Array<InspectionCategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«InstanceRelationResponse»
 */
export interface PageBaseInstanceRelationResponse {
  data?: Array<InstanceRelationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«JobLogResponse»
 */
export interface PageBaseJobLogResponse {
  data?: Array<JobLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«JobResponse»
 */
export interface PageBaseJobResponse {
  data?: Array<JobResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«LabelLogResponse»
 */
export interface PageBaseLabelLogResponse {
  data?: Array<LabelLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«LabelResponse»
 */
export interface PageBaseLabelResponse {
  data?: Array<LabelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MaterialNo4TaskResponse»
 */
export interface PageBaseMaterialNo4TaskResponse {
  data?: Array<MaterialNo4TaskResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MergeLogResponse»
 */
export interface PageBaseMergeLogResponse {
  data?: Array<MergeLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MessageRecordResponse»
 */
export interface PageBaseMessageRecordResponse {
  data?: Array<MessageRecordResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MessageTmplResponse»
 */
export interface PageBaseMessageTmplResponse {
  data?: Array<MessageTmplResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MobileHomepageResponse»
 */
export interface PageBaseMobileHomepageResponse {
  data?: Array<MobileHomepageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«MobilePageResponse»
 */
export interface PageBaseMobilePageResponse {
  data?: Array<MobilePageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ModelMetaResponse»
 */
export interface PageBaseModelMetaResponse {
  data?: Array<ModelMetaResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ModelMethodResponse»
 */
export interface PageBaseModelMethodResponse {
  data?: Array<ModelMethodResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ModelPermissionRelationResponse»
 */
export interface PageBaseModelPermissionRelationResponse {
  data?: Array<ModelPermissionRelationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineFormCategoryResponse»
 */
export interface PageBaseOnlineFormCategoryResponse {
  data?: Array<OnlineFormCategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineFormInstanceResponse»
 */
export interface PageBaseOnlineFormInstanceResponse {
  data?: Array<OnlineFormInstanceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineFormModelMeta»
 */
export interface PageBaseOnlineFormModelMeta {
  data?: Array<OnlineFormModelMeta>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineFormTmplLogResponse»
 */
export interface PageBaseOnlineFormTmplLogResponse {
  data?: Array<OnlineFormTmplLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineUserSummaryResponse»
 */
export interface PageBaseOnlineUserSummaryResponse {
  data?: Array<OnlineUserSummaryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OnlineUsersResponse»
 */
export interface PageBaseOnlineUsersResponse {
  data?: Array<OnlineUsersResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OpenapiResponse»
 */
export interface PageBaseOpenapiResponse {
  data?: Array<OpenapiResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OrgUserResponse»
 */
export interface PageBaseOrgUserResponse {
  data?: Array<OrgUserResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PadPageResponse»
 */
export interface PageBasePadPageResponse {
  data?: Array<PadPageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PageDesignerLogResponse»
 */
export interface PageBasePageDesignerLogResponse {
  data?: Array<PageDesignerLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PermissionResponse»
 */
export interface PageBasePermissionResponse {
  data?: Array<PermissionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PickerUserDTO»
 */
export interface PageBasePickerUserDTO {
  data?: Array<PickerUserDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmProcessActiveVersion»
 */
export interface PageBasePmProcessActiveVersion {
  data?: Array<PmProcessActiveVersion>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PrintLogResponse»
 */
export interface PageBasePrintLogResponse {
  data?: Array<PrintLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PrintRelateDTO»
 */
export interface PageBasePrintRelateDTO {
  data?: Array<PrintRelateDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessApprovalLogResponse»
 */
export interface PageBaseProcessApprovalLogResponse {
  data?: Array<ProcessApprovalLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessApproveUserResponse»
 */
export interface PageBaseProcessApproveUserResponse {
  data?: Array<ProcessApproveUserResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessDefinitionResponse»
 */
export interface PageBaseProcessDefinitionResponse {
  data?: Array<ProcessDefinitionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessEventResponse»
 */
export interface PageBaseProcessEventResponse {
  data?: Array<ProcessEventResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessInstanceRelationResponse»
 */
export interface PageBaseProcessInstanceRelationResponse {
  data?: Array<ProcessInstanceRelationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessInstanceResponse»
 */
export interface PageBaseProcessInstanceResponse {
  data?: Array<ProcessInstanceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessMessageUserResponse»
 */
export interface PageBaseProcessMessageUserResponse {
  data?: Array<ProcessMessageUserResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessNodeDefinitionResponse»
 */
export interface PageBaseProcessNodeDefinitionResponse {
  data?: Array<ProcessNodeDefinitionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessPathUserResponse»
 */
export interface PageBaseProcessPathUserResponse {
  data?: Array<ProcessPathUserResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessTaskDoneApproveHisResponse»
 */
export interface PageBaseProcessTaskDoneApproveHisResponse {
  data?: Array<ProcessTaskDoneApproveHisResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessTaskDoneResponse»
 */
export interface PageBaseProcessTaskDoneResponse {
  data?: Array<ProcessTaskDoneResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessTaskTodoApproveHisResponse»
 */
export interface PageBaseProcessTaskTodoApproveHisResponse {
  data?: Array<ProcessTaskTodoApproveHisResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProcessTaskTodoResponse»
 */
export interface PageBaseProcessTaskTodoResponse {
  data?: Array<ProcessTaskTodoResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProductReleaseCategoryResponse»
 */
export interface PageBaseProductReleaseCategoryResponse {
  data?: Array<ProductReleaseCategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ProductReleaseResponse»
 */
export interface PageBaseProductReleaseResponse {
  data?: Array<ProductReleaseResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PublishLogResponse»
 */
export interface PageBasePublishLogResponse {
  data?: Array<PublishLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«RegexpResponse»
 */
export interface PageBaseRegexpResponse {
  data?: Array<RegexpResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ReportDataSetResponse»
 */
export interface PageBaseReportDataSetResponse {
  data?: Array<ReportDataSetResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ReportResponse»
 */
export interface PageBaseReportResponse {
  data?: Array<ReportResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«RoleResponse»
 */
export interface PageBaseRoleResponse {
  data?: Array<RoleResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SandboxConfigResponse»
 */
export interface PageBaseSandboxConfigResponse {
  data?: Array<SandboxConfigResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ScriptResponse»
 */
export interface PageBaseScriptResponse {
  data?: Array<ScriptResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ScriptVersionLogResponse»
 */
export interface PageBaseScriptVersionLogResponse {
  data?: Array<ScriptVersionLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ScriptVersionResponse»
 */
export interface PageBaseScriptVersionResponse {
  data?: Array<ScriptVersionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ServiceOrchestrationResponse»
 */
export interface PageBaseServiceOrchestrationResponse {
  data?: Array<ServiceOrchestrationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ServiceOrchestrationVersionLogResponse»
 */
export interface PageBaseServiceOrchestrationVersionLogResponse {
  data?: Array<ServiceOrchestrationVersionLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ServiceOrchestrationVersionResponse»
 */
export interface PageBaseServiceOrchestrationVersionResponse {
  data?: Array<ServiceOrchestrationVersionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SignHistoryResponse»
 */
export interface PageBaseSignHistoryResponse {
  data?: Array<SignHistoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SignLogResponse»
 */
export interface PageBaseSignLogResponse {
  data?: Array<SignLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SqlViewModelResponse»
 */
export interface PageBaseSqlViewModelResponse {
  data?: Array<SqlViewModelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SysConfigResponse»
 */
export interface PageBaseSysConfigResponse {
  data?: Array<SysConfigResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«SystemVarResponse»
 */
export interface PageBaseSystemVarResponse {
  data?: Array<SystemVarResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TraceLogDetailsResponse»
 */
export interface PageBaseTraceLogDetailsResponse {
  data?: Array<TraceLogDetailsResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TraceLogResponse»
 */
export interface PageBaseTraceLogResponse {
  data?: Array<TraceLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TraceMainlineExtResponse»
 */
export interface PageBaseTraceMainlineExtResponse {
  data?: Array<TraceMainlineExtResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TraceMainlineResponse»
 */
export interface PageBaseTraceMainlineResponse {
  data?: Array<TraceMainlineResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«UserLoginLogDTO»
 */
export interface PageBaseUserLoginLogDTO {
  data?: Array<UserLoginLogDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«UserResponse»
 */
export interface PageBaseUserResponse {
  data?: Array<UserResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«UserWithUserExtraDTO»
 */
export interface PageBaseUserWithUserExtraDTO {
  data?: Array<UserWithUserExtraDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ViewModelResponse»
 */
export interface PageBaseViewModelResponse {
  data?: Array<ViewModelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«WebpageResponse»
 */
export interface PageBaseWebpageResponse {
  data?: Array<WebpageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageDesignerLogRequest
 */
export interface PageDesignerLogRequest {
  designerJson?: string; // 设计Json
  name?: string; // 页面名称
  operatorInfo?: string; // 操作人（工号）姓名
  relationId?: string; // 管理数据id
  relationType?: number; // 类型（1 web、2 mobile）
  runtimeJson?: string; // 运行时Json
}

/**
 * title: PageDesignerLogResponse
 */
export interface PageDesignerLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  designerJson?: string; // 设计Json
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  operatorInfo?: string; // 操作人（工号）姓名
  relationId?: string; // 管理数据id
  relationType?: number; // 类型（1 web、2 mobile）
  runtimeJson?: string; // 运行时Json
}

/**
 * title: PageLockRequest
 */
export interface PageLockRequest {
  id?: string; // 页面数据id
  type?: string; // 页面类型 (web app avaScript ...)
  userId?: string; // 解除占用的用户id（mqtt遗嘱消息体中必传）
}

/**
 * title: PageOccupyResponse
 */
export interface PageOccupyResponse {
  cacheNum?: number; // 占用缓存时间（单位：秒）
  id?: string; // 主键
  occupyId?: string; // 占用人id
  occupyName?: string; // 占用人名称
  querySpanNum?: number; // 心跳查询间隔（单位：秒）
}

/**
 * title: PageSyncDTO
 */
export interface PageSyncDTO {
  id?: string; // 页面ID
  module?: string; // 所属模块(web_module:web页面 、mobile_module: PDA页面  、pad_module:pad页面模块)
}

/**
 * title: Parameter
 */
export interface Parameter {
  description?: string;
  name?: string;
  paramType?: string;
  required?: string;
  type?: string;
}

/**
 * title: Permission
 */
export interface Permission {
  permissionKey?: string; // 权限key
  permissionType?: string; // 权限类型(MENU:菜单；POINT:权限点)
}

/**
 * title: PermissionPointDTO
 */
export interface PermissionPointDTO {
  key?: string; // 权限key
  name?: string; // 权限名称
}

/**
 * title: PermissionRequest
 */
export interface PermissionRequest {
  key?: string; // 权限key
  name?: string; // 权限名称
  relationId?: string; // web页面/mobile页面的id
  terminalType?: string; // WEB/MOBILE
}

/**
 * title: PermissionResponse
 */
export interface PermissionResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  key?: string; // 权限key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 权限名称
  relationId?: string; // web页面/mobile页面的id
  sysBuiltin?: string; // 是否内置
  terminalType?: string; // WEB/MOBILE
}

/**
 * title: PickerOrgDTO
 */
export interface PickerOrgDTO {
  id?: string; // 主键
  name?: string; // 组织名称
  parentId?: string; // 父节点id
  principalUserId?: string; // 负责人id
  principalUserName?: string; // 负责人名称
  sortNum?: number; // 排序序号
  type?: string; // 类型（集团/公司/部门）
}

/**
 * title: PickerUserDTO
 */
export interface PickerUserDTO {
  __LABEL__?: string; // 展示标签，应用中展示用户时有用
  avatar?: string; // 头像url
  birthday?: string; // 生日
  email?: string; // 邮箱
  empNo?: string; // 工号
  enabled?: number; // 0：禁用 1：启用 2：未激活
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string; // 姓名
  id?: string; // 用户 ID
  managerId?: string; // 直属上级id
  managerName?: string; // 直属上级姓名
  masterOrgId?: string; // 主部门id
  masterOrgName?: string; // 主部门名称
  mobile?: string; // 手机号码
  orgNames?: string;
  username?: string; // 账号
}

/**
 * title: PlatformBaseConfig
 */
export interface PlatformBaseConfig {
  copyright?: string; // 版权信息
  description?: string; // 平台描述
  icon?: string; // 站点icon
  id?: string; // 主键id
  loadingImage?: string; // loading图标
  logo?: string; // 平台Logo
  name?: string; // 平台名称
  thumbnail?: string; // Logo缩略图
  version?: string; // 平台版本
}

/**
 * title: PmProcessActiveVersion
 */
export interface PmProcessActiveVersion {
  activeVersion?: string;
  activeVersionId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  id?: string;
  key?: string;
  lockUserId?: string;
  lockUserName?: string;
  modelKey?: string;
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  source?: string;
  titleConfig?: string;
  type?: string;
}

/**
 * title: PmProcessDefinition
 */
export interface PmProcessDefinition {
  activeDefVersion?: ProcessDefinitionVersion;
  activeVersion?: string;
  activeVersionId?: string;
  categoryId?: string;
  categoryName?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  id?: string;
  key?: string;
  lockUserId?: string;
  lockUserName?: string;
  modelKey?: string;
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  source?: string;
  titleConfig?: string;
  type?: string;
}

/**
 * title: PmProcessDefinitionVersionRequest
 */
export interface PmProcessDefinitionVersionRequest {
  builtinMsgEnabled?: number; // 开启推送内置消息 0/1
  events?: Array<ProcessEvent>; // 事件
  id?: string; // 主键 - 修改时必传
  json?: string; // xml的json形式（前端使用）
  mobilePageKey?: string; // 移动端页面key
  mobilePageOption?: number; // mobile端页面配置
  mobileViewPageKey?: string; // 移动端查看页面key
  nodes?: Array<ProcessNodeDefinitionRequest>; // 节点定义
  procDefId?: string; // 流程定义ID
  push?: string; // 推送方式json
  version?: string; // 版本 - 修改时必传
  webPageKey?: string; // pc端页面key
  webPageOption?: number; // pc端页面配置
  webViewPageKey?: string; // pc端查看页面key
  xml?: string; // bpmn2.0格式的流程定义
}

/**
 * title: PmProcessVersion
 */
export interface PmProcessVersion {
  processDefinitionId?: string;
  processDefinitionVersionId?: string;
}

/**
 * title: PrintAdapterDTO
 */
export interface PrintAdapterDTO {
  branchId: string; // 分支Id
  env: string; // 环境
  printAppId: string; // 触发打印的应用id
  printContent?: string; // 打印内容： doc 、excel、pdf为URL 、zpl
  printKey?: string; // 打印机/打印服务唯一标识：规则为 类型:key:[可选 若无则去找默认打印机、有则base64解码定位打印机]
  printNumber?: number; // 打印份数
  printType?: string; // 打印的类型： doc 、excel 、pdf 、 zpl=标签打印
  remark?: string; // 备注
  tagName?: string; // 标签名称
}

/**
 * title: PrintCode
 */
export interface PrintCode {
  code?: string;
  labelHeight?: number;
  labelWidth?: number;
  printType?: string;
}

/**
 * title: PrintLogResponse
 */
export interface PrintLogResponse {
  branchId?: string; // 分支
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境
  id?: string; // $column.comments
  key?: string; // 打印资源key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  printAppId?: string; // 触发打印的应用id
  printAppName?: string; // 触发打印的应用名称
  printContent?: string; // 打印内容
  printIp?: string; // 打印机IP
  printName?: string; // 打印机名称
  printNumber?: number; // 打印份数
  printPort?: string; // 打印机端口协议
  printType?: string; // 打印的类型
  remark?: string; // 备注
  resourceName?: string; // 资源名称
  resourceType?: string; // 资源类型
  tagName?: string; // 标签名称
  tenantId?: string; // 租户ID
}

/**
 * title: PrintLogSearchRequest
 */
export interface PrintLogSearchRequest {
  branchId?: string; // 分支
  endTime?: string; // 结束时间
  env?: string; // 环境
  key?: string; // key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  printAppId?: string; // printAppId
  printAppName?: string; // 触发打印的应用名称
  printName?: string; // printName
  printType?: string; // 打印的类型
  resourceName?: string; // resourceName
  resourceType?: string; // resourceType
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}

/**
 * title: PrintRelateDTO
 */
export interface PrintRelateDTO {
  baseId?: string; // rdo父id
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  children?: Array<PrintRelateDTO>;
  createTime?: string;
  createUserName?: string;
  default?: number; // 是否默认版本 1是 0否
  description?: string; // 备注
  hasChild?: boolean; // 是否子版本
  id?: string; // ID
  key?: string; // 标签key
  modelKey?: string; // 绑定模型key
  modelName?: string; // 绑定模型名称
  modifyTime?: string; // 最后修改时间
  modifyUserName?: string; // 最后修改人
  name?: string; // 标签名称
  printType?: string; // 标签格式，zpl/tspl/cpcl/pos/esc/png
  relationId?: string; // 分类数据id
  version?: string; // 版本
}

/**
 * title: PrintServiceBtwTreeVO
 */
export interface PrintServiceBtwTreeVO {
  fileTree?: Array<BtwNodeVO>; // 文件树
  id?: string; // 打印服务主键
  macAddress?: string; // mac_地址
  name?: string; // 打印资源名称
}

/**
 * title: PrintServiceTreeVO
 */
export interface PrintServiceTreeVO {
  brand?: string; // 品牌
  defaultPrint?: string; // 默认打印
  id?: string; // 打印服务主键/打印机主键
  macAddress?: string; // mac_地址
  name?: string; // 打印服务名/打印机名称
  parentId?: string; // 打印机父节点id：若为打印机则其值为 所属打印服务/网络打印机id
  printChildNode?: Array<PrintServiceTreeVO>; // 打印机子节点
  printIp?: string; // 打印机ip地址
  printKey?: string; // 打印机标识 - 唯一索引
  status?: number; // 打印机状态
  type?: string; // 打印资源类型（CLIENT_PRINT、INTERNET_PRINT）
}

/**
 * title: ProcModelDataInfo
 */
export interface ProcModelDataInfo {
  dataId?: string;
  modelKey?: string;
}

/**
 * title: ProcStartInstRequest
 */
export interface ProcStartInstRequest {
  bizServiceKey?: string; // 业务服务
  button?: string; // 流程按钮
  data: object; // 提交的数据
  procDefId: string; // 流程定义id
}

/**
 * title: ProcessApprovalLogRequest
 */
export interface ProcessApprovalLogRequest {
  actId?: string; // 节点Id
  actName?: string; // 节点名称
  countersignUserIds?: string; // 加签用户id
  dataId?: string; // 模型数据ID
  duration?: number; // 耗时
  endTime?: string; // 结束时间
  modelKey?: string; // 模型Key
  operationName?: string; // 操作名称
  opinion?: string; // 审批意见
  processInstanceId?: string; // 流程实例ID
  signature?: string; // 签名
  startTime?: string; // 开始时间
  userId?: string; // 处理人Id
  userName?: string; // 处理人姓名
}

/**
 * title: ProcessApprovalLogResponse
 */
export interface ProcessApprovalLogResponse {
  actId?: string; // 节点Id
  actName?: string; // 节点名称
  countersignUserIds?: string; // 加签用户id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string; // 模型数据ID
  duration?: number; // 耗时
  endTime?: string; // 结束时间
  id?: string; // 主键
  modelKey?: string; // 模型Key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  operationName?: string; // 操作名称
  opinion?: string; // 审批意见
  processInstanceId?: string; // 流程实例ID
  signature?: string; // 签名
  startTime?: string; // 开始时间
  userId?: string; // 处理人Id
  userName?: string; // 处理人姓名
}

/**
 * title: ProcessApproveRequest
 */
export interface ProcessApproveRequest {
  btnKey: string; // 点击的按钮的key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: ProcessApproveUser
 */
export interface ProcessApproveUser {
  config?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string;
  procDefVerId?: string;
}

/**
 * title: ProcessApproveUserRequest
 */
export interface ProcessApproveUserRequest {
  config?: string; // 具体配置json
  nodeId?: string; // 节点Id
  procDefVerId?: string; // 流程定义版本ID
}

/**
 * title: ProcessApproveUserResponse
 */
export interface ProcessApproveUserResponse {
  config?: string; // 具体配置json
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string; // 节点Id
  procDefVerId?: string; // 流程定义版本ID
}

/**
 * title: ProcessDefinitionFeignResponse
 */
export interface ProcessDefinitionFeignResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // 主键
  key?: string; // 流程定义key
  lockUserId?: string; // 锁定人员id
  lockUserName?: string; // 锁定人员名称
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  titleConfig?: string; // 流程实例标题配置
  type?: string; // 类型 平台审批/电子表单审批/业务流
}

/**
 * title: ProcessDefinitionRequest
 */
export interface ProcessDefinitionRequest {
  categoryId?: string; // 分类id
  description?: string; // 描述
  key?: string; // 流程定义key
  lockUserId?: string; // 锁定人员id
  lockUserName?: string; // 锁定人员名称
  modelKey?: string; // 模型key
  name?: string; // 名称
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  titleConfig?: string; // 流程实例标题配置
  type?: string; // 类型 平台审批/电子表单审批/业务流
}

/**
 * title: ProcessDefinitionResponse
 */
export interface ProcessDefinitionResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // 主键
  key?: string; // 流程定义key
  lockUserId?: string; // 锁定人员id
  lockUserName?: string; // 锁定人员名称
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  titleConfig?: string; // 流程实例标题配置
  type?: string; // 类型 平台审批/电子表单审批/业务流
}

/**
 * title: ProcessDefinitionVerListResponse
 */
export interface ProcessDefinitionVerListResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefId?: string; // 流程定义ID
  publishTime?: string; // 发布时间
  publisher?: string; // 发布人名
  publisherId?: string; // 发布人ID
  status?: string; // DRAFT 草稿、 PUBLISHED 已发布 HISTORY 历史版本
  version?: string; // 版本
}

/**
 * title: ProcessDefinitionVersion
 */
export interface ProcessDefinitionVersion {
  builtinMsgEnabled?: number;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  events?: Array<ProcessEvent>;
  id?: string;
  json?: string;
  mobilePageKey?: string; // 移动端页面key
  mobilePageOption?: number; // mobile端页面配置
  mobileViewPageKey?: string; // 移动端查看页面key
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodes?: Array<ProcessNodeDefinition>;
  procDefId?: string;
  processApproveUsers?: Array<ProcessApproveUser>;
  processMessageUsers?: Array<ProcessMessageUser>;
  publishTime?: string;
  publisher?: string;
  publisherId?: string;
  push?: string;
  source?: string;
  status?: string;
  version?: string;
  webPageKey?: string; // pc端页面key
  webPageOption?: number; // pc端页面配置
  webViewPageKey?: string; // pc端查看页面key
  xml?: string;
  xmlHash?: string;
}

/**
 * title: ProcessDefinitionVersionRequest
 */
export interface ProcessDefinitionVersionRequest {
  id?: string; // 主键 - 修改时必传
  json?: string; // xml的json形式（前端使用）
  mobilePageKey?: string; // 移动端页面key
  mobilePageOption?: number; // mobile端页面配置
  mobileViewPageKey?: string; // 移动端查看页面key
  nodes?: Array<ProcessNodeDefinitionRequest>; // 节点定义
  procDefId?: string; // 流程定义ID
  version?: string; // 版本 - 修改时必传
  webPageKey?: string; // pc端页面key
  webPageOption?: number; // pc端页面配置
  webViewPageKey?: string; // pc端查看页面key
  xml?: string; // bpmn2.0格式的流程定义
}

/**
 * title: ProcessDefinitionVersionResponse
 */
export interface ProcessDefinitionVersionResponse {
  builtinMsgEnabled?: number; // 开启推送内置消息 0/1
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  events?: Array<ProcessEventResponse>; // 事件
  id?: string; // 主键
  json?: string; // xml的json形式（前端使用）
  mobilePageKey?: string; // 移动端页面key
  mobilePageOption?: number; // mobile端页面配置
  mobileViewPageKey?: string; // 移动端查看页面key
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodes?: Array<ProcessNodeDefinitionResponse>; // 节点
  procDefId?: string; // 流程定义ID
  processApproveUsers?: Array<ProcessApproveUserResponse>; // 节点审批人
  processMessageUsers?: Array<ProcessMessageUserResponse>; // 节点消息接收人
  publisher?: string; // 发布人名
  publisherId?: string; // 发布人ID
  push?: string; // 开启推送内置消息 0/1
  status?: string; // DRAFT 草稿、 PUBLISHED 已发布 HISTORY 历史版本
  version?: string; // 版本
  webPageKey?: string; // pc端页面key
  webPageOption?: number; // pc端页面配置
  webViewPageKey?: string; // pc端查看页面key
  xml?: string; // bpmn2.0格式的流程定义
  xmlHash?: string; // Xml的md5值
}

/**
 * title: ProcessEngineRequest
 */
export interface ProcessEngineRequest {
  bizServiceKey?: string; // 仅脚本服务或编排服务 其他不传
  button?: string;
  message?: string;
  processInstanceId?: string;
  processKey?: string;
  values?: object;
}

/**
 * title: ProcessEvent
 */
export interface ProcessEvent {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  executeResourceConfig?: string;
  executeResourceId?: string;
  executeResourceType?: string;
  executeType?: string;
  id?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  relationId?: string;
  relationType?: string;
  source?: string;
}

/**
 * title: ProcessEventRequest
 */
export interface ProcessEventRequest {
  executeResourceConfig?: string; // 执行资源配置
  executeResourceId?: string; // 执行资源id
  executeResourceType?: string; // 执行资源类型（脚本/编排/内置/页面脚本)
  executeType?: string; // 执行方式(异步/同步)
  id?: string; // 主键 - 修改时必传
  key?: string; // 事件标识
  relationId?: string; // 关联关系id ，修改时必传
  relationType: string; // 关联关系类型（PROC_DEF：流程版本定义/PROC_NODE_DEF：节点定义）
}

/**
 * title: ProcessEventResponse
 */
export interface ProcessEventResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  executeResourceConfig?: string; // 执行资源配置
  executeResourceId?: string; // 执行资源id
  executeResourceType?: string; // 执行资源类型（脚本/编排/内置/页面脚本)
  executeType?: string; // 执行方式(异步/同步)
  id?: string; // 主键
  key?: string; // 事件标识
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  relationId?: string; // 关联关系id
  relationType?: string; // 关联关系类型（流程版本定义/节点定义）
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
}

/**
 * title: ProcessExtension
 */
export interface ProcessExtension {
  btnList?: any[];
  initiator?: string;
  initiatorNode?: ProcessNodeDefinition;
  mobilePageKey?: string; // 移动端页面key
  mobileViewPageKey?: string; // 移动端查看页面key
  node?: ProcessNodeDefinition; // 节点信息
  procInstId?: string;
  processDefId?: string; // 流程id
  taskId?: string;
  webPageKey?: string; // pc端页面key
  webViewPageKey?: string; // pc端查看页面key
}

/**
 * title: ProcessGraphResponse
 */
export interface ProcessGraphResponse {
  approveWay?: string; // 审批方式（竞签/会签）
  approvedUsers?: Array<TriplestringstringLocalDateTime>; // 已审批人信息，姓名-头像-审批时间
  congifString?: string; // 审批配置
  finishTime?: string; // 结束时间
  id?: string; // 节点id
  messages?: object; // 消息统计信息，SUCCEED/FAILURE-数量
  msgTmplName?: string; // 消息模板名
  name?: string; // 节点名
  operationName?: string; // 操作名称
  scriptName?: string; // 脚本名
  status?: string; // 节点状态,UNSTART=未开始;APPROVING=处理中,FINISHED=已完成
  type?: string; // 节点类型
  unApprovedUsers?: Array<TriplestringstringLocalDateTime>; // 未审批人信息，姓名-头像
  versionId?: string; // 流程实例版本Id
}

/**
 * title: ProcessHistory
 */
export interface ProcessHistory {
  approval?: string;
  approvalList?: Array<ProcessHistoryDetail>;
  approvalMsg?: string;
  avatar?: string;
  duration?: string;
  endTime?: string;
  error?: number;
  message?: string;
  name?: string;
  signature?: string;
  startTime?: string;
  success?: number;
  type?: string;
  username?: string;
}

/**
 * title: ProcessHistoryDetail
 */
export interface ProcessHistoryDetail {
  approval?: string;
  approvalMsg?: string;
  avatar?: string;
  countersignUsers?: Array<PickerUserDTO>;
  duration?: string;
  endTime?: string;
  error?: number;
  message?: string;
  name?: string;
  reassigner?: PickerUserDTO;
  signature?: string;
  startTime?: string;
  success?: number;
  type?: string;
  username?: string;
}

/**
 * title: ProcessHistoryResult
 */
export interface ProcessHistoryResult {
  duration?: string;
  processHistoryList?: Array<ProcessHistory>;
  status?: string;
}

/**
 * title: ProcessInstance
 */
export interface ProcessInstance {
  assigneeNames?: string;
  assignees?: string;
  combinedStatus?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string;
  deleted?: number;
  endTime?: string;
  id?: string;
  initiator?: string;
  initiatorName?: string;
  modelKey?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefId?: string;
  procDefName?: string;
  procDefVer?: string;
  procDefVerId?: string;
  result?: string;
  startTime?: string;
  status?: string;
  taskKeys?: string;
  taskNames?: string;
  title?: string;
}

/**
 * title: ProcessInstanceRelationRequest
 */
export interface ProcessInstanceRelationRequest {
  procDefId?: string; // 流程定义id
  procDefVerId?: string; // 流程定义版本id()
  procInstId?: string; // 流程实例id
  refId?: string; // EDHR模板版本id/表单模板版本id
  type?: string; // 关联关系类型- 表单模板：FORM、edhr模板：EDHR
}

/**
 * title: ProcessInstanceRelationResponse
 */
export interface ProcessInstanceRelationResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefId?: string; // 流程定义id
  procDefVerId?: string; // 流程定义版本id()
  procInstId?: string; // 流程实例id
  refId?: string; // EDHR模板版本id/表单模板版本id
  type?: string; // 关联关系类型- 表单模板：FORM、edhr模板：EDHR
}

/**
 * title: ProcessInstanceRequest
 */
export interface ProcessInstanceRequest {
  assignees?: string; // 当前处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  dataId?: string; // 关联数据ID
  endTime?: string; // 结束时间
  initiator?: string; // 发起人
  modelKey?: string; // 关联数据模型key
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  result?: string; // 结果(Normal rollback Rejected withdraw)
  startTime?: string; // 开始时间
  status?: string; // 状态(Running|finished)
  title?: string; // 标题
}

/**
 * title: ProcessInstanceResponse
 */
export interface ProcessInstanceResponse {
  assigneeNames?: string; // 当前审批人名称
  assignees?: string; // 当前处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string; // 关联数据ID
  endTime?: string; // 结束时间
  id?: string; // ID
  initiator?: string; // 发起人
  initiatorName?: string; // 当前审批人名称
  modelKey?: string; // 关联数据模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  result?: string; // 结果(Normal rollback Rejected withdraw)
  startTime?: string; // 开始时间
  status?: string; // 状态(Running|finished)
  taskKeys?: string; // 当前节点id
  taskNames?: string; // 当前节点名称
  title?: string; // 标题
}

/**
 * title: ProcessMessageUser
 */
export interface ProcessMessageUser {
  config?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string;
  procDefVerId?: string;
}

/**
 * title: ProcessMessageUserRequest
 */
export interface ProcessMessageUserRequest {
  config?: string; // 具体配置json
  nodeId?: string; // 节点Id
  procDefVerId?: string; // 流程定义版本ID
}

/**
 * title: ProcessMessageUserResponse
 */
export interface ProcessMessageUserResponse {
  config?: string; // 具体配置json
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string; // 节点Id
  procDefVerId?: string; // 流程定义版本ID
}

/**
 * title: ProcessModelInfo
 */
export interface ProcessModelInfo {
  modelDataaId?: string;
  modelKey?: string;
}

/**
 * title: ProcessNodeDefinition
 */
export interface ProcessNodeDefinition {
  approveWay?: string;
  builtinMsgEnabled?: number;
  buttonConfig?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  events?: Array<ProcessEvent>;
  fieldConfig?: string;
  forkConfig?: string;
  id?: string;
  key?: string;
  mobilePageKey?: string;
  mobileViewPageKey?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  msgContentConfig?: string;
  msgReceiverConfig?: string;
  msgTmplKey?: string;
  name?: string;
  onlineFormTmplId?: string;
  opinionConfig?: string;
  permissionConfig?: string;
  procDefVerId?: string;
  source?: string;
  targetUserConfig?: string;
  type?: string;
  webPageKey?: string;
  webViewPageKey?: string;
}

/**
 * title: ProcessNodeDefinitionRequest
 */
export interface ProcessNodeDefinitionRequest {
  approveWay?: string; // 审批方式（竞签/会签）
  builtinMsgEnabled?: number; // 开启推送内置消息 0/1
  buttonConfig?: string; // 按钮配置json
  description?: string; // 描述
  events?: Array<ProcessEventRequest>; // 事件定义
  fieldConfig?: string; // 字段权限配置json
  id?: string; // 主键 - 修改时必传
  key?: string; // 节点key -  canunda actid
  mobilePageKey?: string; // 移动端页面key
  mobileViewPageKey?: string; // 移动端查看页面key
  msgContentConfig?: string; // 消息节点内容
  msgReceiverConfig?: string; // 消息接收人配置
  msgTmplKey?: string; // 消息模板key
  name?: string; // 名称
  onlineFormTmplId?: string; // 在线表单Id
  opinionConfig?: string; // 审批意见配置json
  permissionConfig?: string; // 权限配置
  procDefVerId?: string; // 流程定义版本ID - 修改时必传
  targetUserConfig?: string; // 目标用户json
  type?: string; // 类型 开始/结束/审批/脚本/...
  webPageKey?: string; // pc端页面key
  webViewPageKey?: string; // pc端查看页面key
}

/**
 * title: ProcessNodeDefinitionResponse
 */
export interface ProcessNodeDefinitionResponse {
  approveWay?: string; // 审批方式（竞签/会签）
  buttonConfig?: string; // 按钮配置json
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  events?: Array<ProcessEventResponse>; // 事件
  fieldConfig?: string; // 字段权限配置json
  forkConfig?: string; // 分支配置json
  id?: string; // 主键
  key?: string; // 流程节点定义key
  mobilePageKey?: string; // 移动端页面key
  mobilePageOption?: number; // 移动端页面配置选择
  mobileViewPageKey?: string; // 移动端查看页面key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  msgTmplKey?: string; // 消息模板key
  name?: string; // 名称
  opinionConfig?: string; // 审批意见配置json
  permissionConfig?: string; // 权限配置
  procDefVerId?: string; // 流程定义版本ID
  source?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
  targetUserConfig?: string; // 目标用户json
  type?: string; // 类型 开始/结束/审批/脚本/...
  webPageKey?: string; // pc端页面key
  webPageOption?: number; // PC端页面配置选择
  webViewPageKey?: string; // pc端查看页面key
}

/**
 * title: ProcessOperateRequest
 */
export interface ProcessOperateRequest {
  actId?: string; // 强制转交节点Id
  approveUserId?: string; // 强制转交原审批人Id
  bizServiceKey?: string; // 业务服务
  button?: string; // 流程按钮
  countersignUserIds?: any[]; // 加签用户集合
  data: object; // 提交的数据
  opinion?: string; // 意见
  procDefId: string; // 流程定义id
  procInstId?: string; // 流程实例Id
  reassignId?: string; // 转交用户Id
  signature?: string; // 签名数据
  taskId?: string; // 任务Id
}

/**
 * title: ProcessPathDefRelationResponse
 */
export interface ProcessPathDefRelationResponse {
  paths?: Array<ProcessPathResponse>; // 流程路径
  proDefVer?: ProcessDefinitionVersionResponse; // 流程定义
}

/**
 * title: ProcessPathResponse
 */
export interface ProcessPathResponse {
  approveStatus?: string; // 审批状态：PENDING待处理、RUNNING进行中、COMPLETED已完成
  approveWay?: string; // 审批方式：Competitive： 竞签、Sequential：会签
  caseId?: string; // 分支id（用于分支）
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string; // 流程定义版本节点id
  nodeKey?: string; // 节点key
  nodeName?: string; // 流程定义版本节点name
  ofInstanceId?: string; // 表单实例id
  procDefType?: string; // 流程类型: 电子表单审批 OF_APPROVE、文控审批 DOC_CONTROL_APPROVE
  procDefVerId?: string; // 流程定义版本ID
  processInstanceId?: string; // 流程实例ID
  processPathUsers?: Array<ProcessPathUserResponse>; // 审批人员关联
  rangeUserExchange?: string; // 范围人员兑换json
  tmplId?: string; // 受控文件模板版本id
  txnDefinitionId?: string; // 事务定义id
  txnInstId?: string; // 事务实例id
  txnInstStatus?: string; // 事务实例状态
}

/**
 * title: ProcessPathUserRequest
 */
export interface ProcessPathUserRequest {
  approveUserId?: string; // 审批人id
  approveUserName?: string; // 审批人名称
  endTime?: string; // 当前人员任务完成时间
  opinion?: string; // 审批意见
  processPathId?: string; // 流程审批路径ID
  taskId?: string; // 任务id
}

/**
 * title: ProcessPathUserResponse
 */
export interface ProcessPathUserResponse {
  approveUserId?: string; // 审批人id
  approveUserName?: string; // 审批人名称
  avatar?: string; // 人员头像
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  endTime?: string; // 当前人员任务完成时间
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string; // 流程定义版本节点id
  nodeKey?: string; // 节点key
  nodeName?: string; // 流程定义版本节点name
  opinion?: string; // 审批意见
  processPathId?: string; // 流程审批路径ID
  taskId?: string; // 任务id
}

/**
 * title: ProcessReassign4InterfereRequest
 */
export interface ProcessReassign4InterfereRequest {
  businessId?: string; // 业务ID
  edhrInstanceId: string; // Edhr实例id
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: ProcessReassignRequest
 */
export interface ProcessReassignRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
  toUserId: string; // 转给的用户id
}

/**
 * title: ProcessRequest
 */
export interface ProcessRequest {
  categoryId?: string; // 分类id
  description?: string; // 描述
  key?: string; // key
  name?: string; // 流程名称
  tableMetaId?: string; // 模型ID
  titleConfig?: string; // 流程标题配置
  type?: string; // 类型 业务流 审批流
}

/**
 * title: ProcessResponse
 */
export interface ProcessResponse {
  activeId?: string; // 激活的版本ID
  activeVersion?: string; // 激活的版本号
  appVersionTag?: string; // $column.comments
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // 主键
  key?: string; // key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 流程名称
  tableMetaId?: string; // 模型ID
  tableMetaKey?: string; // 模型KEY
  tableMetaName?: string; // 模型名称
  titleConfig?: string; // 流程标题配置
  type?: string; // 类型 业务流 审批流
}

/**
 * title: ProcessReturn4InterfereRequest
 */
export interface ProcessReturn4InterfereRequest {
  businessId?: string; // 业务ID
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  taskId: string; // 任务id
}

/**
 * title: ProcessReturnRequest
 */
export interface ProcessReturnRequest {
  btnKey: string; // 点击的按钮key
  businessId?: string; // 业务ID
  buttonConfig: string; // 操作的按钮配置
  data: object; // 提交的数据
  edhrInstanceId: string; // EDHR实例ID
  ofInstanceId: string; // 表单实例ID
  opinion?: string; // 意见
  signature?: string; // 签名数据
  taskId: string; // 任务id
}

/**
 * title: ProcessTaskApproveHisQueryRequest
 */
export interface ProcessTaskApproveHisQueryRequest {
  approveHisCreateUserId?: string; // 审批流程记录创建人id
  approveHisModifyUserId?: string; // 审批流程记录修改人id
  assigneeId?: string; // 处理人ID(查询我的待办时传当前登陆人id)
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  changeNo?: string; // 变更编号
  changeType?: string; // 变更类型
  code?: string; // 编码
  description?: string; // 描述
  edhrTmplId?: string; // edhr模板id
  effectiveDate?: string; // 生效日期
  endCreateTime?: string; // 创建时间 - 结束
  endTime?: string; // 待办：任务接收/已办：任务审核-结束时间
  materialNo?: string; // 批次/SN编号
  materialStatus?: string; // 记录类型(NO或SN)，为空则表示全部
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单id
  name?: string; // 名称
  notEdhr?: number; // 是否不显示edhr
  notebookId?: string; // 记录本ID
  ofCode?: string; // 在线表单code
  ofCreateUserId?: string; // 表单创建人id
  ofModifyUserId?: string; // 表单更新人id
  ofTmplId?: string; // 表单模板
  ofTmplName?: string; // 表单模板名称
  onlineFormInstanceId?: string; // 表单实例ID
  onlyEdhr?: number; // 是否仅显示edhr
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  processInstanceStatus?: string; // 当前流程状态： 进行中：RUNNING 已结束：COMPLETED
  productCode?: string; // 产品编码
  productFamilyCode?: string; // 产品家族编码
  productFamilyId?: string; // 产品家族id
  productFamilyName?: string; // 产品家族名称
  productId?: string; // 产品id
  productIdRbi?: string; // 产品基id
  productIdRi?: string; // 产品版本
  productName?: string; // 产品名称
  productProcessId?: string; // 产品制程id
  productProcessProductionType?: string; // 产品制程生产模式
  productSpec?: string; // 产品规格型号
  routingId?: string; // 工艺路线id
  serialNo?: string; // 表单流水号
  showChange?: number; // 是否显示表单变更数据
  showFormProcess?: boolean; // 显示表单流程数据
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCreateTime?: string; // 创建时间 - 开始
  startTime?: string; // 待办：任务接收/已办：任务审核-开始时间
  starterId?: string; // 汇总人ID
  status?: string; // 变更流程的状态
  taskType?: string; // 任务类型
  taskTypeList?: any[]; // 任务类型 集合
  title?: string; // 表单备注名
  tmplCode?: string; // 表单编号
  tmplId?: string; // 表单模板
  tmplName?: string; // 表单名称
  type?: string; // 审批流程记录类型
  typeList?: any[]; // 审批流程记录类型 集合
  version?: string; // 版本
}

/**
 * title: ProcessTaskDoneApproveHisResponse
 */
export interface ProcessTaskDoneApproveHisResponse {
  approveHisCreateTime?: string; // 审批流程记录创建时间
  approveHisCreateUserName?: string; // 审批流程记录创建人
  approveHisModifyTime?: string; // 审批流程记录修改时间
  approveHisModifyUserName?: string; // 审批流程记录修改人
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  businessType?: string; // 表单来源
  changeNo?: string; // 变更编号
  changeType?: string; // 变更类型
  code?: string; // 编码
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  docOutlineId?: string; // 当前表单实例关联之大纲id
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  edhrTmplVersion?: string; // edhr模板版本
  effectiveDate?: string; // 生效日期
  formType?: string; // 表单类型
  id?: string; // 主键
  materialNo?: string; // 批次/SN编号
  materialStatus?: string; // 物料形态(批次或SN)
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  nodeKey?: string; // 节点编码
  notebookId?: string; // 记录本ID
  ofCode?: string; // 单据code
  ofCreateTime?: string; // 表单创建时间
  ofCreateUserName?: string; // 单据创建人名称
  ofInstanceId?: string; // 表单实例id
  ofModifyTime?: string; // 表单更新时间
  ofModifyUserName?: string; // 单据修改人名称
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  onlineFormInstanceId?: string; // 表单实例ID
  processInstanceId?: string; // 流程实例ID
  processInstanceStatus?: string; // 流程状态: 运行中：running 已结束：finished
  productCode?: string; // 产品编码
  productFamilyCode?: string; // 产品家族编码
  productFamilyId?: string; // 产品家族id
  productFamilyName?: string; // 产品家族名称
  productId?: string; // 产品id
  productIdRbi?: string; // 产品基id
  productIdRi?: string; // 产品版本
  productName?: string; // 产品名称
  productProcessId?: string; // 产品制程id
  productProcessProductionType?: string; // 产品制程生产模式
  productSpec?: string; // 产品规格型号
  productVersion?: string; // 产品版本
  routingId?: string; // 工艺路线id
  serialNo?: string; // 表单流水号
  starterId?: string; // 发起人iD
  starterName?: string; // 发起人姓名
  status?: string; // 变更流程的状态
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务ID
  taskStartTime?: string; // 任务开始时间
  taskType?: string; // 任务类型：edhr任务：EDHR
  title?: string; // 表单备注名
  tmplCode?: string; // 表单编号
  tmplId?: string; // 表单模板
  tmplName?: string; // 表单名称
  type?: string; // 审批流程记录类型
  version?: string; // 版本
}

/**
 * title: ProcessTaskDoneResponse
 */
export interface ProcessTaskDoneResponse {
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  businessType?: string; // 表单来源
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docOutlineId?: string; // 当前表单实例关联之大纲id
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  edhrTmplVersion?: string; // edhr模板版本
  formType?: string; // 表单类型
  id?: string; // 主键
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料形态(批次或SN)
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeKey?: string; // 节点编码
  ofCode?: string; // 单据code
  ofCreateTime?: string; // 表单创建时间
  ofCreateUserName?: string; // 单据创建人名称
  ofInstanceId?: string; // 表单实例id
  ofModifyTime?: string; // 表单更新时间
  ofModifyUserName?: string; // 单据修改人名称
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  processInstanceId?: string; // 流程实例ID
  processInstanceStatus?: string; // 流程状态: 运行中：running 已结束：finished
  productCode?: string; // 产品编码
  productId?: string; // 产品id
  productName?: string; // 产品名称
  productSpec?: string; // 产品规格
  productVersion?: string; // 产品版本
  serialNo?: string; // 流水号
  starterId?: string; // 发起人iD
  starterName?: string; // 发起人姓名
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务ID
  taskStartTime?: string; // 任务开始时间
  taskType?: string; // 任务类型：edhr任务：EDHR
  title?: string; // 表单任务名称
}

/**
 * title: ProcessTaskTodoApproveHisResponse
 */
export interface ProcessTaskTodoApproveHisResponse {
  approveHisCreateTime?: string; // 审批流程记录创建时间
  approveHisCreateUserName?: string; // 审批流程记录创建人
  approveHisModifyTime?: string; // 审批流程记录修改时间
  approveHisModifyUserName?: string; // 审批流程记录修改人
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  businessType?: string; // 表单来源
  changeNo?: string; // 变更编号
  changeType?: string; // 变更类型
  code?: string; // 编码
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  docOutlineId?: string; // 当前表单实例关联之大纲id
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  edhrTmplVersion?: string; // edhr模板版本
  effectiveDate?: string; // 生效日期
  formType?: string; // 表单类型
  id?: string; // 主键
  materialNo?: string; // 批次/SN编号
  materialStatus?: string; // 物料形态(批次或SN)
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  nodeKey?: string; // 节点编码
  notebookId?: string; // 记录本ID
  ofCode?: string; // 单据code
  ofCreateTime?: string; // 表单创建时间
  ofCreateUserName?: string; // 单据创建人名称
  ofInstanceId?: string; // 表单实例id
  ofModifyTime?: string; // 表单更新时间
  ofModifyUserName?: string; // 单据修改人名称
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  onlineFormInstanceId?: string; // 表单实例ID
  processInstanceId?: string; // 流程实例ID
  processInstanceStatus?: string; // 流程状态: 运行中：running 已结束：finished
  productCode?: string; // 产品编码
  productFamilyCode?: string; // 产品家族编码
  productFamilyId?: string; // 产品家族id
  productFamilyName?: string; // 产品家族名称
  productId?: string; // 产品id
  productIdRbi?: string; // 产品基id
  productIdRi?: string; // 产品版本
  productName?: string; // 产品名称
  productProcessId?: string; // 产品制程id
  productProcessProductionType?: string; // 产品制程生产模式
  productSpec?: string; // 产品规格型号
  productVersion?: string; // 产品版本
  routingId?: string; // 工艺路线id
  serialNo?: string; // 表单流水号
  starterId?: string; // 发起人iD
  starterName?: string; // 发起人姓名
  status?: string; // 变更流程的状态
  taskId?: string; // 任务ID
  taskStartTime?: string; // 任务开始时间
  taskType?: string; // 任务类型：edhr任务：EDHR
  title?: string; // 表单备注名
  tmplCode?: string; // 表单编号
  tmplId?: string; // 表单模板
  tmplName?: string; // 表单名称
  type?: string; // 审批流程记录类型
  version?: string; // 版本
}

/**
 * title: ProcessTaskTodoResponse
 */
export interface ProcessTaskTodoResponse {
  assigneeId?: string; // 处理人ID
  assigneeName?: string; // 处理人姓名
  businessCode?: string; // 业务编号(关联其他业务数据的编号)
  businessId?: string; // 业务id(关联其他业务数据的id)
  businessType?: string; // 表单来源
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docOutlineId?: string; // 当前表单实例关联之大纲id
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  edhrTmplVersion?: string; // edhr模板版本
  formType?: string; // 表单类型
  id?: string; // 主键
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料形态(批次或SN)
  mfgOrderCode?: string; // 工单编码
  mfgOrderId?: string; // 工单ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeKey?: string; // 节点编码
  ofCode?: string; // 单据code
  ofCreateTime?: string; // 表单创建时间
  ofCreateUserName?: string; // 单据创建人名称
  ofInstanceId?: string; // 表单实例id
  ofModifyTime?: string; // 表单更新时间
  ofModifyUserName?: string; // 单据修改人名称
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  processInstanceId?: string; // 流程实例ID
  processInstanceStatus?: string; // 流程状态: 运行中：running 已结束：finished
  productCode?: string; // 产品编码
  productId?: string; // 产品id
  productName?: string; // 产品名称
  productSpec?: string; // 产品规格
  productVersion?: string; // 产品版本
  serialNo?: string; // 流水号
  starterId?: string; // 发起人iD
  starterName?: string; // 发起人姓名
  taskId?: string; // 任务ID
  taskStartTime?: string; // 任务开始时间
  taskType?: string; // 任务类型：edhr任务：EDHR
  title?: string; // 表单任务名称
}

/**
 * title: ProcessUserRequest
 */
export interface ProcessUserRequest {
  procDefVerId?: string;
  processApproveUsers?: Array<ProcessApproveUserRequest>;
  processMessageUsers?: Array<ProcessMessageUserRequest>;
}

/**
 * title: ProcessVersionRequest
 */
export interface ProcessVersionRequest {
  description?: string;
  srcId?: string; // 源版本
  version?: string; // 流程版本
}

/**
 * title: ProcessVersionResponse
 */
export interface ProcessVersionResponse {
  active?: number; // 是否激活(0 未激活,1 已激活)
  appVersionTag?: string; // $column.comments
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // 主键
  json?: string; // bpmnJson
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  processId?: string; // 流程Id
  processName?: string; // 流程名称
  version?: string; // 流程版本
  xml?: string; // bpmn
}

/**
 * title: ProductReleaseCategoryRequest
 */
export interface ProductReleaseCategoryRequest {
  fullPath?: string; // 全路径
  level?: number; // 层级
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
}

/**
 * title: ProductReleaseCategoryResponse
 */
export interface ProductReleaseCategoryResponse {
  createOrgId?: string; // 创建人部门id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  level?: number; // 层级
  modifyOrgId?: string; // 修改人部门id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentId?: string; // 父节点ID
  sortNum?: number; // 排序号
  tenantId?: string; // 租户id
}

/**
 * title: ProductReleaseFormInstanctDTO
 */
export interface ProductReleaseFormInstanctDTO {
  appId?: string;
  attachmentNumber?: number;
  bindKey?: string;
  businessId?: string;
  businessType?: string;
  categoryId?: string;
  categoryName?: string;
  completedTime?: string;
  containerSnStatus?: string;
  createTime?: string;
  createType?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string;
  dataStatus?: string;
  deleted?: number;
  description?: string;
  designerJson?: string;
  direction?: string;
  docOutlineId?: string;
  edhrInstanceId?: string;
  edhrInstanceStatus?: string;
  exceptionFlag?: boolean;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: string;
  ext6?: string;
  ext7?: string;
  ext8?: string;
  ext9?: string;
  fieldHash?: string;
  formType?: string;
  hash?: string;
  height?: number;
  id?: string;
  instanceRelationBusinessId?: string;
  instanceStatus?: string;
  materialId?: string;
  materialNo?: string;
  materialStatus?: string;
  mfgOrderCode?: string;
  modelKey?: string;
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofCode?: string;
  ofRequired?: number;
  officeType?: string;
  operation?: string;
  operator?: string;
  operatorId?: string;
  operatorRange?: string;
  paperSize?: string;
  params?: string;
  processStatus?: string;
  productName?: string;
  productionMaterialNo?: string;
  recordNo?: string;
  relatedMaterialNos?: any[];
  relationId?: string;
  resend?: number;
  runtimeJson?: string;
  runtimeJsonHash?: string;
  script?: string;
  serialNo?: string;
  sourceMaterialNo?: string;
  submitTime?: string;
  submitterId?: string;
  submitterName?: string;
  title?: string;
  tmplId?: string;
  tmplName?: string;
  tmplVersion?: string;
  txnInstId?: string;
  type?: string;
  viewType?: string;
  width?: number;
}

/**
 * title: ProductReleaseFormResponse
 */
export interface ProductReleaseFormResponse {
  instance?: OnlineFormInstanceResponse; // 表单实例
  instanceList?: Array<OnlineFormInstanceResponse>; // 表单实例
  tmpl?: OnlineFormTmplResponse; // 表单模板
}

/**
 * title: ProductReleaseResponse
 */
export interface ProductReleaseResponse {
  completedTime?: string; // 放行时间：普通表单：提交时间、流程表单：流程结束时间
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  instanceStatus?: string; // 状态:待放行：UNFILLED、RUNNING 放行中、已完成：COMPLETED
  materialNo?: string; // 批次号
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ofInstId?: string; // 放行表单实例Id(表单实例id)
  ofTmplName?: string; // 在线表单模板名称
  productId?: string; // 产品id
  productName?: string; // 产品名称
  serialNo?: string; // 流水号
}

/**
 * title: PruneFieldMetaResponse
 */
export interface PruneFieldMetaResponse {
  key?: string; // 字段key
  name?: string; // 名称
  type?: string; // 数据类型
}

/**
 * title: PublishDetailResponse
 */
export interface PublishDetailResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 内容
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  publishId?: string; // 发布id
  type?: string; // 类型：问题/日志
}

/**
 * title: PublishLogRequest
 */
export interface PublishLogRequest {
  commitId?: string; // 提交id
  commitTag?: string; // 提交标识
  description?: string; // 内容
  env?: string; // 环境
  latest?: number; // 是否最新发布
  prePublishId?: string; // 上一次发布id
  releaseTag?: string; // 发行标识
  reverted?: number; // 已回退
  state?: string; // 状态
}

/**
 * title: PublishLogResponse
 */
export interface PublishLogResponse {
  appVersion?: string; // 应用版本
  branchId?: string; // 分支id
  canCreateRelease?: boolean; // 可创建发行标记
  commitId?: string; // 提交id
  commitTag?: string; // 提交标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 内容
  env?: string; // 环境
  id?: string; // 主键
  latest?: number; // 是否最新发布
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  prePublishId?: string; // 上一次发布id
  problemList?: Array<PublishDetailResponse>; // 问题
  releaseTag?: string; // 发行标识
  reverted?: number; // 已回退
  state?: string; // 状态
  stepList?: Array<PublishDetailResponse>; // 日志
}

/**
 * title: PublishToProdRequest
 */
export interface PublishToProdRequest {
  description?: string; // 内容
  releaseTag?: string; // 发行标识
}

/**
 * title: PublishToTestRequest
 */
export interface PublishToTestRequest {
  description?: string; // 内容
}

/**
 * title: QueryForeignFieldsRequest
 */
export interface QueryForeignFieldsRequest {
  exp?: string;
  foreignFields?: any[]; // 钻取字段 ["f1.f2.f3","f4.f5"
  modelKey: string; // 模型key
  pageNo?: number;
  pageSize?: number;
  query?: object;
  sorts?: Array<Sort>;
  subModelFields?: Array<SubModelProps>; // 关联子模型
}

/**
 * title: QueryRefChainDataRequest
 */
export interface QueryRefChainDataRequest {
  dataIds?: string; // 数据id，多个的话用逗号拼接
  exp?: string; // 条件表达式
  fieldKey: string; // 引用字段 key
  keyword?: string; // rdo 查询关键字
  modelKey: string; // 模型 key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  query?: object; // 查询条件
  queryParams?: object; // 当前模型数据,当dataIds为空时，该值必传
  refModelChain: Array<ModelFieldNode>; // 模型引用链
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}

/**
 * title: QueryRefDataByIdRequest
 */
export interface QueryRefDataByIdRequest {
  fieldKey: string; // 字段 key
  id?: string; // id
  includeDeleted?: boolean; // 包含删除的数据
  modelKey: string; // 模型 key
  refModelKey?: string; // 引用的模型key
}

/**
 * title: QueryRefDataByIdsRequest
 */
export interface QueryRefDataByIdsRequest {
  fieldKey: string; // 字段 key
  ids?: any[]; // id 集合
  includeDeleted?: boolean; // 包含删除的数据
  modelKey: string; // 模型 key
  refModelKey?: string; // 引用的模型key
}

/**
 * title: QueryRefDataRequest
 */
export interface QueryRefDataRequest {
  exp?: string; // 条件表达式
  fieldKey: string; // 字段 key
  keyword?: string; // rdo 查询关键字
  modelKey: string; // 模型 key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  query?: object; // 查询条件
  refModelKey?: string; // 引用的模型key
  rmIfNoDefaultVersion?: number; // 0/1 RDO生效，若不存在默认版本,移除父数据（不传默认为 1）
  searchType?: string; // 树模型查询方式枚举 ALL(查询全部) SEARCH(搜索树)  LEVEL(返回指定层级的树结构)  CHILDREN(根据父节点查询子节点)
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}

/**
 * title: QuerySearchRefChainDataRequest
 */
export interface QuerySearchRefChainDataRequest {
  modelKey: string; // 搜索组件模型key
  nodesChain: Array<ModelFieldPair>; // 模型引用链
  pageNo?: number; // 页码
  pageSize?: number; // 条数
  query?: object; // 查询条件
  sorts?: Array<Sort>; // 排序
}

/**
 * title: RdoTreeResponse
 */
export interface RdoTreeResponse {
  baseId?: string;
  child?: Array<RdoTreeResponse>; // rdo子
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  defaulted?: number;
  deleted?: number;
  description?: string;
  draft?: number;
  id?: string;
  initCommitId?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  sysBuiltin?: number;
  version?: string;
  viewType?: string;
}

/**
 * title: ReadableCommitDetailDTO
 */
export interface ReadableCommitDetailDTO {
  opeDesc?: string; // 操作描述
  opeTime?: string; // 操作时间
  operator?: string; // 操作人
}

/**
 * title: ReassignmentRequest
 */
export interface ReassignmentRequest {
  processInstanceId?: string;
  userId?: string;
}

/**
 * title: RegexpRequest
 */
export interface RegexpRequest {
  name?: string; // 正则名称
  sysBuiltin?: number; // 是否内置
  tenantId?: string; // 租户id
  value?: string; // 正则数据
}

/**
 * title: RegexpResponse
 */
export interface RegexpResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 正则名称
  sysBuiltin?: number; // 是否内置
  tenantId?: string; // 租户id
  value?: string; // 正则数据
}

/**
 * title: RelationResponse
 */
export interface RelationResponse {
  categoryId?: string; // 分类id
  children?: Array<RelationResponse>;
  displayField?: string; // 实体模型的默认显示字段
  displayFieldName?: string; // 实体模型的默认显示字段名称
  id?: string; // 分类数据id
  key?: string; // 分类数据key
  modelKey?: string; // 模型key
  name?: string; // 分类数据名称
  sortNum?: number; // 排序
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  sysBuiltin?: number; // 是否系统内置
  type?: string; // 分类数据类型
}

/**
 * title: Report
 */
export interface Report {
  categoryId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  designerJson?: string;
  draft?: number;
  id?: string;
  initCommitId?: string;
  key?: string;
  modelKey?: string;
  modelType?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  publish?: number;
  reportType?: string;
  runtimeJson?: string;
  screenShoot?: string;
  source?: string;
  sysBuiltin?: number;
  type?: string;
  userIds?: any[];
  visibleRange?: string;
}

/**
 * title: ReportConditionDTO
 */
export interface ReportConditionDTO {
  exp?: string;
  foreignFields?: any[];
  groupItems?: Array<GroupItem>;
  modelCategory?: string;
  modelKey?: string;
  pageNo?: number;
  pageSize?: number;
  query?: object;
  selectItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
  type?: string;
}

/**
 * title: ReportDataSetConditionDTO
 */
export interface ReportDataSetConditionDTO {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  fieldConfig?: ReportFieldConfig;
  id?: string;
  joinConfig?: ReportJoinConfig;
  key?: string;
  links?: string;
  modelConfig?: ReportDataSetModelConfig;
  models?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  pageNo?: number;
  pageSize?: number;
}

/**
 * title: ReportDataSetModel
 */
export interface ReportDataSetModel {
  fields?: Array<ModelFieldInfo>; // 字段信息
  modelKey?: string; // 所属模型Key
  modelName?: string; // 所属模型名称
  modelType?: string; // 所属模型类型
}

/**
 * title: ReportDataSetModelConfig
 */
export interface ReportDataSetModelConfig {
  modelConfig?: Array<ReportDataSetModel>;
}

/**
 * title: ReportDataSetRequest
 */
export interface ReportDataSetRequest {
  description?: string; // 描述
  fieldConfig?: ReportFieldConfig;
  filterConfig?: FilterConfig;
  id?: string;
  joinConfig?: ReportJoinConfig;
  key?: string; // 数据集Key
  links?: string;
  modelConfig?: ReportDataSetModelConfig;
  models?: string;
  name?: string; // 数据集名称
}

/**
 * title: ReportDataSetResponse
 */
export interface ReportDataSetResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  fieldConfig?: ReportFieldConfig;
  id?: string; // 主键
  joinConfig?: ReportJoinConfig;
  key?: string; // 数据集Key
  links?: string;
  modelConfig?: ReportDataSetModelConfig;
  models?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 数据集名称
}

/**
 * title: ReportFieldConfig
 */
export interface ReportFieldConfig {
  fields?: Array<ModelFieldInfo>;
}

/**
 * title: ReportJoinConfig
 */
export interface ReportJoinConfig {
  joins?: Array<ReportSingleJoin>;
  mainModelKey?: string;
  mainModelName?: string;
  mainModelType?: string;
}

/**
 * title: ReportRequest
 */
export interface ReportRequest {
  categoryId?: string;
  description?: string; // 备注
  designerJson?: string; // 设计json
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  id?: string;
  initCommitId?: string; // 初始提交 id
  key?: string; // 报表key
  modelKey?: string;
  modelType?: string;
  name?: string; // 报表名称
  pageNo?: number;
  pageSize?: number;
  publish?: number; // 是否已发布
  reportType?: string;
  runtimeJson?: string; // 运行时json
  screenShoot?: string; // 缩略图
  source?: string; // 来源(前台/后台)
  sysBuiltin?: number; // 是否内置(1:内置菜单,0:用户创建)
  type?: string; // 报表前台后台
  visibleRange?: string; // 可见范围
}

/**
 * title: ReportResponse
 */
export interface ReportResponse {
  categoryId?: string; // 分类id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string; // 备注
  designerJson?: string; // 设计json
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  id?: string; // ID
  initCommitId?: string; // 初始提交 id
  key?: string; // 报表key
  modelKey?: string;
  modelType?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 报表名称
  publish?: number; // 是否已发布
  reportType?: string; // 分类id
  runtimeJson?: string; // 运行时json
  screenShoot?: string; // 缩略图
  source?: string; // 来源(前台/后台)
  sysBuiltin?: number; // 是否内置(1:内置菜单,0:用户创建)
  type?: string; // 报表类型
  userRoleGroupMap?: Array<ExchangeUserRange>; // 兑换的人员/角色/部门信息
  visibleRange?: string; // 可见范围
}

/**
 * title: ReportSingleJoin
 */
export interface ReportSingleJoin {
  alias?: string;
  leftFilterConfig?: FilterConfig;
  modelKey?: string;
  modelName?: string;
  modelType?: string;
  onExpressions?: Array<JoinOnExp>;
  rightFilterConfig?: FilterConfig;
  sourceModelKey?: string;
  sourceModelName?: string;
  sourceModelType?: string;
  type?: string;
}

/**
 * title: Resource
 */
export interface Resource {
  description?: string;
  file?: file;
  filename?: string;
  inputStream?: InputStream;
  open?: boolean;
  readable?: boolean;
  uri?: string;
  url?: string;
}

/**
 * title: ResponseEntity
 */
export interface ResponseEntity {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ApiInfo»
 */
export interface ResponseEntityApiInfo {
  code: number; // 执行结果状态码
  data?: ApiInfo; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppBranchResponse»
 */
export interface ResponseEntityAppBranchResponse {
  code: number; // 执行结果状态码
  data?: AppBranchResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppEditStatusResponse»
 */
export interface ResponseEntityAppEditStatusResponse {
  code: number; // 执行结果状态码
  data?: AppEditStatusResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppGrantedStatisticDTO»
 */
export interface ResponseEntityAppGrantedStatisticDTO {
  code: number; // 执行结果状态码
  data?: AppGrantedStatisticDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppPublishLogResponse»
 */
export interface ResponseEntityAppPublishLogResponse {
  code: number; // 执行结果状态码
  data?: AppPublishLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ApprovalLogResponse»
 */
export interface ResponseEntityApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: ApprovalLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AuditLogResponse»
 */
export interface ResponseEntityAuditLogResponse {
  code: number; // 执行结果状态码
  data?: AuditLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BasicConfigResponse»
 */
export interface ResponseEntityBasicConfigResponse {
  code: number; // 执行结果状态码
  data?: BasicConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BizEventResponse»
 */
export interface ResponseEntityBizEventResponse {
  code: number; // 执行结果状态码
  data?: BizEventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BizServiceResponse»
 */
export interface ResponseEntityBizServiceResponse {
  code: number; // 执行结果状态码
  data?: BizServiceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CategoryRelationResponse»
 */
export interface ResponseEntityCategoryRelationResponse {
  code: number; // 执行结果状态码
  data?: CategoryRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CategoryResponse»
 */
export interface ResponseEntityCategoryResponse {
  code: number; // 执行结果状态码
  data?: CategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CommitLogResponse»
 */
export interface ResponseEntityCommitLogResponse {
  code: number; // 执行结果状态码
  data?: CommitLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CommonInfoCardResponse»
 */
export interface ResponseEntityCommonInfoCardResponse {
  code: number; // 执行结果状态码
  data?: CommonInfoCardResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ControlConfigResponse»
 */
export interface ResponseEntityControlConfigResponse {
  code: number; // 执行结果状态码
  data?: ControlConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CreateImportAppResponse»
 */
export interface ResponseEntityCreateImportAppResponse {
  code: number; // 执行结果状态码
  data?: CreateImportAppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CustomerComplaintResponse»
 */
export interface ResponseEntityCustomerComplaintResponse {
  code: number; // 执行结果状态码
  data?: CustomerComplaintResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DashboardResponse»
 */
export interface ResponseEntityDashboardResponse {
  code: number; // 执行结果状态码
  data?: DashboardResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DataModelResponse»
 */
export interface ResponseEntityDataModelResponse {
  code: number; // 执行结果状态码
  data?: DataModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DataSourceProperties»
 */
export interface ResponseEntityDataSourceProperties {
  code: number; // 执行结果状态码
  data?: DataSourceProperties; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DataTraceResponse»
 */
export interface ResponseEntityDataTraceResponse {
  code: number; // 执行结果状态码
  data?: DataTraceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocControlProcessResponse»
 */
export interface ResponseEntityDocControlProcessResponse {
  code: number; // 执行结果状态码
  data?: DocControlProcessResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocControlStartedResponse»
 */
export interface ResponseEntityDocControlStartedResponse {
  code: number; // 执行结果状态码
  data?: DocControlStartedResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocControlTaskDoneResponse»
 */
export interface ResponseEntityDocControlTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: DocControlTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocControlTaskTodoResponse»
 */
export interface ResponseEntityDocControlTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: DocControlTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocOutlineResponse»
 */
export interface ResponseEntityDocOutlineResponse {
  code: number; // 执行结果状态码
  data?: DocOutlineResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DocumentResponse»
 */
export interface ResponseEntityDocumentResponse {
  code: number; // 执行结果状态码
  data?: DocumentResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EdhrCategoryResponse»
 */
export interface ResponseEntityEdhrCategoryResponse {
  code: number; // 执行结果状态码
  data?: EdhrCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EdhrCirculationFormModelMetaResponse»
 */
export interface ResponseEntityEdhrCirculationFormModelMetaResponse {
  code: number; // 执行结果状态码
  data?: EdhrCirculationFormModelMetaResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EdhrInstanceResponse»
 */
export interface ResponseEntityEdhrInstanceResponse {
  code: number; // 执行结果状态码
  data?: EdhrInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EdhrSummaryTraceEntity»
 */
export interface ResponseEntityEdhrSummaryTraceEntity {
  code: number; // 执行结果状态码
  data?: EdhrSummaryTraceEntity; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EdhrTmplResponse»
 */
export interface ResponseEntityEdhrTmplResponse {
  code: number; // 执行结果状态码
  data?: EdhrTmplResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EnumModelFieldResponse»
 */
export interface ResponseEntityEnumModelFieldResponse {
  code: number; // 执行结果状态码
  data?: EnumModelFieldResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EnumModelResponse»
 */
export interface ResponseEntityEnumModelResponse {
  code: number; // 执行结果状态码
  data?: EnumModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EventLogResponse»
 */
export interface ResponseEntityEventLogResponse {
  code: number; // 执行结果状态码
  data?: EventLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«EventResponse»
 */
export interface ResponseEntityEventResponse {
  code: number; // 执行结果状态码
  data?: EventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ExcelTmplResponse»
 */
export interface ResponseEntityExcelTmplResponse {
  code: number; // 执行结果状态码
  data?: ExcelTmplResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ExcelValidateResponse»
 */
export interface ResponseEntityExcelValidateResponse {
  code: number; // 执行结果状态码
  data?: ExcelValidateResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FieldMetaDTO»
 */
export interface ResponseEntityFieldMetaDTO {
  code: number; // 执行结果状态码
  data?: FieldMetaDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FormInstLockResponse»
 */
export interface ResponseEntityFormInstLockResponse {
  code: number; // 执行结果状态码
  data?: FormInstLockResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FormRelateDTO»
 */
export interface ResponseEntityFormRelateDTO {
  code: number; // 执行结果状态码
  data?: FormRelateDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«GetAppResponse»
 */
export interface ResponseEntityGetAppResponse {
  code: number; // 执行结果状态码
  data?: GetAppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«GlobalMethodResponse»
 */
export interface ResponseEntityGlobalMethodResponse {
  code: number; // 执行结果状态码
  data?: GlobalMethodResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ImportModelData»
 */
export interface ResponseEntityImportModelData {
  code: number; // 执行结果状态码
  data?: ImportModelData; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ImportReportResponse»
 */
export interface ResponseEntityImportReportResponse {
  code: number; // 执行结果状态码
  data?: ImportReportResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ImportResponse»
 */
export interface ResponseEntityImportResponse {
  code: number; // 执行结果状态码
  data?: ImportResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«InspectionCategoryResponse»
 */
export interface ResponseEntityInspectionCategoryResponse {
  code: number; // 执行结果状态码
  data?: InspectionCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«InstanceRelationResponse»
 */
export interface ResponseEntityInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: InstanceRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«JobLogResponse»
 */
export interface ResponseEntityJobLogResponse {
  code: number; // 执行结果状态码
  data?: JobLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«JobResponse»
 */
export interface ResponseEntityJobResponse {
  code: number; // 执行结果状态码
  data?: JobResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«LabelLogResponse»
 */
export interface ResponseEntityLabelLogResponse {
  code: number; // 执行结果状态码
  data?: LabelLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«LabelResponse»
 */
export interface ResponseEntityLabelResponse {
  code: number; // 执行结果状态码
  data?: LabelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«LinkedHashMap«string,List«Report»»»
 */
export interface ResponseEntityLinkedHashMapstringListReport {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ApiInfo»»
 */
export interface ResponseEntityListApiInfo {
  code: number; // 执行结果状态码
  data?: Array<ApiInfo>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppBranchResponse»»
 */
export interface ResponseEntityListAppBranchResponse {
  code: number; // 执行结果状态码
  data?: Array<AppBranchResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppGlobalSettingsResponse»»
 */
export interface ResponseEntityListAppGlobalSettingsResponse {
  code: number; // 执行结果状态码
  data?: Array<AppGlobalSettingsResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppPublishLogResponse»»
 */
export interface ResponseEntityListAppPublishLogResponse {
  code: number; // 执行结果状态码
  data?: Array<AppPublishLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ApprovalLogResponse»»
 */
export interface ResponseEntityListApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: Array<ApprovalLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«BizEventResponse»»
 */
export interface ResponseEntityListBizEventResponse {
  code: number; // 执行结果状态码
  data?: Array<BizEventResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«BizServiceMeta»»
 */
export interface ResponseEntityListBizServiceMeta {
  code: number; // 执行结果状态码
  data?: Array<BizServiceMeta>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CategoryCompleteResponse»»
 */
export interface ResponseEntityListCategoryCompleteResponse {
  code: number; // 执行结果状态码
  data?: Array<CategoryCompleteResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CategoryCompleteVO»»
 */
export interface ResponseEntityListCategoryCompleteVO {
  code: number; // 执行结果状态码
  data?: Array<CategoryCompleteVO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CategoryRdoRelationResponse»»
 */
export interface ResponseEntityListCategoryRdoRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<CategoryRdoRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CategoryRelationResponse»»
 */
export interface ResponseEntityListCategoryRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<CategoryRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CategoryResponse»»
 */
export interface ResponseEntityListCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<CategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ChildEdhrInstanceRelationDTO»»
 */
export interface ResponseEntityListChildEdhrInstanceRelationDTO {
  code: number; // 执行结果状态码
  data?: Array<ChildEdhrInstanceRelationDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ClientsDto»»
 */
export interface ResponseEntityListClientsDto {
  code: number; // 执行结果状态码
  data?: Array<ClientsDto>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CommitLogResponse»»
 */
export interface ResponseEntityListCommitLogResponse {
  code: number; // 执行结果状态码
  data?: Array<CommitLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CommonInfoCardResponse»»
 */
export interface ResponseEntityListCommonInfoCardResponse {
  code: number; // 执行结果状态码
  data?: Array<CommonInfoCardResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ControlConfigResponse»»
 */
export interface ResponseEntityListControlConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<ControlConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«CustomerComplaintResponse»»
 */
export interface ResponseEntityListCustomerComplaintResponse {
  code: number; // 执行结果状态码
  data?: Array<CustomerComplaintResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DashboardResponse»»
 */
export interface ResponseEntityListDashboardResponse {
  code: number; // 执行结果状态码
  data?: Array<DashboardResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DataModelResponse»»
 */
export interface ResponseEntityListDataModelResponse {
  code: number; // 执行结果状态码
  data?: Array<DataModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DataTraceResponse»»
 */
export interface ResponseEntityListDataTraceResponse {
  code: number; // 执行结果状态码
  data?: Array<DataTraceResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DigitsFieldDTO»»
 */
export interface ResponseEntityListDigitsFieldDTO {
  code: number; // 执行结果状态码
  data?: Array<DigitsFieldDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocControlCategoryCompleteVO»»
 */
export interface ResponseEntityListDocControlCategoryCompleteVO {
  code: number; // 执行结果状态码
  data?: Array<DocControlCategoryCompleteVO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocControlStartedResponse»»
 */
export interface ResponseEntityListDocControlStartedResponse {
  code: number; // 执行结果状态码
  data?: Array<DocControlStartedResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocControlTaskDoneResponse»»
 */
export interface ResponseEntityListDocControlTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: Array<DocControlTaskDoneResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocControlTaskTodoResponse»»
 */
export interface ResponseEntityListDocControlTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: Array<DocControlTaskTodoResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocOutlineBase»»
 */
export interface ResponseEntityListDocOutlineBase {
  code: number; // 执行结果状态码
  data?: Array<DocOutlineBase>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocOutlineResponse»»
 */
export interface ResponseEntityListDocOutlineResponse {
  code: number; // 执行结果状态码
  data?: Array<DocOutlineResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DocumentResponse»»
 */
export interface ResponseEntityListDocumentResponse {
  code: number; // 执行结果状态码
  data?: Array<DocumentResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EdhrCategoryResponse»»
 */
export interface ResponseEntityListEdhrCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<EdhrCategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EdhrCirculationFormModelMetaResponse»»
 */
export interface ResponseEntityListEdhrCirculationFormModelMetaResponse {
  code: number; // 执行结果状态码
  data?: Array<EdhrCirculationFormModelMetaResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EdhrInstanceSearchHistoryResponse»»
 */
export interface ResponseEntityListEdhrInstanceSearchHistoryResponse {
  code: number; // 执行结果状态码
  data?: Array<EdhrInstanceSearchHistoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EdhrLogEntity»»
 */
export interface ResponseEntityListEdhrLogEntity {
  code: number; // 执行结果状态码
  data?: Array<EdhrLogEntity>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EdhrTmplResponse»»
 */
export interface ResponseEntityListEdhrTmplResponse {
  code: number; // 执行结果状态码
  data?: Array<EdhrTmplResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ElementInfoResponse»»
 */
export interface ResponseEntityListElementInfoResponse {
  code: number; // 执行结果状态码
  data?: Array<ElementInfoResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EnumModelFieldResponse»»
 */
export interface ResponseEntityListEnumModelFieldResponse {
  code: number; // 执行结果状态码
  data?: Array<EnumModelFieldResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EnumModelResponse»»
 */
export interface ResponseEntityListEnumModelResponse {
  code: number; // 执行结果状态码
  data?: Array<EnumModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EventLogResponse»»
 */
export interface ResponseEntityListEventLogResponse {
  code: number; // 执行结果状态码
  data?: Array<EventLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«EventResponse»»
 */
export interface ResponseEntityListEventResponse {
  code: number; // 执行结果状态码
  data?: Array<EventResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ExcelTmplResponse»»
 */
export interface ResponseEntityListExcelTmplResponse {
  code: number; // 执行结果状态码
  data?: Array<ExcelTmplResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FieldMetaDTO»»
 */
export interface ResponseEntityListFieldMetaDTO {
  code: number; // 执行结果状态码
  data?: Array<FieldMetaDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FieldMetaResponse»»
 */
export interface ResponseEntityListFieldMetaResponse {
  code: number; // 执行结果状态码
  data?: Array<FieldMetaResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FieldMeta»»
 */
export interface ResponseEntityListFieldMeta {
  code: number; // 执行结果状态码
  data?: Array<FieldMeta>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FileResourceResponse»»
 */
export interface ResponseEntityListFileResourceResponse {
  code: number; // 执行结果状态码
  data?: Array<FileResourceResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FontConfig»»
 */
export interface ResponseEntityListFontConfig {
  code: number; // 执行结果状态码
  data?: Array<FontConfig>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FormRelateDTO»»
 */
export interface ResponseEntityListFormRelateDTO {
  code: number; // 执行结果状态码
  data?: Array<FormRelateDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«GlobalMethodResponse»»
 */
export interface ResponseEntityListGlobalMethodResponse {
  code: number; // 执行结果状态码
  data?: Array<GlobalMethodResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ImportReportResponse»»
 */
export interface ResponseEntityListImportReportResponse {
  code: number; // 执行结果状态码
  data?: Array<ImportReportResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«InspectionCategoryResponse»»
 */
export interface ResponseEntityListInspectionCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<InspectionCategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«InstanceRelationResponse»»
 */
export interface ResponseEntityListInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<InstanceRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«JobLogResponse»»
 */
export interface ResponseEntityListJobLogResponse {
  code: number; // 执行结果状态码
  data?: Array<JobLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«JobResponse»»
 */
export interface ResponseEntityListJobResponse {
  code: number; // 执行结果状态码
  data?: Array<JobResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«LabelLogResponse»»
 */
export interface ResponseEntityListLabelLogResponse {
  code: number; // 执行结果状态码
  data?: Array<LabelLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«LabelResponse»»
 */
export interface ResponseEntityListLabelResponse {
  code: number; // 执行结果状态码
  data?: Array<LabelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«Map«string,object»»»
 */
export interface ResponseEntityListMapstringobject {
  code: number; // 执行结果状态码
  data?: any[]; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«Map«string,string»»»
 */
export interface ResponseEntityListMapstringstring {
  code: number; // 执行结果状态码
  data?: any[]; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MenuConfigResponse»»
 */
export interface ResponseEntityListMenuConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<MenuConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MenuConfig»»
 */
export interface ResponseEntityListMenuConfig {
  code: number; // 执行结果状态码
  data?: Array<MenuConfig>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MergeLogResponse»»
 */
export interface ResponseEntityListMergeLogResponse {
  code: number; // 执行结果状态码
  data?: Array<MergeLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MessageRecordResponse»»
 */
export interface ResponseEntityListMessageRecordResponse {
  code: number; // 执行结果状态码
  data?: Array<MessageRecordResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MessageTmplResponse»»
 */
export interface ResponseEntityListMessageTmplResponse {
  code: number; // 执行结果状态码
  data?: Array<MessageTmplResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MobileHomepageResponse»»
 */
export interface ResponseEntityListMobileHomepageResponse {
  code: number; // 执行结果状态码
  data?: Array<MobileHomepageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MobilePageResponse»»
 */
export interface ResponseEntityListMobilePageResponse {
  code: number; // 执行结果状态码
  data?: Array<MobilePageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelAssociationResponse»»
 */
export interface ResponseEntityListModelAssociationResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelAssociationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelBriefInfo»»
 */
export interface ResponseEntityListModelBriefInfo {
  code: number; // 执行结果状态码
  data?: Array<ModelBriefInfo>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelCompleteResponse»»
 */
export interface ResponseEntityListModelCompleteResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelCompleteResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelFieldAgg»»
 */
export interface ResponseEntityListModelFieldAgg {
  code: number; // 执行结果状态码
  data?: Array<ModelFieldAgg>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelField»»
 */
export interface ResponseEntityListModelField {
  code: number; // 执行结果状态码
  data?: Array<ModelField>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelMetaDTO»»
 */
export interface ResponseEntityListModelMetaDTO {
  code: number; // 执行结果状态码
  data?: Array<ModelMetaDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelMetaResponse»»
 */
export interface ResponseEntityListModelMetaResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelMetaResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelMethodResponse»»
 */
export interface ResponseEntityListModelMethodResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelMethodResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelPermissionRelationResponse»»
 */
export interface ResponseEntityListModelPermissionRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelPermissionRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelReport»»
 */
export interface ResponseEntityListModelReport {
  code: number; // 执行结果状态码
  data?: Array<ModelReport>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormCategoryResponse»»
 */
export interface ResponseEntityListOnlineFormCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormCategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormChangeHistoryResponse»»
 */
export interface ResponseEntityListOnlineFormChangeHistoryResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormChangeHistoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormDataInitProtocolDTO»»
 */
export interface ResponseEntityListOnlineFormDataInitProtocolDTO {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormDataInitProtocolDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormInstanceResponse»»
 */
export interface ResponseEntityListOnlineFormInstanceResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormInstanceResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormInstance»»
 */
export interface ResponseEntityListOnlineFormInstance {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormInstance>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormLogResponse»»
 */
export interface ResponseEntityListOnlineFormLogResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormTmplLogResponse»»
 */
export interface ResponseEntityListOnlineFormTmplLogResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormTmplLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormTmplModelResponse»»
 */
export interface ResponseEntityListOnlineFormTmplModelResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormTmplModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineFormTmplResponse»»
 */
export interface ResponseEntityListOnlineFormTmplResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineFormTmplResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OnlineUserSummaryResponse»»
 */
export interface ResponseEntityListOnlineUserSummaryResponse {
  code: number; // 执行结果状态码
  data?: Array<OnlineUserSummaryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OpenapiResponse»»
 */
export interface ResponseEntityListOpenapiResponse {
  code: number; // 执行结果状态码
  data?: Array<OpenapiResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OperateTypeDTO»»
 */
export interface ResponseEntityListOperateTypeDTO {
  code: number; // 执行结果状态码
  data?: Array<OperateTypeDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OrgResponse»»
 */
export interface ResponseEntityListOrgResponse {
  code: number; // 执行结果状态码
  data?: Array<OrgResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PadPageResponse»»
 */
export interface ResponseEntityListPadPageResponse {
  code: number; // 执行结果状态码
  data?: Array<PadPageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PageDesignerLogResponse»»
 */
export interface ResponseEntityListPageDesignerLogResponse {
  code: number; // 执行结果状态码
  data?: Array<PageDesignerLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PermissionResponse»»
 */
export interface ResponseEntityListPermissionResponse {
  code: number; // 执行结果状态码
  data?: Array<PermissionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PickerOrgDTO»»
 */
export interface ResponseEntityListPickerOrgDTO {
  code: number; // 执行结果状态码
  data?: Array<PickerOrgDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PickerUserDTO»»
 */
export interface ResponseEntityListPickerUserDTO {
  code: number; // 执行结果状态码
  data?: Array<PickerUserDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintRelateDTO»»
 */
export interface ResponseEntityListPrintRelateDTO {
  code: number; // 执行结果状态码
  data?: Array<PrintRelateDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintServiceBtwTreeVO»»
 */
export interface ResponseEntityListPrintServiceBtwTreeVO {
  code: number; // 执行结果状态码
  data?: Array<PrintServiceBtwTreeVO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintServiceTreeVO»»
 */
export interface ResponseEntityListPrintServiceTreeVO {
  code: number; // 执行结果状态码
  data?: Array<PrintServiceTreeVO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessApprovalLogResponse»»
 */
export interface ResponseEntityListProcessApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessApprovalLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessApproveUserResponse»»
 */
export interface ResponseEntityListProcessApproveUserResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessApproveUserResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessDefinitionFeignResponse»»
 */
export interface ResponseEntityListProcessDefinitionFeignResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessDefinitionFeignResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessDefinitionResponse»»
 */
export interface ResponseEntityListProcessDefinitionResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessDefinitionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessDefinitionVerListResponse»»
 */
export interface ResponseEntityListProcessDefinitionVerListResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessDefinitionVerListResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessEventResponse»»
 */
export interface ResponseEntityListProcessEventResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessEventResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessGraphResponse»»
 */
export interface ResponseEntityListProcessGraphResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessGraphResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessInstanceRelationResponse»»
 */
export interface ResponseEntityListProcessInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessInstanceRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessInstanceResponse»»
 */
export interface ResponseEntityListProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessInstanceResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessMessageUserResponse»»
 */
export interface ResponseEntityListProcessMessageUserResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessMessageUserResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessNodeDefinitionResponse»»
 */
export interface ResponseEntityListProcessNodeDefinitionResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessNodeDefinitionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessPathUserResponse»»
 */
export interface ResponseEntityListProcessPathUserResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessPathUserResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessResponse»»
 */
export interface ResponseEntityListProcessResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProcessVersionResponse»»
 */
export interface ResponseEntityListProcessVersionResponse {
  code: number; // 执行结果状态码
  data?: Array<ProcessVersionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ProductReleaseCategoryResponse»»
 */
export interface ResponseEntityListProductReleaseCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<ProductReleaseCategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PublishLogResponse»»
 */
export interface ResponseEntityListPublishLogResponse {
  code: number; // 执行结果状态码
  data?: Array<PublishLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ReadableCommitDetailDTO»»
 */
export interface ResponseEntityListReadableCommitDetailDTO {
  code: number; // 执行结果状态码
  data?: Array<ReadableCommitDetailDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«RegexpResponse»»
 */
export interface ResponseEntityListRegexpResponse {
  code: number; // 执行结果状态码
  data?: Array<RegexpResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ReportDataSetResponse»»
 */
export interface ResponseEntityListReportDataSetResponse {
  code: number; // 执行结果状态码
  data?: Array<ReportDataSetResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ReportResponse»»
 */
export interface ResponseEntityListReportResponse {
  code: number; // 执行结果状态码
  data?: Array<ReportResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«RoleResponse»»
 */
export interface ResponseEntityListRoleResponse {
  code: number; // 执行结果状态码
  data?: Array<RoleResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SandboxConfigResponse»»
 */
export interface ResponseEntityListSandboxConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<SandboxConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ScriptResponse»»
 */
export interface ResponseEntityListScriptResponse {
  code: number; // 执行结果状态码
  data?: Array<ScriptResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ScriptVersionResponse»»
 */
export interface ResponseEntityListScriptVersionResponse {
  code: number; // 执行结果状态码
  data?: Array<ScriptVersionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ServiceOrchestrationResponse»»
 */
export interface ResponseEntityListServiceOrchestrationResponse {
  code: number; // 执行结果状态码
  data?: Array<ServiceOrchestrationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ServiceOrchestrationVersionLogResponse»»
 */
export interface ResponseEntityListServiceOrchestrationVersionLogResponse {
  code: number; // 执行结果状态码
  data?: Array<ServiceOrchestrationVersionLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ServiceOrchestrationVersionResponse»»
 */
export interface ResponseEntityListServiceOrchestrationVersionResponse {
  code: number; // 执行结果状态码
  data?: Array<ServiceOrchestrationVersionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SignHistoryResponse»»
 */
export interface ResponseEntityListSignHistoryResponse {
  code: number; // 执行结果状态码
  data?: Array<SignHistoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SqlViewModelResponse»»
 */
export interface ResponseEntityListSqlViewModelResponse {
  code: number; // 执行结果状态码
  data?: Array<SqlViewModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SysConfigResponse»»
 */
export interface ResponseEntityListSysConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<SysConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SystemModelMeta»»
 */
export interface ResponseEntityListSystemModelMeta {
  code: number; // 执行结果状态码
  data?: Array<SystemModelMeta>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SystemVarResponse»»
 */
export interface ResponseEntityListSystemVarResponse {
  code: number; // 执行结果状态码
  data?: Array<SystemVarResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TraceLogDetailsResponse»»
 */
export interface ResponseEntityListTraceLogDetailsResponse {
  code: number; // 执行结果状态码
  data?: Array<TraceLogDetailsResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TraceLogResponse»»
 */
export interface ResponseEntityListTraceLogResponse {
  code: number; // 执行结果状态码
  data?: Array<TraceLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TraceMainlineExtResponse»»
 */
export interface ResponseEntityListTraceMainlineExtResponse {
  code: number; // 执行结果状态码
  data?: Array<TraceMainlineExtResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TraceMainlineResponse»»
 */
export interface ResponseEntityListTraceMainlineResponse {
  code: number; // 执行结果状态码
  data?: Array<TraceMainlineResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TraceSettingResponse»»
 */
export interface ResponseEntityListTraceSettingResponse {
  code: number; // 执行结果状态码
  data?: Array<TraceSettingResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserBaseInfo»»
 */
export interface ResponseEntityListUserBaseInfo {
  code: number; // 执行结果状态码
  data?: Array<UserBaseInfo>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserBase»»
 */
export interface ResponseEntityListUserBase {
  code: number; // 执行结果状态码
  data?: Array<UserBase>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserGroupResponse»»
 */
export interface ResponseEntityListUserGroupResponse {
  code: number; // 执行结果状态码
  data?: Array<UserGroupResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserInfo»»
 */
export interface ResponseEntityListUserInfo {
  code: number; // 执行结果状态码
  data?: Array<UserInfo>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserResponse»»
 */
export interface ResponseEntityListUserResponse {
  code: number; // 执行结果状态码
  data?: Array<UserResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ViewModelResponse»»
 */
export interface ResponseEntityListViewModelResponse {
  code: number; // 执行结果状态码
  data?: Array<ViewModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«WebpageResponse»»
 */
export interface ResponseEntityListWebpageResponse {
  code: number; // 执行结果状态码
  data?: Array<WebpageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«string»»
 */
export interface ResponseEntityListstring {
  code: number; // 执行结果状态码
  data?: any[]; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«消息设置VO»»
 */
export interface ResponseEntityList消息设置VO {
  code: number; // 执行结果状态码
  data?: Array<消息设置VO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«LocalDateTime»
 */
export interface ResponseEntityLocalDateTime {
  code: number; // 执行结果状态码
  data?: string; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Map«string,object»»
 */
export interface ResponseEntityMapstringobject {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MenuConfigResponse»
 */
export interface ResponseEntityMenuConfigResponse {
  code: number; // 执行结果状态码
  data?: MenuConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MenuPermissionDTO»
 */
export interface ResponseEntityMenuPermissionDTO {
  code: number; // 执行结果状态码
  data?: MenuPermissionDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MergeLogResponse»
 */
export interface ResponseEntityMergeLogResponse {
  code: number; // 执行结果状态码
  data?: MergeLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MergePreviewResponse»
 */
export interface ResponseEntityMergePreviewResponse {
  code: number; // 执行结果状态码
  data?: MergePreviewResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MessageRecordResponse»
 */
export interface ResponseEntityMessageRecordResponse {
  code: number; // 执行结果状态码
  data?: MessageRecordResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MobileHomepageResponse»
 */
export interface ResponseEntityMobileHomepageResponse {
  code: number; // 执行结果状态码
  data?: MobileHomepageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MobilePageResponse»
 */
export interface ResponseEntityMobilePageResponse {
  code: number; // 执行结果状态码
  data?: MobilePageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelMetaDTO»
 */
export interface ResponseEntityModelMetaDTO {
  code: number; // 执行结果状态码
  data?: ModelMetaDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelMetaResponse»
 */
export interface ResponseEntityModelMetaResponse {
  code: number; // 执行结果状态码
  data?: ModelMetaResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelMethodResponse»
 */
export interface ResponseEntityModelMethodResponse {
  code: number; // 执行结果状态码
  data?: ModelMethodResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelMultiRow»
 */
export interface ResponseEntityModelMultiRow {
  code: number; // 执行结果状态码
  data?: ModelMultiRow; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelPageableRow»
 */
export interface ResponseEntityModelPageableRow {
  code: number; // 执行结果状态码
  data?: ModelPageableRow; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelPermissionRelationResponse»
 */
export interface ResponseEntityModelPermissionRelationResponse {
  code: number; // 执行结果状态码
  data?: ModelPermissionRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelSingleRow»
 */
export interface ResponseEntityModelSingleRow {
  code: number; // 执行结果状态码
  data?: ModelSingleRow; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormCategoryResponse»
 */
export interface ResponseEntityOnlineFormCategoryResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormDesignDTO»
 */
export interface ResponseEntityOnlineFormDesignDTO {
  code: number; // 执行结果状态码
  data?: OnlineFormDesignDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormInstanceRelationInfoResponse»
 */
export interface ResponseEntityOnlineFormInstanceRelationInfoResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormInstanceRelationInfoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormInstanceResponse»
 */
export interface ResponseEntityOnlineFormInstanceResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormInstanceTmplRelationResponse»
 */
export interface ResponseEntityOnlineFormInstanceTmplRelationResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormInstanceTmplRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormInstance»
 */
export interface ResponseEntityOnlineFormInstance {
  code: number; // 执行结果状态码
  data?: OnlineFormInstance; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormTmplLogResponse»
 */
export interface ResponseEntityOnlineFormTmplLogResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormTmplLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineFormTmplResponse»
 */
export interface ResponseEntityOnlineFormTmplResponse {
  code: number; // 执行结果状态码
  data?: OnlineFormTmplResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineUserSummaryResponse»
 */
export interface ResponseEntityOnlineUserSummaryResponse {
  code: number; // 执行结果状态码
  data?: OnlineUserSummaryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OnlineUserSummary»
 */
export interface ResponseEntityOnlineUserSummary {
  code: number; // 执行结果状态码
  data?: OnlineUserSummary; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OpenapiResponse»
 */
export interface ResponseEntityOpenapiResponse {
  code: number; // 执行结果状态码
  data?: OpenapiResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OrgResponse»
 */
export interface ResponseEntityOrgResponse {
  code: number; // 执行结果状态码
  data?: OrgResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OrgUserResponse»
 */
export interface ResponseEntityOrgUserResponse {
  code: number; // 执行结果状态码
  data?: OrgUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PadPageResponse»
 */
export interface ResponseEntityPadPageResponse {
  code: number; // 执行结果状态码
  data?: PadPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AppBranchResponse»»
 */
export interface ResponseEntityPageBaseAppBranchResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAppBranchResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AppPublishLogResponse»»
 */
export interface ResponseEntityPageBaseAppPublishLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAppPublishLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ApprovalLogResponse»»
 */
export interface ResponseEntityPageBaseApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseApprovalLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AuditLogResponse»»
 */
export interface ResponseEntityPageBaseAuditLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAuditLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«BizEventResponse»»
 */
export interface ResponseEntityPageBaseBizEventResponse {
  code: number; // 执行结果状态码
  data?: PageBaseBizEventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«BizServiceResponse»»
 */
export interface ResponseEntityPageBaseBizServiceResponse {
  code: number; // 执行结果状态码
  data?: PageBaseBizServiceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«CategoryRelationResponse»»
 */
export interface ResponseEntityPageBaseCategoryRelationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseCategoryRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«CategoryResponse»»
 */
export interface ResponseEntityPageBaseCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«CommitLogResponse»»
 */
export interface ResponseEntityPageBaseCommitLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseCommitLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«CommonInfoCardResponse»»
 */
export interface ResponseEntityPageBaseCommonInfoCardResponse {
  code: number; // 执行结果状态码
  data?: PageBaseCommonInfoCardResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ControlConfigResponse»»
 */
export interface ResponseEntityPageBaseControlConfigResponse {
  code: number; // 执行结果状态码
  data?: PageBaseControlConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«CustomerComplaintResponse»»
 */
export interface ResponseEntityPageBaseCustomerComplaintResponse {
  code: number; // 执行结果状态码
  data?: PageBaseCustomerComplaintResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DashboardResponse»»
 */
export interface ResponseEntityPageBaseDashboardResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDashboardResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DataModelResponse»»
 */
export interface ResponseEntityPageBaseDataModelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDataModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DataSourceDTO»»
 */
export interface ResponseEntityPageBaseDataSourceDTO {
  code: number; // 执行结果状态码
  data?: PageBaseDataSourceDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DataTraceResponse»»
 */
export interface ResponseEntityPageBaseDataTraceResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDataTraceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DesignerOperateLogResponse»»
 */
export interface ResponseEntityPageBaseDesignerOperateLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDesignerOperateLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DocControlStartedResponse»»
 */
export interface ResponseEntityPageBaseDocControlStartedResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDocControlStartedResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DocControlTaskDoneResponse»»
 */
export interface ResponseEntityPageBaseDocControlTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDocControlTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DocControlTaskTodoResponse»»
 */
export interface ResponseEntityPageBaseDocControlTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDocControlTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DocOutlineResponse»»
 */
export interface ResponseEntityPageBaseDocOutlineResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDocOutlineResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DocumentResponse»»
 */
export interface ResponseEntityPageBaseDocumentResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDocumentResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EdhrCategoryResponse»»
 */
export interface ResponseEntityPageBaseEdhrCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEdhrCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EdhrCirculationFormModelMetaResponse»»
 */
export interface ResponseEntityPageBaseEdhrCirculationFormModelMetaResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEdhrCirculationFormModelMetaResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EdhrInstanceResponse»»
 */
export interface ResponseEntityPageBaseEdhrInstanceResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEdhrInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EnumModelFieldResponse»»
 */
export interface ResponseEntityPageBaseEnumModelFieldResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEnumModelFieldResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EnumModelResponse»»
 */
export interface ResponseEntityPageBaseEnumModelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEnumModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EventLogResponse»»
 */
export interface ResponseEntityPageBaseEventLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEventLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«EventResponse»»
 */
export interface ResponseEntityPageBaseEventResponse {
  code: number; // 执行结果状态码
  data?: PageBaseEventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ExcelTmplResponse»»
 */
export interface ResponseEntityPageBaseExcelTmplResponse {
  code: number; // 执行结果状态码
  data?: PageBaseExcelTmplResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FieldMetaDTO»»
 */
export interface ResponseEntityPageBaseFieldMetaDTO {
  code: number; // 执行结果状态码
  data?: PageBaseFieldMetaDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FormRelateDTO»»
 */
export interface ResponseEntityPageBaseFormRelateDTO {
  code: number; // 执行结果状态码
  data?: PageBaseFormRelateDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FrontOperateLogResponse»»
 */
export interface ResponseEntityPageBaseFrontOperateLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseFrontOperateLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«GlobalMethodResponse»»
 */
export interface ResponseEntityPageBaseGlobalMethodResponse {
  code: number; // 执行结果状态码
  data?: PageBaseGlobalMethodResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«I18nInfoResponse»»
 */
export interface ResponseEntityPageBaseI18nInfoResponse {
  code: number; // 执行结果状态码
  data?: PageBaseI18nInfoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ImportReportResponse»»
 */
export interface ResponseEntityPageBaseImportReportResponse {
  code: number; // 执行结果状态码
  data?: PageBaseImportReportResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«InspectionCategoryResponse»»
 */
export interface ResponseEntityPageBaseInspectionCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseInspectionCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«InstanceRelationResponse»»
 */
export interface ResponseEntityPageBaseInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseInstanceRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«JobLogResponse»»
 */
export interface ResponseEntityPageBaseJobLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseJobLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«JobResponse»»
 */
export interface ResponseEntityPageBaseJobResponse {
  code: number; // 执行结果状态码
  data?: PageBaseJobResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«LabelLogResponse»»
 */
export interface ResponseEntityPageBaseLabelLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseLabelLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«LabelResponse»»
 */
export interface ResponseEntityPageBaseLabelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseLabelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MaterialNo4TaskResponse»»
 */
export interface ResponseEntityPageBaseMaterialNo4TaskResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMaterialNo4TaskResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MergeLogResponse»»
 */
export interface ResponseEntityPageBaseMergeLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMergeLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MessageRecordResponse»»
 */
export interface ResponseEntityPageBaseMessageRecordResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMessageRecordResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MessageTmplResponse»»
 */
export interface ResponseEntityPageBaseMessageTmplResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMessageTmplResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MobileHomepageResponse»»
 */
export interface ResponseEntityPageBaseMobileHomepageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMobileHomepageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«MobilePageResponse»»
 */
export interface ResponseEntityPageBaseMobilePageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMobilePageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ModelMetaResponse»»
 */
export interface ResponseEntityPageBaseModelMetaResponse {
  code: number; // 执行结果状态码
  data?: PageBaseModelMetaResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ModelMethodResponse»»
 */
export interface ResponseEntityPageBaseModelMethodResponse {
  code: number; // 执行结果状态码
  data?: PageBaseModelMethodResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ModelPermissionRelationResponse»»
 */
export interface ResponseEntityPageBaseModelPermissionRelationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseModelPermissionRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineFormCategoryResponse»»
 */
export interface ResponseEntityPageBaseOnlineFormCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineFormCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineFormInstanceResponse»»
 */
export interface ResponseEntityPageBaseOnlineFormInstanceResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineFormInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineFormModelMeta»»
 */
export interface ResponseEntityPageBaseOnlineFormModelMeta {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineFormModelMeta; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineFormTmplLogResponse»»
 */
export interface ResponseEntityPageBaseOnlineFormTmplLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineFormTmplLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineUserSummaryResponse»»
 */
export interface ResponseEntityPageBaseOnlineUserSummaryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineUserSummaryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OnlineUsersResponse»»
 */
export interface ResponseEntityPageBaseOnlineUsersResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOnlineUsersResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OpenapiResponse»»
 */
export interface ResponseEntityPageBaseOpenapiResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOpenapiResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OrgUserResponse»»
 */
export interface ResponseEntityPageBaseOrgUserResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOrgUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PadPageResponse»»
 */
export interface ResponseEntityPageBasePadPageResponse {
  code: number; // 执行结果状态码
  data?: PageBasePadPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PageDesignerLogResponse»»
 */
export interface ResponseEntityPageBasePageDesignerLogResponse {
  code: number; // 执行结果状态码
  data?: PageBasePageDesignerLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PermissionResponse»»
 */
export interface ResponseEntityPageBasePermissionResponse {
  code: number; // 执行结果状态码
  data?: PageBasePermissionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PickerUserDTO»»
 */
export interface ResponseEntityPageBasePickerUserDTO {
  code: number; // 执行结果状态码
  data?: PageBasePickerUserDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmProcessActiveVersion»»
 */
export interface ResponseEntityPageBasePmProcessActiveVersion {
  code: number; // 执行结果状态码
  data?: PageBasePmProcessActiveVersion; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PrintLogResponse»»
 */
export interface ResponseEntityPageBasePrintLogResponse {
  code: number; // 执行结果状态码
  data?: PageBasePrintLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PrintRelateDTO»»
 */
export interface ResponseEntityPageBasePrintRelateDTO {
  code: number; // 执行结果状态码
  data?: PageBasePrintRelateDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessApprovalLogResponse»»
 */
export interface ResponseEntityPageBaseProcessApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessApprovalLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessApproveUserResponse»»
 */
export interface ResponseEntityPageBaseProcessApproveUserResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessApproveUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessDefinitionResponse»»
 */
export interface ResponseEntityPageBaseProcessDefinitionResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessDefinitionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessEventResponse»»
 */
export interface ResponseEntityPageBaseProcessEventResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessEventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessInstanceRelationResponse»»
 */
export interface ResponseEntityPageBaseProcessInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessInstanceRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessInstanceResponse»»
 */
export interface ResponseEntityPageBaseProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessMessageUserResponse»»
 */
export interface ResponseEntityPageBaseProcessMessageUserResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessMessageUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessNodeDefinitionResponse»»
 */
export interface ResponseEntityPageBaseProcessNodeDefinitionResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessNodeDefinitionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessPathUserResponse»»
 */
export interface ResponseEntityPageBaseProcessPathUserResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessPathUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessTaskDoneApproveHisResponse»»
 */
export interface ResponseEntityPageBaseProcessTaskDoneApproveHisResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessTaskDoneApproveHisResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessTaskDoneResponse»»
 */
export interface ResponseEntityPageBaseProcessTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessTaskTodoApproveHisResponse»»
 */
export interface ResponseEntityPageBaseProcessTaskTodoApproveHisResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessTaskTodoApproveHisResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProcessTaskTodoResponse»»
 */
export interface ResponseEntityPageBaseProcessTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProcessTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProductReleaseCategoryResponse»»
 */
export interface ResponseEntityPageBaseProductReleaseCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProductReleaseCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ProductReleaseResponse»»
 */
export interface ResponseEntityPageBaseProductReleaseResponse {
  code: number; // 执行结果状态码
  data?: PageBaseProductReleaseResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PublishLogResponse»»
 */
export interface ResponseEntityPageBasePublishLogResponse {
  code: number; // 执行结果状态码
  data?: PageBasePublishLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«RegexpResponse»»
 */
export interface ResponseEntityPageBaseRegexpResponse {
  code: number; // 执行结果状态码
  data?: PageBaseRegexpResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ReportDataSetResponse»»
 */
export interface ResponseEntityPageBaseReportDataSetResponse {
  code: number; // 执行结果状态码
  data?: PageBaseReportDataSetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ReportResponse»»
 */
export interface ResponseEntityPageBaseReportResponse {
  code: number; // 执行结果状态码
  data?: PageBaseReportResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«RoleResponse»»
 */
export interface ResponseEntityPageBaseRoleResponse {
  code: number; // 执行结果状态码
  data?: PageBaseRoleResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SandboxConfigResponse»»
 */
export interface ResponseEntityPageBaseSandboxConfigResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSandboxConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ScriptResponse»»
 */
export interface ResponseEntityPageBaseScriptResponse {
  code: number; // 执行结果状态码
  data?: PageBaseScriptResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ScriptVersionLogResponse»»
 */
export interface ResponseEntityPageBaseScriptVersionLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseScriptVersionLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ScriptVersionResponse»»
 */
export interface ResponseEntityPageBaseScriptVersionResponse {
  code: number; // 执行结果状态码
  data?: PageBaseScriptVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ServiceOrchestrationResponse»»
 */
export interface ResponseEntityPageBaseServiceOrchestrationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseServiceOrchestrationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ServiceOrchestrationVersionLogResponse»»
 */
export interface ResponseEntityPageBaseServiceOrchestrationVersionLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseServiceOrchestrationVersionLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ServiceOrchestrationVersionResponse»»
 */
export interface ResponseEntityPageBaseServiceOrchestrationVersionResponse {
  code: number; // 执行结果状态码
  data?: PageBaseServiceOrchestrationVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SignHistoryResponse»»
 */
export interface ResponseEntityPageBaseSignHistoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSignHistoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SignLogResponse»»
 */
export interface ResponseEntityPageBaseSignLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSignLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SqlViewModelResponse»»
 */
export interface ResponseEntityPageBaseSqlViewModelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSqlViewModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SysConfigResponse»»
 */
export interface ResponseEntityPageBaseSysConfigResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSysConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«SystemVarResponse»»
 */
export interface ResponseEntityPageBaseSystemVarResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSystemVarResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TraceLogDetailsResponse»»
 */
export interface ResponseEntityPageBaseTraceLogDetailsResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTraceLogDetailsResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TraceLogResponse»»
 */
export interface ResponseEntityPageBaseTraceLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTraceLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TraceMainlineExtResponse»»
 */
export interface ResponseEntityPageBaseTraceMainlineExtResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTraceMainlineExtResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TraceMainlineResponse»»
 */
export interface ResponseEntityPageBaseTraceMainlineResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTraceMainlineResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«UserLoginLogDTO»»
 */
export interface ResponseEntityPageBaseUserLoginLogDTO {
  code: number; // 执行结果状态码
  data?: PageBaseUserLoginLogDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«UserResponse»»
 */
export interface ResponseEntityPageBaseUserResponse {
  code: number; // 执行结果状态码
  data?: PageBaseUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«UserWithUserExtraDTO»»
 */
export interface ResponseEntityPageBaseUserWithUserExtraDTO {
  code: number; // 执行结果状态码
  data?: PageBaseUserWithUserExtraDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ViewModelResponse»»
 */
export interface ResponseEntityPageBaseViewModelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseViewModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«WebpageResponse»»
 */
export interface ResponseEntityPageBaseWebpageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseWebpageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageDesignerLogResponse»
 */
export interface ResponseEntityPageDesignerLogResponse {
  code: number; // 执行结果状态码
  data?: PageDesignerLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageOccupyResponse»
 */
export interface ResponseEntityPageOccupyResponse {
  code: number; // 执行结果状态码
  data?: PageOccupyResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PermissionResponse»
 */
export interface ResponseEntityPermissionResponse {
  code: number; // 执行结果状态码
  data?: PermissionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmProcessDefinition»
 */
export interface ResponseEntityPmProcessDefinition {
  code: number; // 执行结果状态码
  data?: PmProcessDefinition; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmProcessVersion»
 */
export interface ResponseEntityPmProcessVersion {
  code: number; // 执行结果状态码
  data?: PmProcessVersion; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PrintCode»
 */
export interface ResponseEntityPrintCode {
  code: number; // 执行结果状态码
  data?: PrintCode; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PrintRelateDTO»
 */
export interface ResponseEntityPrintRelateDTO {
  code: number; // 执行结果状态码
  data?: PrintRelateDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcModelDataInfo»
 */
export interface ResponseEntityProcModelDataInfo {
  code: number; // 执行结果状态码
  data?: ProcModelDataInfo; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessApprovalLogResponse»
 */
export interface ResponseEntityProcessApprovalLogResponse {
  code: number; // 执行结果状态码
  data?: ProcessApprovalLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessApproveUserResponse»
 */
export interface ResponseEntityProcessApproveUserResponse {
  code: number; // 执行结果状态码
  data?: ProcessApproveUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessDefinitionResponse»
 */
export interface ResponseEntityProcessDefinitionResponse {
  code: number; // 执行结果状态码
  data?: ProcessDefinitionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessDefinitionVersionResponse»
 */
export interface ResponseEntityProcessDefinitionVersionResponse {
  code: number; // 执行结果状态码
  data?: ProcessDefinitionVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessEventResponse»
 */
export interface ResponseEntityProcessEventResponse {
  code: number; // 执行结果状态码
  data?: ProcessEventResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessExtension»
 */
export interface ResponseEntityProcessExtension {
  code: number; // 执行结果状态码
  data?: ProcessExtension; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessHistoryResult»
 */
export interface ResponseEntityProcessHistoryResult {
  code: number; // 执行结果状态码
  data?: ProcessHistoryResult; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessInstanceRelationResponse»
 */
export interface ResponseEntityProcessInstanceRelationResponse {
  code: number; // 执行结果状态码
  data?: ProcessInstanceRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessInstanceResponse»
 */
export interface ResponseEntityProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: ProcessInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessInstance»
 */
export interface ResponseEntityProcessInstance {
  code: number; // 执行结果状态码
  data?: ProcessInstance; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessMessageUserResponse»
 */
export interface ResponseEntityProcessMessageUserResponse {
  code: number; // 执行结果状态码
  data?: ProcessMessageUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessModelInfo»
 */
export interface ResponseEntityProcessModelInfo {
  code: number; // 执行结果状态码
  data?: ProcessModelInfo; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessNodeDefinitionResponse»
 */
export interface ResponseEntityProcessNodeDefinitionResponse {
  code: number; // 执行结果状态码
  data?: ProcessNodeDefinitionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessPathDefRelationResponse»
 */
export interface ResponseEntityProcessPathDefRelationResponse {
  code: number; // 执行结果状态码
  data?: ProcessPathDefRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessPathUserResponse»
 */
export interface ResponseEntityProcessPathUserResponse {
  code: number; // 执行结果状态码
  data?: ProcessPathUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessResponse»
 */
export interface ResponseEntityProcessResponse {
  code: number; // 执行结果状态码
  data?: ProcessResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProcessVersionResponse»
 */
export interface ResponseEntityProcessVersionResponse {
  code: number; // 执行结果状态码
  data?: ProcessVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProductReleaseCategoryResponse»
 */
export interface ResponseEntityProductReleaseCategoryResponse {
  code: number; // 执行结果状态码
  data?: ProductReleaseCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProductReleaseFormInstanctDTO»
 */
export interface ResponseEntityProductReleaseFormInstanctDTO {
  code: number; // 执行结果状态码
  data?: ProductReleaseFormInstanctDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ProductReleaseFormResponse»
 */
export interface ResponseEntityProductReleaseFormResponse {
  code: number; // 执行结果状态码
  data?: ProductReleaseFormResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PublishLogResponse»
 */
export interface ResponseEntityPublishLogResponse {
  code: number; // 执行结果状态码
  data?: PublishLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«RegexpResponse»
 */
export interface ResponseEntityRegexpResponse {
  code: number; // 执行结果状态码
  data?: RegexpResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ReportDataSetResponse»
 */
export interface ResponseEntityReportDataSetResponse {
  code: number; // 执行结果状态码
  data?: ReportDataSetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ReportResponse»
 */
export interface ResponseEntityReportResponse {
  code: number; // 执行结果状态码
  data?: ReportResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«RoleResponse»
 */
export interface ResponseEntityRoleResponse {
  code: number; // 执行结果状态码
  data?: RoleResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SandboxConfigResponse»
 */
export interface ResponseEntitySandboxConfigResponse {
  code: number; // 执行结果状态码
  data?: SandboxConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ScriptResponse»
 */
export interface ResponseEntityScriptResponse {
  code: number; // 执行结果状态码
  data?: ScriptResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ScriptVersionLogResponse»
 */
export interface ResponseEntityScriptVersionLogResponse {
  code: number; // 执行结果状态码
  data?: ScriptVersionLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ScriptVersionResponse»
 */
export interface ResponseEntityScriptVersionResponse {
  code: number; // 执行结果状态码
  data?: ScriptVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ServiceOrchestrationResponse»
 */
export interface ResponseEntityServiceOrchestrationResponse {
  code: number; // 执行结果状态码
  data?: ServiceOrchestrationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ServiceOrchestrationVersionLogResponse»
 */
export interface ResponseEntityServiceOrchestrationVersionLogResponse {
  code: number; // 执行结果状态码
  data?: ServiceOrchestrationVersionLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ServiceOrchestrationVersionResponse»
 */
export interface ResponseEntityServiceOrchestrationVersionResponse {
  code: number; // 执行结果状态码
  data?: ServiceOrchestrationVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SignHistoryResponse»
 */
export interface ResponseEntitySignHistoryResponse {
  code: number; // 执行结果状态码
  data?: SignHistoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SignatureResponse»
 */
export interface ResponseEntitySignatureResponse {
  code: number; // 执行结果状态码
  data?: SignatureResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SqlViewModelResponse»
 */
export interface ResponseEntitySqlViewModelResponse {
  code: number; // 执行结果状态码
  data?: SqlViewModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«StarterNodeOp»
 */
export interface ResponseEntityStarterNodeOp {
  code: number; // 执行结果状态码
  data?: StarterNodeOp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«StashResponse»
 */
export interface ResponseEntityStashResponse {
  code: number; // 执行结果状态码
  data?: StashResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SysConfigResponse»
 */
export interface ResponseEntitySysConfigResponse {
  code: number; // 执行结果状态码
  data?: SysConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SystemVarResponse»
 */
export interface ResponseEntitySystemVarResponse {
  code: number; // 执行结果状态码
  data?: SystemVarResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TableMetaER»
 */
export interface ResponseEntityTableMetaER {
  code: number; // 执行结果状态码
  data?: TableMetaER; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TaskNodeOp»
 */
export interface ResponseEntityTaskNodeOp {
  code: number; // 执行结果状态码
  data?: TaskNodeOp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TraceLogDetailsResponse»
 */
export interface ResponseEntityTraceLogDetailsResponse {
  code: number; // 执行结果状态码
  data?: TraceLogDetailsResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TraceLogResponse»
 */
export interface ResponseEntityTraceLogResponse {
  code: number; // 执行结果状态码
  data?: TraceLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TraceMainlineExtResponse»
 */
export interface ResponseEntityTraceMainlineExtResponse {
  code: number; // 执行结果状态码
  data?: TraceMainlineExtResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TraceMainlineResponse»
 */
export interface ResponseEntityTraceMainlineResponse {
  code: number; // 执行结果状态码
  data?: TraceMainlineResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TraceSettingResponse»
 */
export interface ResponseEntityTraceSettingResponse {
  code: number; // 执行结果状态码
  data?: TraceSettingResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserGroupResponse»
 */
export interface ResponseEntityUserGroupResponse {
  code: number; // 执行结果状态码
  data?: UserGroupResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserOfAppDTO»
 */
export interface ResponseEntityUserOfAppDTO {
  code: number; // 执行结果状态码
  data?: UserOfAppDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ViewModelFieldResponse»
 */
export interface ResponseEntityViewModelFieldResponse {
  code: number; // 执行结果状态码
  data?: ViewModelFieldResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ViewModelResponse»
 */
export interface ResponseEntityViewModelResponse {
  code: number; // 执行结果状态码
  data?: ViewModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Void»
 */
export interface ResponseEntityVoid {
  code: number; // 执行结果状态码
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«WebPageOccupyResponse»
 */
export interface ResponseEntityWebPageOccupyResponse {
  code: number; // 执行结果状态码
  data?: WebPageOccupyResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«WebpageResponse»
 */
export interface ResponseEntityWebpageResponse {
  code: number; // 执行结果状态码
  data?: WebpageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«boolean»
 */
export interface ResponseEntityboolean {
  code: number; // 执行结果状态码
  data?: boolean; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«int»
 */
export interface ResponseEntityint {
  code: number; // 执行结果状态码
  data?: number; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«long»
 */
export interface ResponseEntitylong {
  code: number; // 执行结果状态码
  data?: number; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«object»
 */
export interface ResponseEntityobject {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«string»
 */
export interface ResponseEntitystring {
  code: number; // 执行结果状态码
  data?: string; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: RevertRequest
 */
export interface RevertRequest {
  appId?: string; // 应用id
  publishId?: string; // 发布id
}

/**
 * title: RolePermissionListDTO
 */
export interface RolePermissionListDTO {
  permissionList?: Array<Permission>;
  roleId?: string; // 角色id
  terminalType?: string; // 权限分类(WEB；MOBILE:移动端)
}

/**
 * title: RolePermissionRequest
 */
export interface RolePermissionRequest {
  id?: string;
  permissionKey?: string; // 权限key
  permissionType?: string; // 权限类型(MENU:菜单；POINT:权限点)
  roleId?: string; // 角色id
  terminalType?: string; // 权限分类(WEB；MOBILE:移动端;PAD:PAD端)
}

/**
 * title: RoleRequest
 */
export interface RoleRequest {
  description?: string; // 备注
  enabled?: number; // 状态(启用 1,禁用 0)
  id?: string; // 角色id
  name?: string; // 角色名称
  type?: string; // 角色类型(BUILTIN:系统内置  USER_DEFINED:自定义)
}

/**
 * title: RoleResponse
 */
export interface RoleResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  enabled?: number; // 状态(启用 1,禁用 0)
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 角色名称
  type?: string; // 角色类型(BUILTIN:系统内置  USER_DEFINED:自定义)
}

/**
 * title: SandboxConfigRequest
 */
export interface SandboxConfigRequest {
  description?: string; // 备注
  name?: string; // 名称
  padRoutePath?: string; // Pad路由地址
  pdaRoutePath?: string; // PDA路由地址
  webRoutePath?: string; // Web路由地址
}

/**
 * title: SandboxConfigResponse
 */
export interface SandboxConfigResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  id?: string; // 主键
  mobileSync?: number; // 移动端同步数据状态
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  padRoutePath?: string; // Pad路由地址
  pdaRoutePath?: string; // PDA路由地址
  status?: string; // 沙箱状态(INIT:开始创建,CREATE_FINISHED:创建完成,CREATE_FAILED:创建失败,REMOVING:移除中)
  webRoutePath?: string; // Web路由地址
}

/**
 * title: ScriptExecuteRequest
 */
export interface ScriptExecuteRequest {
  code?: string;
  uuid?: string;
  values?: object;
}

/**
 * title: ScriptRequest
 */
export interface ScriptRequest {
  categoryId?: string; // app分类id
  content?: string; // 脚本内容
  description?: string; // JS页面描述
  key?: string; // JS页面key
  name?: string; // JS页面名称
  version?: string; // 激活版本
}

/**
 * title: ScriptResponse
 */
export interface ScriptResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // JS页面描述
  id?: string; // 主键
  key?: string; // JS页面key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // JS页面名称
  scriptVersion?: ScriptVersion; // 当前JS脚本激活版本
}

/**
 * title: ScriptVersion
 */
export interface ScriptVersion {
  active?: number;
  content?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  newLogId?: string;
  scriptKey?: string;
  version?: string;
}

/**
 * title: ScriptVersionLogRequest
 */
export interface ScriptVersionLogRequest {
  content?: string; // JS脚本数据
  scriptVersionId?: string; // JS脚本版本id
}

/**
 * title: ScriptVersionLogResponse
 */
export interface ScriptVersionLogResponse {
  content?: string; // JS脚本数据
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  scriptVersionId?: string; // JS脚本版本id
}

/**
 * title: ScriptVersionRequest
 */
export interface ScriptVersionRequest {
  active?: number; // 是否激活(0 未激活,1 已激活)
  content?: string; // JS脚本数据
  newLogId?: string; // newLogId
  scriptKey?: string; // JS脚本key
  version?: string; // JS脚本版本
}

/**
 * title: ScriptVersionResponse
 */
export interface ScriptVersionResponse {
  active?: number; // 是否激活(0 未激活,1 已激活)
  content?: string; // JS脚本数据
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  newLogId?: string; // newLogId
  scriptKey?: string; // JS脚本key
  version?: string; // JS脚本版本
}

/**
 * title: ScriptVersionSyncDTO
 */
export interface ScriptVersionSyncDTO {
  id?: string; // JS脚本版本ID
}

/**
 * title: SecurityConfig
 */
export interface SecurityConfig {
  durationHour?: number; // 用户Token 有效时长 小时
  durationMinute?: number; // 用户Token 有效时长 分钟
  earlyAlarmMinute?: number; // 提前预警分钟
  earlyAlarmSecond?: number; // 提前预警秒
  enableChangePassword?: number; // 是否启用强制修改密码(密码有效期)
  enableChangeSignPassword?: number; // 是否启用强制修改签名密码(签名密码有效期)
  enableKickOut?: number; // 登录互斥
  enableLockAccount?: number; // 是否启用账户锁定
  enablePassphrase?: number; // 是否启用密码复杂度校验
  enableSignPassword?: number; // 签名方式
  enableSingleLoginLimit?: number; // 是否启用单次登录时长校验
  enableTotalLoginDurationLimit?: number; // 是否启用累计登录时长校验
  expiryDate?: number; // 密码有效时长
  firstTimeChangePassword?: number; // 首次登录是否修改密码
  id?: string;
  inapplicablePerson?: any[]; // 不适用人员范围
  lockHourTimeout?: number; // 锁定时长(单位/时)
  lockMinTimeout?: number; // 锁定时长(单位/分)
  lockTimeout?: number; // 锁定时长(单位/秒)
  loginKickOutMode?: string; // 登录互斥方式(NONE 不开启登录互斥,SAME_END:同端登录互斥 ,DIFFERENT_END:不同端登录互斥)
  maxErrorTimes?: number; // 最大错误次数
  noOpRetainHour?: number; // 用户无操作保留小时
  noOpRetainMinute?: number; // 用户无操作保留分钟
  passMinLength?: number; // 密码最小长度
  passRule?: any[]; // 密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
  repeatNum?: number; // 登录密码-最近密码不能相同次数
  sealEnablePassphrase?: number; // 印章密码-是否启用密码复杂度校验
  sealPassMinLength?: number; // 印章密码-密码最小长度
  sealPassRule?: any[]; // 印章密码-密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
  sealRepeatNum?: number; // 印章密码-最近密码不能相同次数
  signEnablePassphrase?: number; // 签名密码-是否启用密码复杂度校验
  signExpiryDate?: number; // 签名密码-密码有效时长
  signFirstTimeChangePassword?: number; // 签名密码-首次登录是否修改密码
  signPassMinLength?: number; // 签名密码-密码最小长度
  signPassRule?: any[]; // 签名密码-密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
  signRepeatNum?: number; // 签名密码-最近密码不能相同次数
  signTimeUnit?: string; // 签名密码-密码有效时长单位(DAYS/天 ,HOURS/小时)
  singleDurationHour?: number; // 单次登录 Token 有效时长 小时
  singleDurationMinute?: number; // 单次登录Token 有效时长 分钟
  timeUnit?: string; // 密码有效时长单位(DAYS/天 ,HOURS/小时)
  totalDurationHour?: number; // 累计登录 时长 小时
  totalDurationMinute?: number; // 累计登录 时长 分钟
}

/**
 * title: SelectItem
 */
export interface SelectItem {
  alias?: string; // 别名
  distinct?: boolean; // 去重
  fieldKey?: string; // 字段key
  format?: string; // 格式化，比如yyyy-MM
  function?: string; // 函数
  includeNull?: boolean; // 空值参与计算
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  type?: string; // 数据类型
}

/**
 * title: SequencePreviewRequest
 */
export interface SequencePreviewRequest {
  placeHolders?: object;
  ruleJson?: string;
}

/**
 * title: ServiceOrchestrationRequest
 */
export interface ServiceOrchestrationRequest {
  categoryId?: string; // 分类Id
  description?: string; // 备注
  key?: string; // key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  name?: string; // 服务编排名称
  version?: string; // 激活版本
}

/**
 * title: ServiceOrchestrationResponse
 */
export interface ServiceOrchestrationResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  id?: string; // 主键
  key?: string; // key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 服务编排名称
  orchestrationVersion?: ServiceOrchestrationVersion; // 当前服务编排激活版本
}

/**
 * title: ServiceOrchestrationVersion
 */
export interface ServiceOrchestrationVersion {
  active?: number;
  content?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataJson?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  newLogId?: string;
  soKey?: string;
  version?: string;
}

/**
 * title: ServiceOrchestrationVersionLogRequest
 */
export interface ServiceOrchestrationVersionLogRequest {
  content?: string; // 备注
  dataJson?: string; // 锁定页面人员名称
  soVersionId?: string; // key
}

/**
 * title: ServiceOrchestrationVersionLogResponse
 */
export interface ServiceOrchestrationVersionLogResponse {
  content?: string; // 备注
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataJson?: string; // 锁定页面人员名称
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  soVersionId?: string; // key
}

/**
 * title: ServiceOrchestrationVersionRequest
 */
export interface ServiceOrchestrationVersionRequest {
  active?: number; // 激活状态
  content?: string; // 页面数据
  dataJson?: string; // 页面json
  newLogId?: string; // newLogId
  soKey?: string; // key
  version?: string; // 服务编排版本
}

/**
 * title: ServiceOrchestrationVersionResponse
 */
export interface ServiceOrchestrationVersionResponse {
  active?: number; // 激活状态
  content?: string; // 页面数据
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataJson?: string; // 页面json
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  newLogId?: string; // newLogId
  soKey?: string; // key
  version?: string; // 服务编排版本
}

/**
 * title: SignHistoryRequest
 */
export interface SignHistoryRequest {
  businessKey?: string; // 业务标识
  groupKey?: string; // 分组标识
  trackingId?: string; // 事务追踪id
  url?: string; // 签名图片地址
}

/**
 * title: SignHistoryResponse
 */
export interface SignHistoryResponse {
  businessKey?: string; // 业务标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullname?: string; // 姓名
  groupKey?: string; // 分组标识
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  trackingId?: string; // 事务追踪id
  url?: string; // 签名图片地址
  userId?: string; // 用户id
  username?: string; // 账号
}

/**
 * title: SignLogRequest
 */
export interface SignLogRequest {
  address?: string; // 地址
  appId?: string; // 应用
  beginCreateTime?: string; // 操作时间起
  branchId?: string; // 分支id
  createUserId?: string;
  endCreateTime?: string; // 操作时间止
  env?: string; // 环境
  eventType?: number; // 事件类型,0登出/1登录
  ip?: string; // IP
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  personal?: boolean;
  platform?: string; // 平台
  signWay?: string; // 登录/登出方式
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  source?: string; // 客户端类型,mobile手机端/pc电脑端
  tenantId?: string; // 租户Id
  userName?: string; // 账号
}

/**
 * title: SignLogResponse
 */
export interface SignLogResponse {
  address?: string; // 地址
  appId?: string; // 应用
  appName?: string; // 应用名称
  branchId?: string; // 分支id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境
  eventType?: number; // 事件类型,0登出/1登录
  id?: string; // 主键
  ip?: string; // IP
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  platform?: string; // 平台
  signWay?: string; // 登录/登出方式
  source?: string; // 客户端类型,mobile手机端/pc电脑端
  tenantId?: string; // 租户Id
  userName?: string; // 账号
}

/**
 * title: SignatureResponse
 */
export interface SignatureResponse {
  currentTime?: string; // 当前时间
  pwdOk?: boolean; // 密码是否正确
  signHistoryId?: string; // 签名历史id
  signatureImage?: string; // 签名图片
  userId?: string; // 用户id
  username?: string; // 用户名
}

/**
 * title: SimpleOnlineFormDesignDTO
 */
export interface SimpleOnlineFormDesignDTO {
  designerJson?: string; // 设计json
  direction?: string; // 方向(portrait /landscape)
  extFieldStatus?: string; // 拓展字段-模型字段启用/禁用状态json: [{key:字段key,status:true/false}]
  fieldMetaList?: Array<FieldMetaFormVO>;
  runtimeJson?: string; // 运行时json
}

/**
 * title: SimpleOnlineFormInstanceRequest
 */
export interface SimpleOnlineFormInstanceRequest {
  description?: string; // 描述
  id?: string; // 表单实例Id
}

/**
 * title: SingleField
 */
export interface SingleField {
  bindInfo?: string; // bindInfo
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  defaultValue?: DefaultValue; // 默认值
  description?: string;
  id?: string;
  key?: string; // 字段key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 字段name
  originFieldKey?: string; // 原字段key
  originFieldName?: string; // 原字段名称
  originModelKey?: string; // 原模型key
  originModelName?: string; // 原模型名称
  type?: string; // 字段类型
}

/**
 * title: SingleJoin
 */
export interface SingleJoin {
  alias?: string;
  modelKey?: string;
  modelName?: string;
  onExpressions?: Array<JoinOnExp>;
  type?: string;
}

/**
 * title: SingleRequest
 */
export interface SingleRequest {
  id?: string; // id
}

/**
 * title: Sort
 */
export interface Sort {
  format?: string;
  function?: string;
  sortField?: string;
  sortType?: string;
}

/**
 * title: SqlViewModelRequest
 */
export interface SqlViewModelRequest {
  dsKey?: string; // 数据源key
  fieldConfig?: Array<FieldColumnMapping>;
  key?: string; // 视图key
  name?: string; // 视图名称
  script?: string; // SQL脚本
}

/**
 * title: SqlViewModelResponse
 */
export interface SqlViewModelResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dsKey?: string; // 数据源key
  fieldConfig?: Array<FieldColumnMapping>;
  id?: string; // 主键
  key?: string; // 视图key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 视图名称
  script?: string; // SQL脚本
}

/**
 * title: StarterNodeOp
 */
export interface StarterNodeOp {
  mobilePageKey?: string; // 移动端页面key
  mobileViewPageKey?: string; // 移动端查看页面key
  node?: ProcessNodeDefinition; // 节点信息
  processDefId?: string; // 流程id
  webPageKey?: string; // pc端页面key
  webViewPageKey?: string; // pc端查看页面key
  withdrawOp?: boolean; // 是否可撤回
}

/**
 * title: StashRequest
 */
export interface StashRequest {
  clientKey?: string; // 客户标识
  content?: string; // 暂存内容
}

/**
 * title: StashResponse
 */
export interface StashResponse {
  clientKey?: string; // 客户标识
  content?: string; // 暂存内容
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
}

/**
 * title: SubModelProps
 */
export interface SubModelProps {
  foreignFields?: any[]; // 子表钻取字段 ["f1.f2.f3","f4.f5"
  masterFieldKey: string; // 主表的主从关联字段Key
  subModelKey: string; // 子表模型key
}

/**
 * title: SwitchBranchRequest
 */
export interface SwitchBranchRequest {
  appId?: string; // 应用id
  branchId?: string; // 分支id
}

/**
 * title: SysConfigRequest
 */
export interface SysConfigRequest {
  id?: string;
  type?: string; // 类型(BUILTIN:内置  USER_DEFINED:自定义)
  value?: string; // 配置内容
}

/**
 * title: SysConfigResponse
 */
export interface SysConfigResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 配置key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  value?: string; // 配置内容
}

/**
 * title: SystemModelMeta
 */
export interface SystemModelMeta {
  fields?: Array<FieldMeta>;
  key?: string;
  modelCategory?: string; // 模型类型
  name?: string;
}

/**
 * title: SystemVarRequest
 */
export interface SystemVarRequest {
  description?: string; // 备注
  devValue?: string; // 开发环境值
  key?: string; // 变量名称key
  prodValue?: string; // 正式环境值
  testValue?: string; // 正式环境值
}

/**
 * title: SystemVarResponse
 */
export interface SystemVarResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  devValue?: string; // 开发环境值
  id?: string; // ID
  key?: string; // 变量名称key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  prodValue?: string; // 正式环境值
  testValue?: string; // 测试环境值
}

/**
 * title: TableEdges
 */
export interface TableEdges {
  id?: string; // id 主键
  shape?: string; // 分类
  source?: string; // source id 主键
  target?: string; // target id 主键
}

/**
 * title: TableMetaBase
 */
export interface TableMetaBase {
  fieldList?: Array<FieldMetaBase>;
  modelKey?: string; // 表名key
  name?: string; // 表名
}

/**
 * title: TableMetaER
 */
export interface TableMetaER {
  edges?: Array<TableEdges>; // 表关系
  nodes?: Array<ModelMetaInfo>; // 表数据
}

/**
 * title: TaskNodeOp
 */
export interface TaskNodeOp {
  mobilePageKey?: string; // 移动端页面key
  mobileViewPageKey?: string; // 移动端查看页面key
  node?: ProcessNodeDefinition; // 节点信息
  processDefId?: string; // 流程id
  webPageKey?: string; // pc端页面key
  webViewPageKey?: string; // pc端查看页面key
}

/**
 * title: TenantUserRemoveRequest
 */
export interface TenantUserRemoveRequest {
  userIds?: any[]; // 用户id集合
}

/**
 * title: TraceLogDetailsRequest
 */
export interface TraceLogDetailsRequest {
  beginCreateTime?: string; // 操作时间起
  createUserId?: string;
  detailData?: string;
  endCreateTime?: string; // 操作时间止
  modelKey?: string; // 表名称key
  operationType?: string; // 行数据操作类型（新增 修改 删除）
  operatorName?: string; // 操作人
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  pid?: string; // 上级主键id
  recordFieldJson?: string; // 模型字段数据变更前后记录
  recordId?: string; // 表数据主键id
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  traceLogId?: string; // 建模追溯记录主表id
  triggerType?: number;
}

/**
 * title: TraceLogDetailsResponse
 */
export interface TraceLogDetailsResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  detailData?: string; // 详细数据
  id?: string; // 主键
  modelKey?: string; // 表名称key
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  operationType?: string; // 行数据操作类型（新增 修改 删除）
  operatorName?: string; // 操作人
  pid?: string; // 上级主键id
  recordFieldJson?: string; // 模型字段数据变更前后记录
  recordId?: string; // 表数据主键id
  traceLogId?: string; // 建模追溯记录主表id
  triggerType?: number; // 触发方式
  userName?: string; // 用户账号
}

/**
 * title: TraceLogRequest
 */
export interface TraceLogRequest {
  masterOperationType?: string; // 建模追溯记录类型（新增、修改、删除、新增或者修改）
  modelKey?: string; // 模型key
}

/**
 * title: TraceLogResponse
 */
export interface TraceLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  masterOperationType?: string; // 建模追溯记录类型（新增、修改、删除、新增或者修改）
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  traceId?: string; // 链路追踪id
}

/**
 * title: TraceMainlineExtRequest
 */
export interface TraceMainlineExtRequest {
  buttonConfig?: string; // 点击的按钮配置
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  nodeId?: string; // 节点名称
  nodeName?: string; // 节点名称
  ofInstanceId?: string; // 表单实例id
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  opeSeq?: string; // 操作序列号
  operation?: string; // 操作(保存/提交/审核/退回)
  operationName?: string; // 操作名称
  opinion?: string; // 审批意见
  productId?: string; // 产品id
  productName?: string; // 产品名称
  signature?: string; // 签名
  traceId?: string; // 链路追踪id
}

/**
 * title: TraceMainlineExtResponse
 */
export interface TraceMainlineExtResponse {
  buttonConfig?: string; // 点击的按钮配置
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  edhrInstanceId?: string; // edhr实例id
  edhrTmplId?: string; // edhr模板id
  edhrTmplName?: string; // edhr模板名称
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nodeId?: string; // 节点名称
  nodeName?: string; // 节点名称
  ofInstanceId?: string; // 表单实例id
  ofTmplId?: string; // 表单模板id
  ofTmplName?: string; // 表单模板名称
  opeSeq?: string; // 操作序列号
  operation?: string; // 操作(保存/提交/审核/退回)
  operationName?: string; // 操作名称
  opinion?: string; // 审批意见
  productId?: string; // 产品id
  productName?: string; // 产品名称
  signature?: string; // 签名
  traceId?: string; // 链路追踪id
}

/**
 * title: TraceMainlineRequest
 */
export interface TraceMainlineRequest {
  device?: string; // 设备
  devices?: string; // 设备列表
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料形态(LOT/SN)
  opeSeq?: string; // 操作序列号
  operation?: string; // 操作(保存/提交/审核)
  operator?: string; // 操作人
  operatorId?: string; // 操作人ID
}

/**
 * title: TraceMainlineResponse
 */
export interface TraceMainlineResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  device?: string; // 设备
  devices?: string; // 设备列表
  id?: string; // ID
  materialNo?: string; // 物料编号
  materialStatus?: string; // 物料形态(LOT/SN)
  mfgOrderId?: string; // 工单号 追溯字段
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  opeSeq?: string; // 操作序列号
  operation?: string; // 操作(保存/提交/审核)
  operator?: string; // 操作人
  operatorId?: string; // 操作人ID
  recordNo?: string; // 记录单号
  recordNos?: string; // 记录单号列表
  traceDate?: string; // 追溯日期
}

/**
 * title: TraceSettingRequest
 */
export interface TraceSettingRequest {
  checkedFields?: string; // 前端需展示记录的字段
  enable?: number; // 是否启用追溯
  level?: number; // 追溯层级
  modelKey?: string; // 模型key
}

/**
 * title: TraceSettingResponse
 */
export interface TraceSettingResponse {
  checkedFields?: string; // 前端需展示记录的字段
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  enable?: number; // 是否启用追溯
  id?: string; // 主键
  level?: number; // 追溯层级
  modelKey?: string; // 模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  treeData?: any[]; // 模型字段树
}

/**
 * title: TransferAllWorkItemRequest
 */
export interface TransferAllWorkItemRequest {
  appId?: string;
  fromUserId?: string;
  toUserId?: string;
}

/**
 * title: Triple«string,string,LocalDateTime»
 */
export interface TriplestringstringLocalDateTime {
  left?: string;
  middle?: string;
  right?: string;
}

/**
 * title: UniqueConstraint
 */
export interface UniqueConstraint {
  checkStrategy?: string;
  fieldKeys?: any[];
  type?: string;
}

/**
 * title: UpdateConstantRequest
 */
export interface UpdateConstantRequest {
  constraint?: Array<ModelConstraint>; // 模型约束
}

/**
 * title: UpdateDigitsRequest
 */
export interface UpdateDigitsRequest {
  digits?: number; // 小数位数
  fieldMetas?: Array<DigitsFieldDTO>; // 需要更新的字段
}

/**
 * title: UserBase
 */
export interface UserBase {
  email?: string;
  empNo?: string;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string;
  id?: string;
  mobile?: string;
  superAdmin?: number;
  sysBuiltin?: number;
  username?: string;
}

/**
 * title: UserBaseInfo
 */
export interface UserBaseInfo {
  avatar?: string;
  empNo?: string;
  enabled?: number;
  fullname?: string;
  id?: string;
  username?: string;
}

/**
 * title: UserGroupDragRequest
 */
export interface UserGroupDragRequest {
  id?: string; // 选中用户组id
  targetParentId?: string; // 目标位置父节点id，不传或传「ROOT」则代表根节点
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: UserGroupRelationRequest
 */
export interface UserGroupRelationRequest {
  dataRule?: string; // 数据规则
  dataRuleConfig?: string; // 数据规则配置(仅前端用)
  dataRuleEnabled?: number; // 开启数据规则
  description?: string; // 描述
  fieldPermission?: string; // 字段权限
  fieldPermissionEnabled?: number; // 开启字段权限
  operator?: string; // 数据权限关系,OR:或, AND:且
  relationId?: string; // 关系id
  relationType?: string; // 关系类型：ORG/USER/ROLE/ENTITY_MODEL_DATA/BUILT_CONDITION_MODEL/PERMISSION_SCOPE
  userGroupId?: string; // 用户组id
}

/**
 * title: UserGroupRelationResponse
 */
export interface UserGroupRelationResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataRule?: string; // 数据规则
  dataRuleConfig?: string; // 数据规则配置(仅前端用)
  dataRuleEnabled?: number; // 开启数据规则
  deleted?: number;
  description?: string; // 描述
  fieldPermission?: string; // 字段权限
  fieldPermissionEnabled?: number; // 开启字段权限
  id?: string; // 资源标识，主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  operator?: string; // 数据权限关系,OR:或, AND:且
  relationId?: string; // 关系id
  relationName?: string; // 关系名称
  relationType?: string; // 关系类型
  userGroupId?: string; // 用户组id
}

/**
 * title: UserGroupRelationSaveBatchRequest
 */
export interface UserGroupRelationSaveBatchRequest {
  relations?: Array<UserGroupRelationRequest>; // 关系列表
}

/**
 * title: UserGroupRequest
 */
export interface UserGroupRequest {
  fullPath?: string; // 节点路径
  name?: string; // 名称
  parentId?: string; // 父节点id
  sortNum?: number; // 排序序号
}

/**
 * title: UserGroupResponse
 */
export interface UserGroupResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 节点路径
  id?: string; // 资源标识，主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  parentId?: string; // 父节点id
  parentName?: string; // 父用户组名称
  sortNum?: number; // 排序序号
  userGroupRelations?: Array<UserGroupRelationResponse>;
}

/**
 * title: UserIdsDTO
 */
export interface UserIdsDTO {
  userIds?: any[]; // userIds
}

/**
 * title: UserInfo
 */
export interface UserInfo {
  avatar?: string;
  birthday?: string;
  country?: string;
  email?: string;
  empNo?: string;
  enabled?: number;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string;
  id?: string;
  managerId?: string;
  mobile?: string;
  signatureImage?: string;
  superAdmin?: number;
  telephone?: string;
  username?: string;
}

/**
 * title: UserLoginLogDTO
 */
export interface UserLoginLogDTO {
  browser?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  empNo?: string;
  fullname?: string;
  id?: string;
  ip?: string;
  loginStatus?: string;
  mobile?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  os?: string;
  source?: string;
  userAgent?: string;
  username?: string;
}

/**
 * title: UserLoginLogPageRequest
 */
export interface UserLoginLogPageRequest {
  empNo?: string; // 工号
  fullname?: string; // 姓名
  ip?: string; // ip
  loginStatus?: string; // 状态
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  username?: string; // 账号
}

/**
 * title: UserOfApp
 */
export interface UserOfApp {
  appSuperAdmin?: number; // 是否应用超管,0: 否 1: 是
  appSuperAdminRemark?: string; // 超管备注
  permissions?: any[]; // app应用的角色权限点,0: 否 1: 是
  sourceType?: string; // app来源类型
  userId?: string;
}

/**
 * title: UserOfAppDTO
 */
export interface UserOfAppDTO {
  appSuperAdmin?: number; // 是否应用超管,0: 否 1: 是
  appSuperAdminRemark?: string; // 超管备注
  permissions?: any[]; // app应用的角色权限点,0: 否 1: 是
  sourceType?: string; // app来源类型
}

/**
 * title: UserOrgRequest
 */
export interface UserOrgRequest {
  master?: number; // 是否主部门,0: 否 1: 是
  orgId?: string; // 组织结构id
  orgName?: string; // 组织结构名
  principal?: number; // 是否是部门负责人,0: 否 1: 是
}

/**
 * title: UserOrgResponse
 */
export interface UserOrgResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  master?: number; // 是否主部门,0: 否 1: 是
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  orgId?: string; // 组织id
  orgName?: string; // 组织名称
  principal?: number; // 是否是部门负责人,0: 否 1: 是
  tenantId?: string; // 租户 id
  userId?: string; // 用户id
}

/**
 * title: UserResponse
 */
export interface UserResponse {
  avatar?: string; // 头像url相对路径
  birthday?: string; // 生日
  country?: string; // 国家
  createTime?: string; // 创建时间
  createUserName?: string; // 创建人名称
  email?: string; // 邮箱
  empNo?: string; // 工号
  enabled?: number; // 启用状态，0：禁用 1：启用 2：未激活
  ext0?: string; // 扩展字段0
  ext1?: string; // 扩展字段1
  ext2?: string; // 扩展字段2
  ext3?: string; // 扩展字段3
  ext4?: string; // 扩展字段4
  ext5?: number; // 扩展字段5
  ext6?: number; // 扩展字段6
  ext7?: number; // 扩展字段7
  ext8?: number; // 扩展字段8
  ext9?: number; // 扩展字段9
  fullname?: string; // 姓名
  gender?: number; // 性别 : 0 女, 1 男, -1 保密
  id?: string; // 主键
  mobile?: string; // 手机号码
  modifyTime?: string; // 修改时间
  modifyUserId?: string; // 修改人id
  modifyUserName?: string; // 修改人名称
  platSeat?: boolean; // 平台席位 true勾选
  signType?: string; // 签名类型
  signatureImage?: string; // 签名照片url相对路径
  signatureImageWrite?: string; // 签名手写路径
  suiteSeat?: boolean; // 套件席位 (true 选中,false 未选中)
  telephone?: string; // 座机号码
  tenantList?: Array<UserTenantDTO>; // 所属租户列表
  tenantName?: string; // 租户名称
  tenantNames?: string; // 所属租户名称，多个用逗号拼接
  userOrgList?: Array<UserOrgResponse>; // 部门列表
  username?: string; // 账号
}

/**
 * title: UserSaveRequest
 */
export interface UserSaveRequest {
  avatar?: string; // 头像
  birthday?: string; // 生日
  country?: string; // 国家区号
  email?: string; // 邮箱
  empNo?: string; // 工号
  enabled?: number;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string; // 姓名
  gender?: number; // 性别
  id?: string;
  mobile?: string; // 手机号
  password?: string; // 密码
  platSeat?: boolean; // 平台席位
  signPassword?: string;
  signType?: string; // 签名方式
  signatureImage?: string; // 签名照片
  signatureImageWrite?: string; // 签名手写图片相对路径
  suiteSeat?: boolean; // 套件席位
  telephone?: string; // 座机号码
  userId?: string;
  username?: string; // 账号
}

/**
 * title: UserTenantDTO
 */
export interface UserTenantDTO {
  duty?: string; // 职务
  enabled?: number; // 是否启用
  id?: string; // 租户ID
  latestLogin?: number; // 是否最后登录租户，0：否 1：是
  managerId?: string; // 直属上级id
  managerName?: string; // 直属上级名称
  name?: string; // 租户名称
  orgNames?: string; // 所在部门，多个用逗号拼接
  userId?: string; // 用户ID
  userOrgList?: Array<UserOrgResponse>;
}

/**
 * title: UserWithUserExtraDTO
 */
export interface UserWithUserExtraDTO {
  avatar?: string;
  birthday?: string;
  code?: string;
  country?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  duty?: string;
  email?: string;
  empNo?: string;
  enabled?: number;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
  fullname?: string;
  gender?: number;
  id?: string;
  managerId?: string;
  mobile?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  nameDuplicate?: boolean;
  orgNames?: string;
  passModifyTime?: string;
  password?: string;
  platActiveTimestamp?: number;
  platSeat?: boolean;
  platTicket?: string;
  signPassword?: string;
  signType?: string;
  signatureImage?: string;
  signatureImageWrite?: string;
  suiteActiveTimestamp?: number;
  suiteSeat?: boolean;
  suiteTicket?: string;
  superAdmin?: number;
  sysBuiltin?: number;
  telephone?: string;
  tenantId?: string;
  tenantList?: Array<UserTenantDTO>;
  tenantName?: string;
  tenantNames?: string;
  username?: string;
}

/**
 * title: VersionActive
 */
export interface VersionActive {
  id?: string; // 要激活的版本
  scriptKey?: string; // JS脚本Key/服务编排key
}

/**
 * title: ViewModelFieldResponse
 */
export interface ViewModelFieldResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 视图描述
  fieldConfigMap?: object; // 字段配置
  filterConfig?: FilterConfig; // 过滤条件配置
  id?: string; // 主键
  joinConfig?: JoinConfig; // 连接配置
  key?: string; // 视图key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 视图名称
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  type?: string; // 视图类型
}

/**
 * title: ViewModelRequest
 */
export interface ViewModelRequest {
  categoryId?: string; // 分类id
  description?: string; // 视图描述
  fieldConfig?: FieldConfig; // 字段配置
  filterConfig?: FilterConfig; // 过滤条件配置
  joinConfig?: JoinConfig; // 连接配置
  key?: string; // 视图key
  name?: string; // 视图名称
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  type?: string; // 视图类型
}

/**
 * title: ViewModelResponse
 */
export interface ViewModelResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 视图描述
  fieldConfig?: FieldConfig; // 字段配置
  filterConfig?: FilterConfig; // 过滤条件配置
  id?: string; // 主键
  joinConfig?: JoinConfig; // 连接配置
  key?: string; // 视图key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 视图名称
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  type?: string; // 视图类型
}

/**
 * title: WebPageLockRequest
 */
export interface WebPageLockRequest {
  id?: string; // 页面key
  userId?: string; // 解除占用的用户id（mqtt遗嘱消息体中必传）
}

/**
 * title: WebPageOccupyResponse
 */
export interface WebPageOccupyResponse {
  cacheNum?: number; // 占用缓存时间（单位：秒）
  id?: string; // 主键
  occupyId?: string; // 占用人id
  occupyName?: string; // 占用人名称
  querySpanNum?: number; // 心跳查询间隔（单位：秒）
}

/**
 * title: WebhookRequest
 */
export interface WebhookRequest {
  body?: string; // body: 转成json string给后端
  headerParameters?: object; // 头部参数
  httpMethod?: string; // 请求方式：GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE
  path?: string; // webhook请求uri
  queryParameters?: object; // query参数
  uriParameters?: object; //  uri-参数
}

/**
 * title: WebpageDesignerJsonRequest
 */
export interface WebpageDesignerJsonRequest {
  designerJson?: string; // 页面设计json
  logId?: string; // logId
  runtimeJson?: string; // 运行时json
}

/**
 * title: WebpageRequest
 */
export interface WebpageRequest {
  categoryId?: string; // 分类id
  description?: string; // 页面描述
  key?: string; // 页面key
  name?: string; // 页面名称
  newLogId?: string; // newLogId
}

/**
 * title: WebpageResponse
 */
export interface WebpageResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 页面描述
  designerJson?: string; // 页面设计json
  id?: string; // 主键
  key?: string; // 页面key
  lockUserId?: string; // 锁定页面人员id
  lockUserName?: string; // 锁定页面人员名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  newLogId?: string; // newLogId
  runtimeJson?: string; // 运行时json
}

/**
 * title: XmlSetting
 */
export interface XmlSetting {
  categoryRelationId?: string;
  tableColumn?: Array<XmlSettingTableColum>;
  tableName?: string;
  tableNameRemarks?: string;
  tableType?: string;
}

/**
 * title: XmlSettingTableColum
 */
export interface XmlSettingTableColum {
  key?: string;
  liquibaseType?: string;
  mappingType?: string;
  name?: string;
  required?: number;
  type?: string;
}

/**
 * title: modelDataAssociationRequest
 */
export interface modelDataAssociationRequest {
  fieldKey?: string; // fieldKey
  fieldType?: string; // fieldType
  id?: string; // 数据id
  modelKey?: string; // modelKey
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
}

/**
 * title: 发送消息DTO
 */
export interface 发送消息DTO {
  content?: string; // 邮件内容
  id?: string;
  receiveUserId?: string; // 接收人Id , 多个人员id用英文逗号隔开
  title?: string; // 邮件标题
  type: string; // 目标客户端类型枚举 email 邮箱 dingtalk 钉钉 wecom 企业微信 feishu 飞书 system 站内信
}

/**
 * title: 消息设置VO
 */
export interface 消息设置VO {
  agentid?: string; // 微信、钉钉应用标识
  appkey?: string; // 钉钉企业内部应用标识
  corpid?: string; // 飞书、微信、钉钉企业id
  id?: string; // id
  key?: string; // key
  name?: string; // 名称
  password?: string; // 密码
  remark?: string; // 备注
  secret?: string; // 飞书、微信、钉钉应用密钥
  sendEmail?: string; // 发送者邮箱
  serviceIp?: string; // 主机地址ip
  serviceType?: string; // 服务类型
  ssl?: number; // 是否启用ssl
  timeout?: number; // 是否启用ssl
  type?: string; // 消息分类
  userName?: string; // 账户
}
