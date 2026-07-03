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
  requestBaseTitle?: Array<string>;
  requestBody?: Array<Parameter>;
  requestBodyExample?: string;
  requestBodyTitle?: Array<string>;
  requestHeader?: Array<Parameter>;
  requestHeaderTitle?: Array<string>;
  responseBody?: Array<Parameter>;
  responseBodyExample?: string;
  responseBodyTitle?: Array<string>;
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
  appVersion?: string; // 应用版本
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  head?: number; // 当前分支
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  releasable?: number; // 可发行
  seq?: number; // 序号
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
  type?: string; // 类型：模态框/变量/事件
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
 * title: CategoryCompleteResponse
 */
export interface CategoryCompleteResponse {
  children?: Array<RelationResponse>;
  id?: string; // 主键
  module?: string; // 所属模块(实体、枚举、web页面)
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CategoryDragRequest
 */
export interface CategoryDragRequest {
  id?: string; // 分类id
  targetSortNum?: number; // 目标位置排序序号
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
  module?: string; // 所属模块(实体、枚举、web页面 document_module/单据打印模块)
  name?: string; // 分类名称
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
  cron?: Array<string>; // corn 表达式 集合
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
 * title: DefaultValue
 */
export interface DefaultValue {
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
 * title: DocumentDTO
 */
export interface DocumentDTO {
  designerJson?: string; // 设计json
  runtimeJson?: string; // 运行时json
}

/**
 * title: DocumentRequest
 */
export interface DocumentRequest {
  categoryId?: string; // 分类id
  description?: string; // 备注
  designerJson?: string; // 设计json
  height?: number; // 尺寸（高度 单位/mm）
  key?: string; // 单据key
  modelCategory?: string; // 绑定模型类型(实体:entity,视图:view,数据:data)
  modelKey?: string; // 绑定模型key
  name?: string; // 单据名称
  paperSize: string; // 纸张大小
  runtimeJson?: string; // 运行时json
  width?: number; // 尺寸（宽度 单位/mm）
}

/**
 * title: DocumentResponse
 */
export interface DocumentResponse {
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  designerJson?: string; // 设计json
  height?: number; // 尺寸（高度 单位/mm）
  id?: string; // id
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
  width?: number; // 尺寸（宽度 单位/mm）
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
  text?: string; // 枚举文本
  textColor?: string; // 枚举名称颜色字段
  textState?: number; // 字段颜色启用关闭状态
  value?: string; // 枚举值
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
  textState?: number; // 配色开启关闭状态
}

/**
 * title: EnumModelState
 */
export interface EnumModelState {
  iconState?: number; // 图标开启关闭状态
  textState?: number; // 配色开启关闭状态
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
  relationColumns?: Array<string>; // 关联字段导入
  required: number; // 是否必填，0-非必填；1-必填
  treeNodeColumnField?: string; // 父节点识别字段
  type?: string; // 字段类型type
  userDefined?: string; // 日期字段格式是否自定义格式 1是 ,0 否
  valueMap?: Array<BooleanEntity>;
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
 * title: ExcelTmplConfig
 */
export interface ExcelTmplConfig {
  columns?: Array<ExcelColumnInfo>; // 模板中的字段集合
  duplicateKeyUpdate: number; // 导入策略 1 新增及更新/0 忽略重复数据
  notes?: string; // 模板的备注信息 ,填写提示信息
  rowHeight?: number; // 模板备注信息行高度，默认100
  uniqueColumns: Array<string>; // 防重校验字段
}

/**
 * title: ExcelTmplRequest
 */
export interface ExcelTmplRequest {
  description?: string; // 描述
  key?: string; // 模板key
  modelKey?: string; // 模型定义表key
  name?: string; // 模板名称
  type?: string; // 类型：IMPORT-导入;EXPORT-导出
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
  filePath?: string; // 模板相对路径,为空时没有配置模板
  id?: string; // 主键
  key?: string; // 模板key
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
}

/**
 * title: ExpConfig
 */
export interface ExpConfig {
  exp?: string;
  expression?: string;
  relationColumns?: Array<string>;
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
  defaultValueTips?: Array<string>; // 枚举默认值翻译
  description?: string;
  i18nConfig?: string; // 多语言配置
  id?: string;
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
 * title: FieldConfig
 */
export interface FieldConfig {
  fields?: Array<SingleField>;
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
  createTime?: string;
  createType?: string; // 字段创建类型，包含三种：SYSTEM-系统字段；BUILTIN-内置字段；USER_DEFINED-自定义字段
  createUserId?: string;
  createUserName?: string;
  defaultValue?: DefaultValue; // 默认值
  defaultValueTips?: Array<string>; // 枚举默认值翻译
  description?: string; // 描述
  i18nConfig?: string; // 多语言配置
  id?: string; // 主键
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
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  sortNum?: number; // 排序
  specificConfig?: IObject; // 特有属性配置选项(json格式)
  type?: string; // 数据类型
  uniqueConstraint?: UniqueConstraint; // 唯一约束
}

/**
 * title: FieldMetaVO
 */
export interface FieldMetaVO {
  bindFieldKey?: string; // 主子关联  绑定子模型字段
  bindInfo?: string; // 关联主键字段的绑定信息，格式：关联模型key
  defaultValue?: DefaultValue; // 默认值
  description?: string; // 描述
  i18nConfig?: string; // 多语言配置
  key?: string; // 字段key
  mappingType?: string; // 映射类型(公式,函数等实际映射的类型)
  modelKey?: string; // 模型定义表key
  name?: string; // 名称
  refModelType?: string; // 主子/引用关联模型类型(NDO/RDO)
  required?: number; // 是否必填:(0否,1是)
  specificConfig?: IObject; // 特有属性配置选项(json格式)
  type?: string; // 数据类型 (primary_key/主键,tenant/租户关联,ref_master_id/关联主键,text/短文本,long_text/长文本,integer/整数,long/长整数,decimal/精度小数,boolean/布尔,binary/二进制流,date/日期,time/时间,date_time/日期时间,user_multi/人员多选,org_multi/部门多选,image/图片,attachment/附件enum/枚举,serial/序列号,ref/引用关联,master_slave/主子关联,enum_multi/枚举多选,ref_multi/模型多选,expression/公式,agg/汇总,esop/E-SOP)
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
 * title: FieldTypeMeta
 */
export interface FieldTypeMeta {
  group?: string;
  hidden?: number;
  key?: string;
  mappingType?: string;
  multiValue?: number;
  multiValueJoinRule?: MultiValueJoinRule;
  name?: string;
  needDict?: number;
  priority?: number;
  refType?: number;
  requiredValidationEnabled?: number;
  supportCondition?: number;
  virtual?: number;
}

/**
 * title: FileResource4Req
 */
export interface FileResource4Req {
  ids: Array<string>;
}

/**
 * title: FileResourceResponse
 */
export interface FileResourceResponse {
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
 * title: FilterConfig
 */
export interface FilterConfig {
  exp?: string;
  expJson?: string;
  query?: object;
  varKeys?: Array<object>;
}

/**
 * title: GenerateZplCodeRequest
 */
export interface GenerateZplCodeRequest {
  bizServiceKey?: string; // 业务服务key
  data?: object; // 业务服务入参
  labelKey?: string; // 标签 key
  testVar?: object; // 测试用变量
}

/**
 * title: GetAppResponse
 */
export interface GetAppResponse {
  appPkgUrl?: string;
  appVersion?: string;
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
  pageIcon?: string;
  platformFieldTypeMetaList?: Array<FieldTypeMeta>;
  platformModelClassMetaList?: Array<ModelClassMeta>;
  role?: string;
  sourceAppId?: string;
  sourceAppName?: string;
  sourceAppVersion?: string;
  sourceType?: string;
  state?: string;
  stateCause?: string;
  suiteFieldTypeMetaList?: Array<FieldTypeMeta>;
  suiteKey?: string;
  suiteModelClassMetaList?: Array<ModelClassMeta>;
  suiteName?: string;
  tenantId?: string;
  type?: string;
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
  cron?: Array<string>; // cron表达式
  description?: string; // 备注
  endTime?: string; // 触发截止时间
  jobName?: string; // 定时任务名称
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
  cron?: Array<string>; // cron表达式
  description?: string; // 备注
  endTime?: string; // 触发截止时间
  id?: string; // id
  jobName?: string; // 定时任务名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonNode {}

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
 * title: LabelRequest
 */
export interface LabelRequest {
  categoryId?: string; // 分类id
  description?: string; // 备注
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  height?: number; // 尺寸（高度）
  key?: string; // 标签key
  modelKey?: string; // 绑定模型key
  name?: string; // 标签名称
  width?: number; // 尺寸（宽度）
}

/**
 * title: LabelResponse
 */
export interface LabelResponse {
  categoryResponse?: CategoryResponse; // 分类信息
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  designerJson?: string; // 设计json
  dpi?: number; // 打印dpi
  height?: number; // 尺寸（高度）
  id?: string; // ID
  key?: string; // 标签key
  modelKey?: string; // 绑定模型key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 标签名称
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
  menuType: string; // 类型(WEB；MOBILE-移动端菜单)
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
  permissions?: Array<string>; // 权限点集合
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
 * title: MessageTmplLogRequest
 */
export interface MessageTmplLogRequest {
  description?: string; // 消息模板描述
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  initCommitId?: string; // 初始提交 id
  key?: string; // 消息模板key
  messageInfo?: JsonNode; // 消息内容json
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 关联对象key(模型key)
  name?: string; // 消息模板名称
  opened?: number; // 0：不公开，1：公开
  pushObjectKey?: string; // 发送对象key，涉及邮箱地址，钉钉企业微信等              多个数据逗号隔开，key和name顺序一致
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  sysBuiltin?: number; // 是否系统内置服务(0自定义、1内置)
  tenantId?: string; // 租户id
  type?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
}

/**
 * title: MessageTmplLogResponse
 */
export interface MessageTmplLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 消息模板描述
  draft?: number; // 是否为草稿 0: 非草稿 1: 草稿
  id?: string; // id
  initCommitId?: string; // 初始提交 id
  key?: string; // 消息模板key
  messageInfo?: JsonNode; // 消息内容json
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 关联对象key(模型key)
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 消息模板名称
  opened?: number; // 0：不公开，1：公开
  pushObjectKey?: string; // 发送对象key，涉及邮箱地址，钉钉企业微信等              多个数据逗号隔开，key和name顺序一致
  pushType?: string; // 1：系统：system，2：邮箱：email，3：企业微信wecom，4：飞书：feishu，5：钉钉：dingtalk              多个数据逗号隔开
  sysBuiltin?: number; // 是否系统内置服务(0自定义、1内置)
  tenantId?: string; // 租户id
  type?: string; // 类型(BUILTIN:系统内置  USER_DEFINED:自定义)
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
  description?: string; // 消息模板描述
  id?: string; // 消息模板id
  key?: string; // 消息模板key
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
  key?: string; // 消息模板key
  rangUser?: string; // 字段值格式定义（多选、类型和id拼接、逗号分隔）
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
}

/**
 * title: ModelAssociationResponse
 */
export interface ModelAssociationResponse {
  fieldKey?: string;
  fieldType?: string;
  modelData?: object;
  modelKey?: string;
  modelName?: string;
}

/**
 * title: ModelBriefInfo
 */
export interface ModelBriefInfo {
  category?: string; // 种类
  key?: string; // 实体key
  name?: string; // 实体名称
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  type?: string; // 实体类型
}

/**
 * title: ModelClassMeta
 */
export interface ModelClassMeta {
  hidden?: number;
  key?: string;
  name?: string;
  parent?: string;
}

/**
 * title: ModelFieldPair
 */
export interface ModelFieldPair {
  direction?: string; // 方向 forward/backward
  fieldKey?: string; // 字段 key
  modelKey: string; // 模型 key
}

/**
 * title: ModelMeta
 */
export interface ModelMeta {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number;
  deleted?: number;
  description?: string;
  displayField?: string;
  id?: string;
  initCommitId?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  permissionEnabled?: number;
  recycled?: number;
  refModelKey?: string;
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
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deletePolicy?: number;
  deleted?: number;
  description?: string;
  displayField?: string;
  fieldMetaList?: Array<FieldMetaDTO>;
  id?: string;
  initCommitId?: string;
  key?: string;
  modelCategory?: string; // 模型大类型 entity/实体,view/视图,data/数据
  modelTraceSettingEnabled?: number;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  permissionEnabled?: number;
  recycled?: number;
  refModelKey?: string;
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
  modelTraceSettingEnabled?: number; // modelTraceSettingEnabled
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 模型名称
  permissionEnabled?: number; // 模型是否启用数据权限(1:启用,0:禁用)
  refModelKey?: string; // 关联的模型key
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
  data?: Array<object>;
  dict?: object;
  metaDict?: object;
}

/**
 * title: ModelPageableRow
 */
export interface ModelPageableRow {
  data?: Array<object>;
  dict?: object;
  metaDict?: object;
  pageNo?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

/**
 * title: MultiValueJoinRule
 */
export interface MultiValueJoinRule {
  dbDelimiter?: string;
  dbDelimiterAround?: number;
  inputAndDbFormatSame?: boolean;
  inputDelimiter?: string;
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
 * title: PageBase«MenuConfigResponse»
 */
export interface PageBaseMenuConfigResponse {
  data?: Array<MenuConfigResponse>; // 数据
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
 * title: PageBase«MessageTmplLogResponse»
 */
export interface PageBaseMessageTmplLogResponse {
  data?: Array<MessageTmplLogResponse>; // 数据
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
  birthday?: string; // 生日
  email?: string; // 邮箱
  empNo?: string; // 工号
  fullname?: string; // 姓名
  id?: string; // 用户 ID
  managerId?: string; // 直属上级id
  managerName?: string; // 直属上级姓名
  masterOrgId?: string; // 主部门id
  masterOrgName?: string; // 主部门名称
  mobile?: string; // 手机号码
  username?: string; // 账号
}

/**
 * title: PrintAdapterDTO
 */
export interface PrintAdapterDTO {
  branchId: string; // 分支Id
  env: string; // 环境
  printContent?: string; // 打印内容： doc 、excel、pdf为URL 、zpl
  printKey?: string; // 打印机/打印服务唯一标识：规则为 类型:key:[可选 若无则去找默认打印机、有则base64解码定位打印机]
  printNumber?: number; // 打印份数
  printType?: string; // 打印的类型： doc 、excel 、pdf 、 zpl=标签打印
  remark?: string; // 备注
  tagName?: string; // 标签名称
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
  type?: string; // 打印资源类型（CLIENT_PRINT、INTERNET_PRINT）
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
 * title: ProcessModelInfo
 */
export interface ProcessModelInfo {
  modelDataaId?: string;
  modelKey?: string;
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
 * title: QueryRefChainDataRequest
 */
export interface QueryRefChainDataRequest {
  dataIds: string; // 数据id，多个的话用逗号拼接
  fieldKey: string; // 引用字段 key
  includeDeleted?: boolean; // 包含删除的数据
  modelKey: string; // 模型 key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  refModelChain: Array<ModelFieldPair>; // 模型引用链
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}

/**
 * title: QueryRefDataRequest
 */
export interface QueryRefDataRequest {
  exp?: string; // 条件表达式
  fieldKey: string; // 字段 key
  includeDeleted?: boolean; // 包含删除的数据
  keyword?: string; // rdo 查询关键字
  modelKey: string; // 模型 key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  query?: object; // 查询条件
  refModelKey?: string; // 引用的模型key
  searchType?: string; // 树模型查询方式枚举 ALL(查询全部) SEARCH(搜索树)  LEVEL(返回指定层级的树结构)  CHILDREN(根据父节点查询子节点)
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}

/**
 * title: QuerySearchRefChainDataRequest
 */
export interface QuerySearchRefChainDataRequest {
  fieldKey: string; // 搜索字段，多个的话用逗号拼接
  includeDeleted?: boolean; // 包含删除的数据
  keyword?: string; // 搜索关键字
  modelKey: string; // 搜索组件模型key
  nodesChain: Array<ModelFieldPair>; // 模型引用链
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
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
  displayField?: string; // 实体模型的默认显示字段
  displayFieldName?: string; // 实体模型的默认显示字段名称
  id?: string; // 分类数据id
  key?: string; // 分类数据key
  name?: string; // 分类数据名称
  sortNum?: number; // 排序
  subModel?: number; // 模型是否为子模型 (1 子模型, 0 非子模型)
  type?: string; // 分类数据类型
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
  data?: Array<object>; // 返回正确结果时携带的数据
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
  data?: Array<object>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«MessageTmplLogResponse»»
 */
export interface ResponseEntityListMessageTmplLogResponse {
  code: number; // 执行结果状态码
  data?: Array<MessageTmplLogResponse>; // 返回正确结果时携带的数据
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
  data?: Array<string>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«MenuConfigResponse»»
 */
export interface ResponseEntityPageBaseMenuConfigResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMenuConfigResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«MessageTmplLogResponse»»
 */
export interface ResponseEntityPageBaseMessageTmplLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMessageTmplLogResponse; // 返回正确结果时携带的数据
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
  permissionKey?: string; // 权限key
  permissionType?: string; // 权限类型(MENU:菜单；POINT:权限点)
  roleId?: string; // 角色id
  terminalType?: string; // 权限分类(WEB；MOBILE:移动端)
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
 * title: SequencePreviewRequest
 */
export interface SequencePreviewRequest {
  fieldKey?: string;
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
 * title: SingleField
 */
export interface SingleField {
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
  modelKey?: string;
  modelName?: string;
  onExpressions?: Array<JoinOnExp>;
  type?: string;
}

/**
 * title: SysConfigRequest
 */
export interface SysConfigRequest {
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
 * title: TraceLogDetailsRequest
 */
export interface TraceLogDetailsRequest {
  modelKey?: string; // 表名称key
  operationType?: string; // 行数据操作类型（新增 修改 删除）
  pid?: string; // 上级主键id
  recordFieldJson?: string; // 模型字段数据变更前后记录
  recordId?: string; // 表数据主键id
  traceLogId?: string; // 建模追溯记录主表id
}

/**
 * title: TraceLogDetailsResponse
 */
export interface TraceLogDetailsResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modelKey?: string; // 表名称key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  operationType?: string; // 行数据操作类型（新增 修改 删除）
  pid?: string; // 上级主键id
  recordFieldJson?: string; // 模型字段数据变更前后记录
  recordId?: string; // 表数据主键id
  traceLogId?: string; // 建模追溯记录主表id
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
  treeData?: Array<object>; // 模型字段树
}

/**
 * title: UniqueConstraint
 */
export interface UniqueConstraint {
  checkStrategy?: string;
  fieldKeys?: Array<string>;
  type?: string;
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
  fieldPermission?: string; // 字段权限
  fieldPermissionEnabled?: number; // 开启字段权限
  relationId?: string; // 关系id
  relationType?: string; // 关系类型：ORG/USER/ROLE/ENTITY_MODEL_DATA
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
  fieldPermission?: string; // 字段权限
  fieldPermissionEnabled?: number; // 开启字段权限
  id?: string; // 资源标识，主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
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
 * title: UserOfAppDTO
 */
export interface UserOfAppDTO {
  appSuperAdmin?: number; // 是否应用超管,0: 否 1: 是
  appSuperAdminRemark?: string; // 超管备注
  permissions?: Array<string>; // app应用的角色权限点,0: 否 1: 是
  sourceType?: string; // app来源类型
}

/**
 * title: VersionActive
 */
export interface VersionActive {
  id?: string; // 要激活的版本
  scriptKey?: string; // JS脚本Key/服务编排key
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
  name?: string;
  required?: number;
  type?: string;
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
