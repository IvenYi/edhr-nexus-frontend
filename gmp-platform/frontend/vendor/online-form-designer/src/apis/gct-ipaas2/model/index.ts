/**
 * title: AppAuthParamConfig
 */
export interface AppAuthParamConfig {
  key?: string; // 鉴权字段key 结构的key
  keyType?: string; // 鉴权字段数据类型(Array,Object,String,Integer,Boolean,BigDecimal,Long)
  paramType?: string; // 鉴权入参配置:请求参数放在请求的位置(header/body/query/path)
  value?: string; // 当为鉴权函数时 支持的函数(MD5,NOW,RandomStr,SHA1,SHA256,SHA512,CONCAT)/ 表达式时来源字段(取值表达式 ${data.token})
  valueType?: string; // 取值类型(填入值:INPUT/鉴权函数:FUNC/表达式取值:EXPRESSION)
}

/**
 * title: AppAuthRequestConfig
 */
export interface AppAuthRequestConfig {
  key?: string; // 鉴权字段key 结构的key
  keyType?: string; // 鉴权字段数据类型(Array,Object,String,Integer,Boolean,BigDecimal,Long)
  paramType?: string; // 鉴权入参配置:请求参数放在请求的位置(header/body/query/path)
  value?: string; // 当为鉴权函数时 支持的函数(MD5,NOW,RandomStr,SHA1,SHA256,SHA512,CONCAT)/ 表达式时来源字段(取值表达式 ${data.token})
  valueType?: string; // 取值类型(填入值:INPUT/鉴权函数:FUNC/表达式取值:EXPRESSION)
}

/**
 * title: AppAuthSuccessExpression
 */
export interface AppAuthSuccessExpression {
  key?: string; // 鉴权参数key
  keyType?: string; // 鉴权字段数据类型(Array,Object,String,Integer,Boolean,BigDecimal,Long)
  operator?: string; // 条件运算符(!=,==,>,<,contains,notContains,isNull,isNotNull)
  value?: string; // 当为鉴权函数时 支持的函数(MD5,NOW,RandomStr,SHA1,SHA256,SHA512,CONCAT)/ 表达式时来源字段(取值表达式 ${data.token})
}

/**
 * title: AppConnectorResp
 */
export interface AppConnectorResp {
  appId?: string; // 应用id
  appName?: string; // 应用名称
  authMode?: string; // 鉴权方式(请求参数: DIRECT_ACCESS,获取token: ACCESS_TOKEN,无需鉴权:NONE,自定义: CUSTOM,AD域：AD)
  branchId?: string; // 环境-分支id
  brand?: string; // 品牌厂商
  connectCount?: number; // 连接流数量
  createTime?: string; // 创建时间
  dynamicDomain?: number; // 是否启用动态域名,0: 未启用 1: 启用
  env?: string; // 环境
  id?: string; // 配置id
  lastUsedTime?: string; // 最后使用时间
  logo?: string; // 应用logo
  logoBgColor?: string; // logo背景颜色
  logoColor?: string; // logo颜色
  logoType?: string; // 图标类型(icon、pic)
  platformAppId?: string; // 环境-应用id
  version?: string; // 应用版本
}

/**
 * title: AuthFormConfig
 */
export interface AuthFormConfig {
  key: string; // 字段key：例如账号：account
  value?: string; // 输入框的值
}

/**
 * title: CategoryCompleteResponse
 */
export interface CategoryCompleteResponse {
  children?: Array<Relation>;
  hasChild?: boolean; // 是否子版本
  id?: string; // 主键
  module?: string; // 所属模块
  name?: string; // 分类名称
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: CategoryDragRequest
 */
export interface CategoryDragRequest {
  appId?: string; // 应用appId
  branchId?: string; // 分支id
  env?: string; // 应用环境
  id?: string; // 分类id
  targetParentId?: string; // 目标位置父节点id，不传或传「ROOT」则代表根节点
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: ConnectorConfigRequest
 */
export interface ConnectorConfigRequest {
  authFormConfig?: Array<AuthFormConfig>; // 鉴权配置动态表单
  authMode?: string; // 是否鉴权(请求参数: DIRECT_ACCESS,获取token: ACCESS_TOKEN,无需鉴权:NONE)
  authParam?: Array<AppAuthParamConfig>; // 鉴权请求参数
  connectStatus?: string; // 测试连接状态 SUCCESS,FAILURE
  dynamicDomain?: number; // 是否启用动态域名,0: 未启用 1: 启用
  effectiveTime?: number; // 鉴权有效时间
  host?: string; // 域名
  httpMethod: string; // 鉴权接口请求方式
  id?: string;
  loginAddress?: string; // 鉴权地址(动态域名情况下,不配IP地址)
  relationId?: string; // 应用id
  requestConfig?: Array<AppAuthRequestConfig>; // 鉴权入参配置
  successExpression?: Array<AppAuthSuccessExpression>; // 响应成功条件
  timeUnit?: string; // 鉴权有效时间 单位(秒:SECONDS/小时:HOURS/天:DAYS/分钟:MINUTES)
}

/**
 * title: ConnectorConfigResponse
 */
export interface ConnectorConfigResponse {
  authFormConfig?: Array<AuthFormConfig>; // 鉴权配置动态表单
  authMode?: string; // 鉴权方式(请求参数: DIRECT_ACCESS,获取token: ACCESS_TOKEN,无:NONE,AD域：AD)
  authParam?: Array<AppAuthParamConfig>; // 请求参数
  connectStatus?: string; // 测试连接状态 SUCCESS,FAILURE
  connectorId?: string; // 连接器ID
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dynamicDomain?: number; // 是否启用动态域名,0: 未启用 1: 启用
  effectiveTime?: number; // 鉴权有效时间
  host?: string; // 域名
  httpMethod?: string; // 鉴权接口请求方式
  id?: string; // 主键
  lastUsedTime?: string; // 最后使用时间
  loginAddress?: string; // 鉴权地址
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  relationId?: string; // 关联应用id
  requestConfig?: Array<AppAuthRequestConfig>; // 接口请求鉴权参数配置
  successExpression?: Array<AppAuthSuccessExpression>; // 响应成功条件
  timeUnit?: string; // 鉴权有效时间 单位(秒:SECONDS/小时:HOURS/天:DAYS/分钟:MINUTES)
}

/**
 * title: ConnectorLogRequest
 */
export interface ConnectorLogRequest {
  appName?: string; // 应用名称
  authMode?: string; // 鉴权方式(DIRECT_ACCESS/ACCESS_TOKEN/CUSTOM/NONE) 多个逗号分隔
  brand?: string; // 品牌厂商
  connectMode?: string; // 连接类型(TEST/BIZ)
  connectStatus?: string; // 测试连接状态(SUCCESS,FAILURE)
  endTime?: string; // 调用截止时间
  startTime?: string; // 调用开始时间
  version?: string; // 应用版本
}

/**
 * title: ConnectorLogResponse
 */
export interface ConnectorLogResponse {
  accessTime?: string; // 请求接口时间
  appId?: string; // 应用id
  appName?: string; // 应用名称
  authMode?: string; // 鉴权方式(DIRECT_ACCESS/ACCESS_TOKEN/CUSTOM/NONE)
  branchId?: string; // 分支id
  brand?: string; // 品牌厂商
  connectMode?: string; // 连接类型(测试连接:TEST/业务连接:BIZ)
  connectStatus?: string; // 测试连接状态(SUCCESS,FAILURE)
  connectorId?: string; // 连接器配置id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  duration?: number; // 耗时ms
  env?: string; // 应用环境
  id?: string; // 主键
  loginAddress?: string; // 鉴权地址
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  requestInfo?: string; // 请求接口信息
  requestMessage?: object; // 请求报文信息
  responseMessage?: object; // 接口响应信息
  responseTime?: string; // 请求时间
  tenantId?: string; // 租户id
  url?: string; // 请求地址
  version?: string; // 应用版本
}

/**
 * title: DebugDTO
 */
export interface DebugDTO {
  clientId?: string; // 即websocket的clientId: debug_flowId_requestId,debug为websocket连接的业务前缀,其中requestId为这一次调试id，为随机值有后端生成
  debugModel?: string; // 调试模式：单步：single、多步：multi
  debugNodeIds?: Array<string>; // 打断点的节点id
  flow?: string; // 编排的json
  updated?: boolean; // json是否修改过
}

/**
 * title: FlowAppReq
 */
export interface FlowAppReq {
  brand: string;
  categoryId?: string; // 分类ID
  description?: string; // 描述
  logo?: string; // 应用logo
  logoBgColor?: string; // logo背景颜色
  logoColor?: string; // logo颜色
  logoType?: string; // logo类型(icon/pic)
  name: string;
  version: string;
}

/**
 * title: FlowAppRequest
 */
export interface FlowAppRequest {
  brand?: string; // 品牌
  categoryId?: string; // 分类ID
  description?: string; // 描述
  logo?: string; // 应用logo
  logoBgColor?: string; // logo背景颜色
  logoColor?: string; // logo颜色
  logoType?: string; // 图标类型(icon/pic)
  name?: string; // 应用名称
  status?: number; // 状态
  tenantId?: string; // 租户ID
  version?: string; // 版本
}

/**
 * title: FlowAppResponse
 */
export interface FlowAppResponse {
  brand?: string; // 品牌
  categoryId?: string; // 分类ID
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // 应用主键
  logo?: string; // 应用logo
  logoBgColor?: string; // 背景颜色
  logoColor?: string; // 颜色
  logoType?: string; // 图标类型(icon/pic)
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 应用名称
  status?: number; // 状态
  tenantId?: string; // 租户ID
  version?: string; // 版本
}

/**
 * title: FlowCategoryRequest
 */
export interface FlowCategoryRequest {
  appId?: string; // 应用appId
  branchId?: string; // 分支id
  env?: string; // 应用环境
  module?: string; // 所属模块(连接流:flow,连接器:connector)
  name?: string; // 分类名称
  parentId?: string; // 父节点id
}

/**
 * title: FlowCategoryResponse
 */
export interface FlowCategoryResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string; // 全路径
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 所属模块
  name?: string; // 分类名称
  parentId?: string; // 父节点id
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}

/**
 * title: FlowCategoryTree
 */
export interface FlowCategoryTree {
  child?: Array<FlowCategoryTree>; // 子节点
  id?: string; // 数据id
  name?: string; // 名称
  type?: string; // 类型：flow 流程、category 分类
}

/**
 * title: FlowCreateWithCategoryReq
 */
export interface FlowCreateWithCategoryReq {
  categoryId?: string; // 分类id
  fAppId?: string;
  key?: string; // key
  mark?: string; // 备注
  name: string;
}

/**
 * title: FlowDebugNodeLog
 */
export interface FlowDebugNodeLog {
  clientId?: string; // clientId
  endTime?: number;
  request?: LogResponse;
  response?: LogResponse;
  startTime?: number;
  status?: boolean;
}

/**
 * title: FlowExtRequest
 */
export interface FlowExtRequest {
  definitionJson?: string; // 连接流json
  fuuid?: string; // 连接流id
  status?: number; // 状态
  statusStr?: string; // 状态字符串
  version?: string; // k值
}

/**
 * title: FlowExtResponse
 */
export interface FlowExtResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  definitionJson?: string; // 连接流json
  fuuid?: string; // 连接流id
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  status?: number; // 状态
  statusStr?: string; // 状态字符串
  version?: string; // k值
}

/**
 * title: FlowLogResp
 */
export interface FlowLogResp {
  fkey?: string;
  fuuid?: string;
  id?: string;
  modelKey?: string;
  name?: string;
  processTime?: number; // 流程耗时：毫秒
  reqId?: string;
  retry?: boolean; // 是否可重试
  status?: string; // 1.执行中 2.执行成功 3.执行失败
  statusStr?: string; // 状态翻译
  triggerTime?: string; // 触发时间
  triggerType?: string;
  version?: string;
}

/**
 * title: FlowMainResp
 */
export interface FlowMainResp {
  appName?: string;
  categoryId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fuuid?: string;
  id?: string;
  key?: string;
  mark?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  nameStr?: string;
  status?: number;
  statusStr?: string;
  triggerType?: string;
  updateTime?: string;
}

/**
 * title: FlowNodeLogResp
 */
export interface FlowNodeLogResp {
  endpointType?: string; // 端点类型
  fuuid?: string;
  nodeDesc?: string;
  nodeId?: string;
  nodeName?: string;
  processTime?: number;
  processTimeEnd?: string; // 执行结束时间
  processTimeStart?: string; // 执行开始时间
  reqId?: string;
  status?: string;
}

/**
 * title: FlowUpdateReq
 */
export interface FlowUpdateReq {
  categoryId?: string; // 分类id
  fAppId?: string;
  key?: string;
  mark?: string;
  name: string;
}

/**
 * title: LogResponse
 */
export interface LogResponse {
  body?: object;
  headers?: object;
  method?: object;
  path?: object;
  query?: object;
  url?: string;
}

/**
 * title: PageBase«AppConnectorResp»
 */
export interface PageBaseAppConnectorResp {
  data?: Array<AppConnectorResp>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ConnectorLogResponse»
 */
export interface PageBaseConnectorLogResponse {
  data?: Array<ConnectorLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FlowAppResponse»
 */
export interface PageBaseFlowAppResponse {
  data?: Array<FlowAppResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FlowCategoryResponse»
 */
export interface PageBaseFlowCategoryResponse {
  data?: Array<FlowCategoryResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FlowExtResponse»
 */
export interface PageBaseFlowExtResponse {
  data?: Array<FlowExtResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FlowLogResp»
 */
export interface PageBaseFlowLogResp {
  data?: Array<FlowLogResp>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FlowMainResp»
 */
export interface PageBaseFlowMainResp {
  data?: Array<FlowMainResp>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: Relation
 */
export interface Relation {
  categoryId?: string; // 分类id
  categoryName?: string; // 分类名称
  children?: Array<Relation>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  defaulted?: number; // 是否默认
  deleted?: number;
  hasChild?: boolean; // 是否子版本
  id?: string; // 关联表主键id
  key?: string; // 分类数据key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 分类数据名称
  relationId?: string; // 分类数据id
  sortNum?: number; // 排序
  sysBuiltin?: number; // 是否系统内置服务
}

/**
 * title: RequestBizServiceConfig
 */
export interface RequestBizServiceConfig {
  authFormConfig?: Array<AuthFormConfig>; // 鉴权配置动态表单
  authMode?: string; // 是否鉴权(请求参数: DIRECT_ACCESS,获取token: ACCESS_TOKEN,无需鉴权:NONE)
  authParam?: Array<AppAuthParamConfig>; // 鉴权请求参数
  connectStatus?: string; // 测试连接状态 SUCCESS,FAILURE
  debugAddress: string; // 调试接口地址
  debugRequestConfig?: Array<AppAuthRequestConfig>; // 调试接口请求参数配置
  debugRequestMethod: string; // 鉴权接口请求方式
  dynamicDomain?: number; // 是否启用动态域名,0: 未启用 1: 启用
  effectiveTime?: number; // 鉴权有效时间
  host?: string; // 域名
  httpMethod: string; // 鉴权接口请求方式
  id?: string;
  loginAddress?: string; // 鉴权地址(动态域名情况下,不配IP地址)
  relationId?: string; // 应用id
  requestConfig?: Array<AppAuthRequestConfig>; // 鉴权入参配置
  successExpression?: Array<AppAuthSuccessExpression>; // 响应成功条件
  timeUnit?: string; // 鉴权有效时间 单位(秒:SECONDS/小时:HOURS/天:DAYS/分钟:MINUTES)
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
 * title: ResponseEntity«ConnectorConfigResponse»
 */
export interface ResponseEntityConnectorConfigResponse {
  code: number; // 执行结果状态码
  data?: ConnectorConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ConnectorLogResponse»
 */
export interface ResponseEntityConnectorLogResponse {
  code: number; // 执行结果状态码
  data?: ConnectorLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FlowAppResponse»
 */
export interface ResponseEntityFlowAppResponse {
  code: number; // 执行结果状态码
  data?: FlowAppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FlowCategoryResponse»
 */
export interface ResponseEntityFlowCategoryResponse {
  code: number; // 执行结果状态码
  data?: FlowCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FlowDebugNodeLog»
 */
export interface ResponseEntityFlowDebugNodeLog {
  code: number; // 执行结果状态码
  data?: FlowDebugNodeLog; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FlowExtResponse»
 */
export interface ResponseEntityFlowExtResponse {
  code: number; // 执行结果状态码
  data?: FlowExtResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppConnectorResp»»
 */
export interface ResponseEntityListAppConnectorResp {
  code: number; // 执行结果状态码
  data?: Array<AppConnectorResp>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«ConnectorLogResponse»»
 */
export interface ResponseEntityListConnectorLogResponse {
  code: number; // 执行结果状态码
  data?: Array<ConnectorLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowAppResponse»»
 */
export interface ResponseEntityListFlowAppResponse {
  code: number; // 执行结果状态码
  data?: Array<FlowAppResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowCategoryResponse»»
 */
export interface ResponseEntityListFlowCategoryResponse {
  code: number; // 执行结果状态码
  data?: Array<FlowCategoryResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowCategoryTree»»
 */
export interface ResponseEntityListFlowCategoryTree {
  code: number; // 执行结果状态码
  data?: Array<FlowCategoryTree>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowExtResponse»»
 */
export interface ResponseEntityListFlowExtResponse {
  code: number; // 执行结果状态码
  data?: Array<FlowExtResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowMainResp»»
 */
export interface ResponseEntityListFlowMainResp {
  code: number; // 执行结果状态码
  data?: Array<FlowMainResp>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«FlowNodeLogResp»»
 */
export interface ResponseEntityListFlowNodeLogResp {
  code: number; // 执行结果状态码
  data?: Array<FlowNodeLogResp>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«AppConnectorResp»»
 */
export interface ResponseEntityPageBaseAppConnectorResp {
  code: number; // 执行结果状态码
  data?: PageBaseAppConnectorResp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ConnectorLogResponse»»
 */
export interface ResponseEntityPageBaseConnectorLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseConnectorLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FlowAppResponse»»
 */
export interface ResponseEntityPageBaseFlowAppResponse {
  code: number; // 执行结果状态码
  data?: PageBaseFlowAppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FlowCategoryResponse»»
 */
export interface ResponseEntityPageBaseFlowCategoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseFlowCategoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FlowExtResponse»»
 */
export interface ResponseEntityPageBaseFlowExtResponse {
  code: number; // 执行结果状态码
  data?: PageBaseFlowExtResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FlowLogResp»»
 */
export interface ResponseEntityPageBaseFlowLogResp {
  code: number; // 执行结果状态码
  data?: PageBaseFlowLogResp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FlowMainResp»»
 */
export interface ResponseEntityPageBaseFlowMainResp {
  code: number; // 执行结果状态码
  data?: PageBaseFlowMainResp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SchemaObject»
 */
export interface ResponseEntitySchemaObject {
  code: number; // 执行结果状态码
  data?: SchemaObject; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ValidCronResponse»
 */
export interface ResponseEntityValidCronResponse {
  code: number; // 执行结果状态码
  data?: ValidCronResponse; // 返回正确结果时携带的数据
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
 * title: SchemaObject
 */
export interface SchemaObject {
  items?: SchemaObject;
  not?: object;
  properties?: object;
  required?: Array<string>;
  type?: string;
}

/**
 * title: ValidCronResponse
 */
export interface ValidCronResponse {
  errorMsg?: string; // 错误信息(若有)
  result?: boolean; // 校验结果： true成功、false失败
}
