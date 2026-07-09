/**
 * title: APIDatasetConfigDTO
 */
export interface APIDatasetConfigDTO {
  beginTime?: string; // 开始时间
  extrColumns?: string; // 抽取依据字段
  extrType?: number; // 抽取类型 0:全量覆盖 1:全量追加 2:增量抽取
  syncType?: number; // 数据同步周期 0:手动更新，1:定时更新
  taskFreqUnit?: string; // 任务频率的单位,day/hour
  taskFreqValue?: number; // 任务频率的数值
}

/**
 * title: AcLicenseResponse
 */
export interface AcLicenseResponse {
  category?: string; // 授权类别 系统授权：system 增购：additional
  customerName?: string; // 客户名称
  effectiveDate?: string; // 生效时间
  env?: string; // 授权环境
  expirationDate?: string; // 失效时间
  id?: string; // 唯一标识
  productName?: string; // 产品名称
  state?: string; // 状态
}

/**
 * title: AccountConfig
 */
export interface AccountConfig {
  appType?: string; // 应用类型 枚举 (钉钉 DINGDING，企微 QIYEWEIXIN，飞书 FEISHU，微软 MICROSOFT)
  relationField?: string; // 域账号关联字段(username_/账号,emp_no_/工号,mobile_/手机号码)
}

/**
 * title: AddDatabaseForm
 */
export interface AddDatabaseForm {
  aliasName?: string;
  apiConfig?: string;
  appId?: string;
  dbName?: string;
  dbType?: string;
  description?: string;
  driverClassName?: string;
  dsAppId?: string;
  env?: string;
  id?: string;
  maxActive?: number;
  password?: string;
  poolName?: string;
  poolSize?: number;
  type?: string;
  url?: string;
  username?: string;
}

/**
 * title: AgentDTO
 */
export interface AgentDTO {
  bizParams?: string;
  description?: string;
  icon?: string;
  id?: string;
  knowledgeBase?: string;
  longMemory?: number;
  modelConf?: string;
  modelId?: string;
  modelProvider?: string;
  name?: string;
  prePrompt?: string;
  promptConf?: string;
  system?: number;
  tools?: string;
  type?: string;
  uploadConf?: string;
  usage?: string;
}

/**
 * title: AgentRequest
 */
export interface AgentRequest {
  bizParams?: string; // 自定义输入变量
  description?: string; // 描述
  icon?: string; // 图标url
  knowledgeBase?: string; // 知识库配置json
  longMemory?: number; // 开启长期记忆
  modelConf?: string; // LLM模型配置，json
  modelId?: string; // LLM模型ID
  modelProvider?: string; // LLM模型供应商
  name?: string; // 智能体名称
  prePrompt?: string; // 智能体提示词
  promptConf?: string; // 提示词类型（simple、fim）、模版等,json
  system?: number; // 是否为系统内置智能体
  tools?: string; // 工具配置
  type?: string; // 智能体类型:chat(聊天+上下文+知识库)、agent（chat+tools）
  uploadConf?: string; // 上传配置，图片需要考虑模型是否支持，文档需要有解析器支持
  usage?: string; // 用途Backend Script、Front Script
}

/**
 * title: AgentResponse
 */
export interface AgentResponse {
  bizParams?: string; // 自定义输入变量
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  icon?: string; // 图标url
  id?: string; // $column.comments
  knowledgeBase?: string; // 知识库配置json
  longMemory?: number; // 开启长期记忆
  modelConf?: string; // LLM模型配置，json
  modelId?: string; // LLM模型ID
  modelProvider?: string; // LLM模型供应商
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 智能体名称
  prePrompt?: string; // 智能体提示词
  promptConf?: string; // 提示词类型（simple、fim）、模版等,json
  system?: number; // 是否为系统内置智能体
  tools?: string; // 工具配置
  type?: string; // 智能体类型:chat(聊天+上下文+知识库)、agent（chat+tools）
  uploadConf?: string; // 上传配置，图片需要考虑模型是否支持，文档需要有解析器支持
  usage?: string; // 用途Backend Script、Front Script
}

/**
 * title: Annotation
 */
export interface Annotation {

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
 * title: ApkRequest
 */
export interface ApkRequest {
  apkName?: string; // apk名称
  apkUrl?: string; // apk地址
  apkVersion?: string; // apk版本
}

/**
 * title: ApkResponse
 */
export interface ApkResponse {
  apkActive?: number; // apk激活状态
  apkName?: string; // apk名称
  apkUrl?: string; // apk地址
  apkVersion?: string; // apk版本
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
}

/**
 * title: App
 */
export interface App {
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
 * title: AppCountDto
 */
export interface AppCountDto {
  allCount?: number;
  recycleBinCount?: number;
}

/**
 * title: AppDataRequest
 */
export interface AppDataRequest {
  appId?: string;
  description?: string;
  image?: string;
  logo?: string;
  logoBgColor?: string;
  logoColor?: string;
  name?: string;
  thumbnail?: string;
  type?: string;
}

/**
 * title: AppEffectiveLicense
 */
export interface AppEffectiveLicense {
  licenseCheck?: boolean; // 是否校验license
  licenseList?: Array<LicenseDTO>; // license列表
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
  userIds?: Array<string>; // 用户id
}

/**
 * title: AppGrantedUserRequest
 */
export interface AppGrantedUserRequest {
  userId?: string; // 用户id
}

/**
 * title: AppLockRequest
 */
export interface AppLockRequest {
  appId?: string;
  state?: string;
  stateCause?: string;
}

/**
 * title: AppMember
 */
export interface AppMember {
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fullname?: string;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  orgName?: string;
  role?: string;
  tenantId?: string;
  userId?: string;
  username?: string;
}

/**
 * title: AppMemberDto
 */
export interface AppMemberDto {
  appData?: AppPO;
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  role?: string;
  tenantId?: string;
  userId?: string;
}

/**
 * title: AppMemberPO
 */
export interface AppMemberPO {
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  role?: string;
  tenantId?: string;
  userId?: string;
}

/**
 * title: AppMemberRequest
 */
export interface AppMemberRequest {
  appId?: string; // 应用ID
  id?: string;
  role?: string; // 角色
  tenantId?: string; // 所属租户id
  userId?: string; // 用户ID
}

/**
 * title: AppMemberResponse
 */
export interface AppMemberResponse {
  appId?: string; // 应用ID
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullname?: string; // 用户ID
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  orgName?: string; // 组织名
  role?: string; // 角色
  tenantId?: string; // 所属租户id
  userId?: string; // 用户ID
  username?: string; // 用户名
}

/**
 * title: AppOrgUserPageRequest
 */
export interface AppOrgUserPageRequest {
  allUserOption?: number; // 是否显示主部门与下级部门所有人员
  appId?: string; // appId
  appUserGranted?: number; // 应用用户是否授权
  env?: string; // 应用环境
  ignoreCase?: number; // 是否忽略大小写
  ignoreEnabled?: number; // 是否忽略用户状态
  keyword?: string; // 关键字
  keywordFields?: Array<string>; // 关键字筛选字段
  orgId?: string; // 部门id
  orgIds?: Array<string>; // 部门id，多个的情况
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  userName?: string; // 查询的用户姓名或账号
}

/**
 * title: AppPO
 */
export interface AppPO {
  clear?: number;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  id?: string;
  initFailReason?: string;
  initState?: string;
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
 * title: AppProcess
 */
export interface AppProcess {
  appName?: string;
  appTag?: string;
  processList?: Array<Process>;
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
 * title: AppRequest
 */
export interface AppRequest {
  appPkgUrl?: string; // 应用包路径
  appVersion?: string; // 自建应用版本
  description?: string; // 应用描述
  id?: string;
  logo?: string; // 应用logo
  logoBgColor?: string; // logo背景颜色
  logoColor?: string; // logo颜色
  logoThumbnail?: string; // 缩略图
  logoType?: string; // logo类型
  mobileEnabled?: number; // 移动端启用状态（0 不启用 1 启用）
  mobileJson?: string; // 手机端json
  name?: string; // 应用名称
  pageIcon?: string; // 浏览器icon
  sourceType?: string; // 应用来源类型：SELF_BUILT/IMPORT
  suiteKey?: string; // 套件标识
  suiteName?: string; // 套件名称
  tenantId?: string; // 所属租户id
  type?: string; // 应用类型
  userGrantEnabled?: number; // 启用用户授权
}

/**
 * title: AppResponse
 */
export interface AppResponse {
  appMember?: AppMember; // 应用维护者信息
  appVersion?: string; // 自建应用版本
  authState?: number; // 授权状态
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 应用描述
  id?: string; // 主键
  image?: string; // 应用image
  initFailReason?: string; // 错误原因
  isRunning?: string; // 是否发布
  logo?: string; // 应用logo
  logoBgColor?: string; // 应用logoBgColor
  logoColor?: string; // logo颜色
  logoThumbnail?: string; // 缩略图
  logoType?: string; // logo类型
  mobileEnabled?: number; // 移动端启用状态（0 不启用 1 启用）
  mobileJson?: string; // 手机端json
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 应用名称
  pageIcon?: string; // 浏览器icon
  releasedStatus?: number;
  role?: string; // 当前角色
  seq?: number; // 导入应用分支序号
  sourceAppId?: string; // 来源appId
  sourceAppName?: string; // 来源app名称
  sourceAppVersion?: string; // 来源版本
  sourceType?: string; // 来源类型
  state?: string; // 状态
  stateCause?: string; // 状态详情
  suiteKey?: string; // 套件标识
  suiteName?: string; // 套件名称
  tenantId?: string; // 所属租户id
  type?: string; // 应用类型
  userGrantEnabled?: number; // 启用用户授权
}

/**
 * title: AppSettingDtoArray
 */
export interface AppSettingDtoArray {
  createTime?: string;
  id?: string;
  invalid?: number;
  name?: string;
  relationId?: string;
  type?: string;
}

/**
 * title: AppSettingDtoRequest
 */
export interface AppSettingDtoRequest {
  admin_ids?: string; // 应用管理员ids
  appId?: string; // 应用ID
  canBeUsedOrganizationIds?: string; // 应用可使用组织ids
  env?: string; // 环境标识
  visibilityOrganizationIds?: string; // 应用可见范围组织ids
  visibilityUserIds?: string; // 应用可见范围人员ids
}

/**
 * title: AppSettingDtoResponse
 */
export interface AppSettingDtoResponse {
  admin_ids?: Array<AppSettingDtoArray>; // 应用管理员ids
  appId?: string; // 应用ID
  canBeUsedOrganizationIds?: Array<AppSettingDtoArray>; // 应用可使用组织ids
  visibilityOrganizationIds?: Array<AppSettingDtoArray>; // 应用可见范围组织ids
  visibilityUserIds?: Array<AppSettingDtoArray>; // 应用可见范围人员ids
}

/**
 * title: AppSettingRequest
 */
export interface AppSettingRequest {
  appId?: string; // 应用ID
  deleted?: string; // deleted
  env?: string; // env
  relationId?: string; // 关联数据id
  type?: string; // 类型枚举
}

/**
 * title: ApplicationContext
 */
export interface ApplicationContext {
  applicationName?: string;
  autowireCapableBeanFactory?: AutowireCapableBeanFactory;
  beanDefinitionCount?: number;
  beanDefinitionNames?: Array<string>;
  classLoader?: ClassLoader;
  displayName?: string;
  environment?: Environment;
  id?: string;
  parent?: ApplicationContext;
  parentBeanFactory?: BeanFactory;
  startupDate?: number;
}

/**
 * title: AssetsResponse
 */
export interface AssetsResponse {
  categoryId?: string; // 分类ID
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块
  name?: string; // $column.comments
  path?: string; // 路径
}

/**
 * title: AttachmentResourceTransferForm
 */
export interface AttachmentResourceTransferForm {
  newGuid?: string;
  oldGuid?: string;
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
 * title: AuthBasicInfo
 */
export interface AuthBasicInfo {
  existLicenseIds?: string; // 已存在授权信息id
  machineId?: string; // k8s机器号
  moduleAuth?: number; // 是否授权模块
  productType?: string; // 产品类型
  version?: string; // 平台/应用版本
}

/**
 * title: AuthConfig
 */
export interface AuthConfig {
  banner?: string; // 登录页banner图
  defaultAuthType?: string; // 默认登录方式
  enabled?: number; // 是否启用
  id?: string; // 主键id
  loginModeConfigs?: Array<LoginModeConfig>; // 系统登录方式配置
  logo?: string; // 登录页logo
  openIDOAuthConfigs?: Array<ThirdPartyLoginConfig>; // 第三方登录方式配置
  sortJson?: string; // 排序json
  subtitle?: string; // 副标题
  theme?: string; // 登录主题
  title?: string; // 登录标题
}

/**
 * title: AutowireCapableBeanFactory
 */
export interface AutowireCapableBeanFactory {

}

/**
 * title: BIChartConditionDTO
 */
export interface BIChartConditionDTO {
  condition?: WhereRelation;
  datasetKey?: string; // 数据集key
  dateFieldStatistics?: boolean;
  groupItems?: Array<SelectItem>;
  metricSelectItems?: Array<SelectItem>;
  orderValues?: object; // 自定义排序
  pageNo?: number;
  pageSize?: number;
  pageType?: boolean; // 分页类型，true:首行维度（第一列相同内容合并），false:所有维度
  rowSelectItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
  where?: string; // where sql
}

/**
 * title: BIChartExportDTO
 */
export interface BIChartExportDTO {
  columnNames?: Array<TableHeaderMapping>; // 表头列名
  condition?: WhereRelation;
  datasetKey?: string; // 数据集key
  dateFieldStatistics?: boolean;
  groupItems?: Array<SelectItem>;
  metricSelectItems?: Array<SelectItem>;
  orderValues?: object; // 自定义排序
  pageNo?: number;
  pageSize?: number;
  pageType?: boolean; // 分页类型，true:首行维度（第一列相同内容合并），false:所有维度
  picString?: string; // 图片
  rowSelectItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
  where?: string; // where sql
}

/**
 * title: BICrossReportDTO
 */
export interface BICrossReportDTO {
  columnSelectItems?: Array<SelectItem>;
  columnSubTotalItems?: Array<SelectItem>;
  condition?: WhereRelation;
  datasetKey?: string; // 数据集key
  dateFieldStatistics?: boolean;
  groupItems?: Array<SelectItem>;
  metricSelectItems?: Array<SelectItem>;
  orderValues?: object; // 自定义排序
  pageNo?: number;
  pageSize?: number;
  pageType?: boolean; // 分页类型，true:首行维度（第一列相同内容合并），false:所有维度
  rowSelectItems?: Array<SelectItem>;
  rowSubTotalItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
  tableType?: string; // 表类型: DetailTable 明细表、CrossTable 交叉表
  where?: string; // where sql
}

/**
 * title: Base64UploadPlatFormRequest
 */
export interface Base64UploadPlatFormRequest {
  fileContent: string; // base64文件内容
  filename: string; // 文件名
}

/**
 * title: BeanFactory
 */
export interface BeanFactory {

}

/**
 * title: BiDataSetPreviewRequest
 */
export interface BiDataSetPreviewRequest {
  description?: string; // 描述
  fieldConfig?: object; // 字段配置json
  filterConfig?: object; // 过滤条件配置json
  fullSql?: string; // fullSql
  joinConfig?: object; // 连接配置json
  key?: string; // 数据集Key
  links?: string; // 前端用设计json
  modelConfig?: string; // 所有模型
  models?: string; // 前端用所有模型
  name?: string; // 数据集名称
  pnDataset?: PnDataset; // 数据集信息组装
}

/**
 * title: BiDataSetPreviewResult
 */
export interface BiDataSetPreviewResult {
  previewSql?: string; // previewSql
  sqlResult?: SqlResult; // 数据
  total?: number; // 总数
}

/**
 * title: BiDataSetRequest
 */
export interface BiDataSetRequest {
  description?: string; // 描述
  fieldConfig?: object; // 字段配置json
  filterConfig?: object; // 过滤条件配置json
  joinConfig?: object; // 连接配置json
  key?: string; // 数据集Key
  links?: string; // 前端用设计json
  modelConfig?: string; // 所有模型
  models?: string; // 前端用所有模型
  name?: string; // 数据集名称
}

/**
 * title: BiDataSetResponse
 */
export interface BiDataSetResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  fieldConfig?: string; // 字段配置json
  filterConfig?: string; // 过滤条件配置json
  id?: string; // 主键
  joinConfig?: string; // 连接配置json
  key?: string; // 数据集Key
  links?: string; // 前端用设计json
  modelConfig?: string; // 所有模型
  models?: string; // 前端用所有模型
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 数据集名称
}

/**
 * title: BiFileDatasetConfigRequest
 */
export interface BiFileDatasetConfigRequest {
  config?: string; // 数据集配置
  currentVerison?: string; // 当前版本，yes:是当前版本
  datasetId?: string; // 数据集Id
  tableName?: string; // 数据集表名
  url?: string; // minio地址
}

/**
 * title: BiFileDatasetConfigResponse
 */
export interface BiFileDatasetConfigResponse {
  config?: string; // 数据集配置
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  currentVerison?: string; // 当前版本，yes:是当前版本
  datasetId?: string; // 数据集Id
  dbType?: string; // 数据集的数据库类型
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  tableName?: string; // 数据集表名
  url?: string; // minio地址
}

/**
 * title: BiShareRequest
 */
export interface BiShareRequest {
  encrypted?: number; // 是否加密 0：未加密 1：加密
  expireDate?: string; // 过期日期
  expireType?: number; // 过期方式 0：截止日 1：永久有效
  name?: string; // 链接名称
  password?: string; // 分享密码
  projectId?: string; // 项目Id
  shareId?: string; // 分享Id
  url?: string; // 分享链接
}

/**
 * title: BiShareResponse
 */
export interface BiShareResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  encrypted?: number; // 是否加密 0：未加密 1：加密
  expireDate?: string; // 过期日期
  expireType?: number; // 过期方式 0：截止日 1：永久有效
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 链接名称
  password?: string; // 分享密码
  projectId?: string; // 项目Id
  shareId?: string; // 分享Id
  url?: string; // 分享链接
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
  varList?: Array<object>; // 模板中解析出来的变量集合
}

/**
 * title: CSV数据源查询参数
 */
export interface CSV数据源查询参数 {
  keyword?: string; // 搜索字符串
  name?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
}

/**
 * title: CSV数据源表实体类
 */
export interface CSV数据源表实体类 {
  create_date?: string; // 创建时间
  id?: string; // 主键
  jsonData?: string;
  json_data?: string;
  name: string;
  remark?: string;
  userId?: string;
  user_id?: string;
}

/**
 * title: CardLoginConfig
 */
export interface CardLoginConfig {
  enabled?: number; // 是否启用
}

/**
 * title: Category
 */
export interface Category {
  appId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string;
  name?: string;
  sortNum?: number;
  sysBuiltin?: number;
  tenantId?: string;
}

/**
 * title: CategoryDragRequest
 */
export interface CategoryDragRequest {
  id?: string; // 分类id
  targetSortNum?: number; // 目标位置排序序号
}

/**
 * title: CategoryRequest
 */
export interface CategoryRequest {
  appId?: string; // 看板应用id
  module?: string; // 模块
  name?: string; // $column.comments
}

/**
 * title: CategoryResponse
 */
export interface CategoryResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  module?: string; // 模块
  name?: string; // $column.comments
  sortNum?: number; // 排序字段
  sysBuiltin?: number; // 是否系统内置字段
}

/**
 * title: ClassLoader
 */
export interface ClassLoader {
  definedPackages?: Array<Package>;
  name?: string;
  parent?: ClassLoader;
  registeredAsParallelCapable?: boolean;
  unnamedModule?: Module;
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
 * title: ColumnInformationSchema
 */
export interface ColumnInformationSchema {
  alias?: string; // 字段对应表列别名
  column?: string; // 字段对应表列
  columnType?: string; // 原始字段类型
  description?: string; // 描述信息
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
 * title: CrossReport
 */
export interface CrossReport {
  columnData?: object;
  columnSubTotalData?: object;
  rowData?: object;
  rowSubTotalData?: object;
}

/**
 * title: DashboardRequest
 */
export interface DashboardRequest {
  config?: string; // 仪表盘配置详情
  env?: string; // 环境
  name?: string; // 名称
  sortNum?: number; // 排序号
  source?: number; // 仪表盘来源 0：系统仪表盘 1：自建仪表盘
  status?: number; // 状态 0：未启用，1：已启用
  tenantId?: string; // 租户id
  username?: string; // 用户名
}

/**
 * title: DashboardResponse
 */
export interface DashboardResponse {
  config?: string; // 仪表盘配置详情
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境
  id?: string; // id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  sortNum?: number; // 排序号
  source?: number; // 仪表盘来源
  status?: number; // 状态
  tenantId?: string; // 租户id
  username?: string; // 用户名
}

/**
 * title: DashboardSortRequest
 */
export interface DashboardSortRequest {
  id: string; // 看板id主键
  targetSortNum: number; // 目标位置排序号
}

/**
 * title: DataBaseInformationSchema
 */
export interface DataBaseInformationSchema {
  name?: string; // 名称
}

/**
 * title: DataSource
 */
export interface DataSource {
  characterSet?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dbName?: string;
  deleted?: number;
  description?: string;
  driverClass?: string;
  enabled?: number;
  env?: string;
  id?: string;
  ip?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  password?: string;
  port?: number;
  tenantId?: string;
  type?: string;
  url?: string;
  userName?: string;
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
 * title: DataSourceDetailRequest
 */
export interface DataSourceDetailRequest {
  characterSet?: string; // 字符集
  dbName?: string; // 数据库名称
  driverClass?: string; // 连接驱动
  enabled?: number; // 是否启用
  env?: string; // 运行环境 dev:开发 test:测试 prod:生产
  id?: string; // uuid
  ip?: string; // ip地址
  password?: string; // 密码
  port?: number; // 端口号
  tenantId?: string; // 租户id
  url?: string; // 连接url
  userName?: string; // 用户名
}

/**
 * title: DataSourceDetailResponse
 */
export interface DataSourceDetailResponse {
  characterSet?: string; // 字符集
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dbName?: string; // 数据库名称
  driverClass?: string; // 连接驱动
  enabled?: number; // 是否启用
  env?: string; // 运行环境 dev:开发 test:测试 prod:生产
  id?: string; // uuid
  ip?: string; // ip地址
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  password?: string; // 密码
  port?: number; // 端口号
  tenantId?: string; // 租户id
  url?: string; // 连接url
  userName?: string; // 用户名
}

/**
 * title: DataSourceIsEnableRequest
 */
export interface DataSourceIsEnableRequest {
  enabled?: number; // 是否启用
  key?: string; // 数据源key
}

/**
 * title: DataSourceMainRequest
 */
export interface DataSourceMainRequest {
  description?: string; // 数据源描述
  detailList?: Array<DataSourceDetailRequest>; // 数据源信息明细
  key?: string; // 数据源key
  name?: string; // 数据源名称
  type?: string; // 数据库类型
}

/**
 * title: DataSourceMainResponse
 */
export interface DataSourceMainResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 数据源描述
  detailList?: Array<DataSourceDetailResponse>; // 数据源信息明细
  id?: string; // 主键
  key?: string; // 数据源key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 数据源名称
  type?: string; // 数据库类型
}

/**
 * title: DataSourcePageRequest
 */
export interface DataSourcePageRequest {
  enabled?: number; // 是否启用
  env?: string; // 应用环境 dev:开发 test:测试 prod:生产
  name?: string; // 数据源名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  tenantId?: string; // 租户id
}

/**
 * title: DataSourceUpdateRequest
 */
export interface DataSourceUpdateRequest {
  env?: string;
  key?: string;
  sql?: string;
}

/**
 * title: DataTraceRequest
 */
export interface DataTraceRequest {
  appId?: string; // 应用类型id
  beginCreateTime?: string; // 操作时间起
  createUserId?: string;
  dataId?: string; // 数据Id
  detail?: string; // 详细数据
  endCreateTime?: string; // 操作时间止
  module?: string; // 模块名称
  operateType?: string; // 操作类型
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  tenantId?: string; // 租户ID
  triggerType?: number; // 触发方式
  updateJson?: string; // 修改内容
}

/**
 * title: DataTraceResponse
 */
export interface DataTraceResponse {
  appId?: string; // 应用类型id
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
  tenantId?: string; // 租户ID
  triggerType?: number; // 触发方式
  updateJson?: string; // 修改内容
  userName?: string; // 用户账号
}

/**
 * title: DatasourceDevopsRequest
 */
export interface DatasourceDevopsRequest {
  appId?: string; // 应用id
  appName?: string; // 应用name
  env?: string; // 环境
  fieldKey?: string; // 索引字段
  fieldName?: string; // 索引字段名称
  indexName?: string; // 索引名称
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  status?: string; // 状态
  tenantId?: string; // 租户Id
}

/**
 * title: DatasourceDevopsResponse
 */
export interface DatasourceDevopsResponse {
  appId?: string; // 应用id
  appName?: string; // 应用name
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境
  fieldKey?: string; // 索引字段
  fieldName?: string; // 索引字段名称
  id?: string; // 主键
  indexName?: string; // 索引名称
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  status?: string; // 状态
  tenantId?: string; // 租户Id
}

/**
 * title: DatasourceExtDTO
 */
export interface DatasourceExtDTO {
  connectType?: string;
  databaseEncode?: string;
  databaseName?: string;
  databaseType?: string;
  dbName?: string; // 数据库名称
  driverClass?: string;
  id?: string; // 数据源id
  ip?: string;
  key?: string; // 数据源key
  name?: string; // 数据源名称
  password?: string;
  port?: number;
  schemaName?: string;
  type?: string; // 数据库类型
  url?: string;
  userName?: string;
}

/**
 * title: DatasourceMoveDataRequest
 */
export interface DatasourceMoveDataRequest {
  dataId?: string; // 数据Id
  moveDetailId?: string; // 数据迁移明细id
  reason?: string; // 失败原因
  status?: string; // 状态
}

/**
 * title: DatasourceMoveDataResponse
 */
export interface DatasourceMoveDataResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  dataId?: string; // 数据Id
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  moveDetailId?: string; // 数据迁移明细id
  reason?: string; // 失败原因
  status?: string; // 状态
  type?: string; // 类型
}

/**
 * title: DatasourceMoveDetailRequest
 */
export interface DatasourceMoveDetailRequest {
  branchId?: string; // 源branchId
  destEnv?: string; // 目的env
  in?: boolean; // 迁移数据id的方式 true:包含；false:排除
  modelKey?: string; // 模型key
  modelName?: string; // 模型name
  moveDataIds?: Array<string>; // 数据迁移数据id
  moveId?: string; // 数据迁移id
  name?: string; // 名称
  sourceEnv?: string; // 源env
  status?: string; // 状态
  type?: string; // 类型，system:系统模块;model:应用模型
}

/**
 * title: DatasourceMoveDetailResponse
 */
export interface DatasourceMoveDetailResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  moveDataIds?: string; // 数据迁移数据id
  moveId?: string; // 数据迁移id
  name?: string; // 名称
  status?: string; // 状态
  tenantId?: string; // 租户Id
  type?: string; // 类型
}

/**
 * title: DatasourceMoveRequest
 */
export interface DatasourceMoveRequest {
  appId?: string; // 应用id
  branchId?: string; // 源branchId
  createUserId?: string; // 迁移人id
  createUserName?: string; // 迁移人name
  destEnv?: string; // 目的env
  detailList?: Array<DatasourceMoveDetailRequest>; // 菜单/选择数据集合
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  sourceEnv?: string; // 源env
  status?: string; // 任务状态
  tenantId?: string; // 租户Id
}

/**
 * title: DatasourceMoveResponse
 */
export interface DatasourceMoveResponse {
  appId?: string; // 应用id
  appName?: string;
  branchId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  destEnv?: string; // 目的env
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  sourceEnv?: string; // 源env
  status?: string; // 任务状态
  tenantId?: string; // 租户Id
}

/**
 * title: DeviceInterconnectionParamRequest
 */
export interface DeviceInterconnectionParamRequest {
  key?: string; // 编码
  name?: string; // 名称
  remark?: string; // 备注
  type?: string; // 字段类型：String、Integer Long Float Boolean Date
}

/**
 * title: DeviceInterconnectionParamResponse
 */
export interface DeviceInterconnectionParamResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  key?: string; // 编码
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  remark?: string; // 备注
  tenantId?: string; // 租户id，此值为null时表示为内置参数：此时不可编辑删除
  type?: string; // 字段类型：String、Integer Long Float Boolean Date
}

/**
 * title: DeviceInterconnectionRequest
 */
export interface DeviceInterconnectionRequest {
  flowId?: string; // 连接流的id
  key: string; // 设备编码
  mapping: string; // 参数结构映射
  name: string; // 设备名称
  remark?: string; // 备注
  type: string; // 设备类型：MQTT、IPAAS
}

/**
 * title: DeviceInterconnectionResponse
 */
export interface DeviceInterconnectionResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  flowId?: string; // 连接流的id
  id?: string; // 主键
  key?: string; // 设备编码
  mapping?: string; // 参数结构映射
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 设备名称
  remark?: string; // 备注
  schema?: string; // 转换后的mapping
  tenantId?: string; // 租户id
  type?: string; // 设备类型：MQTT、IPAAS
}

/**
 * title: DeviceParamRefResponse
 */
export interface DeviceParamRefResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deviceId?: string; // 设备id
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  paramKey?: string; // 参数key
  tenantId?: string; // 租户id
}

/**
 * title: DingTalkConfig
 */
export interface DingTalkConfig {
  clientId?: string; // 企业ID
  enabled?: number; // 是否启用
  redirectURL?: string; // 重定向URL
  retryTimes?: number;
  secret?: string; // 应用secret
}

/**
 * title: Echart主题表实体类
 */
export interface Echart主题表实体类 {
  create_date?: string; // 创建时间
  id?: string; // 主键
  isSys?: string;
  is_sys?: string; // 是否是系统主题：0：不是；1：是
  jsonText?: string;
  json_text?: string; // 主题数据
  name?: string; // 主题名称
  remark?: string; // 备注
  userId?: string;
  user_id?: string; // 所属用户ID
}

/**
 * title: Echart图表主题查询参数
 */
export interface Echart图表主题查询参数 {
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
}

/**
 * title: Environment
 */
export interface Environment {
  activeProfiles?: Array<string>;
  defaultProfiles?: Array<string>;
}

/**
 * title: ExcelOrgUserSearchReq
 */
export interface ExcelOrgUserSearchReq {
  allUserOption?: number; // 是否显示下级
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  exportData?: boolean; // 是否导出数据(true/false)
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  orgId?: string; // 部门id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  source?: number; // 参数来源，0企业后台管理、1租户后台管理
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}

/**
 * title: ExcelUserSearchReq
 */
export interface ExcelUserSearchReq {
  endTime?: string; // 创建结束时间
  exportData?: boolean; // 是否导出数据(true/false)
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}

/**
 * title: ExprDTO
 */
export interface ExprDTO {
  alias?: string; // 字段名，最外层才有
  args?: Array<ExprDTO>; // 参数，当 type=FUNC 时才有
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
 * title: ExternalMessageRequest
 */
export interface ExternalMessageRequest {
  appTag?: string; // 应用标识
  content?: string; // 内容
  env?: string; // 环境 dev prod
  error?: string; // 错误信息
  notificationTime?: string; // 通知时间
  parameterJson?: string; // 参数json
  retry?: number; // 重试次数
  sent?: number; // 是否已发送
  successfulTime?: string; // 发送成功时间
  templateCode?: string; // 消息模版
  title?: string; // 标题
  to?: string; // 三方系统接收人
  toUser?: string; // 系统接收人
  type?: string; // 类型
}

/**
 * title: ExternalMessageResponse
 */
export interface ExternalMessageResponse {
  appTag?: string; // 应用标识
  content?: string; // 内容
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境 dev prod
  error?: string; // 错误信息
  id?: string; // id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  notificationTime?: string; // 通知时间
  parameterJson?: string; // 参数json
  retry?: number; // 重试次数
  sent?: number; // 是否已发送
  successfulTime?: string; // 发送成功时间
  templateCode?: string; // 消息模版
  title?: string; // 标题
  to?: string; // 三方系统接收人
  toUser?: string; // 系统接收人
  type?: string; // 类型
}

/**
 * title: FeiShuConfig
 */
export interface FeiShuConfig {
  appId?: string; // 企业ID
  enabled?: number; // 是否启用
  redirectURL?: string; // 重定向URL
  retryTimes?: number;
  secret?: string; // 应用secret
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
  defaultValueTips?: Array<string>; // 枚举默认值翻译
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
 * title: FilePreviewDTO
 */
export interface FilePreviewDTO {
  condition?: WhereRelation;
  datasetKey?: string; // 数据集key
  dateFieldStatistics?: boolean;
  fullSql?: string; // 完整的sql
  groupItems?: Array<SelectItem>;
  metricSelectItems?: Array<SelectItem>;
  orderValues?: object; // 自定义排序
  pageNo?: number;
  pageSize?: number;
  pageType?: boolean; // 分页类型，true:首行维度（第一列相同内容合并），false:所有维度
  rowSelectItems?: Array<SelectItem>;
  sorts?: Array<Sort>;
  where?: string; // where sql
}

/**
 * title: FileTaskBatchDownloadReq
 */
export interface FileTaskBatchDownloadReq {
  appTag?: string; // appTag
  urls?: Array<string>; // 需要下载的文件url集合
}

/**
 * title: FileTaskInfo
 */
export interface FileTaskInfo {
  appId?: string;
  branchId?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string;
  env?: string;
  fileType?: string;
  formTaskName?: string;
  id?: string;
  materialNo?: string;
  name?: string;
  params?: object;
  relationId?: string;
  relationType?: string;
  status?: string;
  tenantId?: string;
  url?: string;
}

/**
 * title: FileTaskRequest
 */
export interface FileTaskRequest {
  appId?: string; // 应用ID
  branchId?: string; // 分支id
  description?: string; // 备注
  env?: string; // 应用环境
  fileSize?: number; // 文件大小
  fileType?: string; // 文件类型
  formTaskName?: string; // 单据任务名称
  name?: string; // 名称
  relationId?: string; // 关联数据id(edhr实模板ID)
  relationType?: string; // 来源类型(EDHR/FORM)
  status?: string; // 文件生成状态(WAITING/PROCESSING/TIMEOUT/SUCCEED/FAIL)
  tenantId?: string; // 租户id
  url?: string; // 文件相对路径
}

/**
 * title: FileTaskResponse
 */
export interface FileTaskResponse {
  appId?: string; // 应用ID
  branchId?: string; // 分支id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  env?: string; // 应用环境
  failInfo?: string; // 失败信息
  fileSize?: number; // 文件大小
  fileType?: string; // 文件类型
  formTaskName?: string; // 单据任务名称
  id?: string; // ID
  materialNo?: string; // 批次号
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  params?: object;
  relationId?: string; // 关联数据id(edhr实模板ID)
  relationType?: string; // 来源类型(EDHR/FORM)
  status?: string; // 文件生成状态(WAITING/PROCESSING/TIMEOUT/SUCCEED/FAIL)
  tenantId?: string; // 租户id
  url?: string; // 文件相对路径
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
 * title: HttpQueryForm
 */
export interface HttpQueryForm {
  apiPath?: string;
  headers?: string;
  method?: string;
  postData?: string;
}

/**
 * title: I18nConfigRequest
 */
export interface I18nConfigRequest {
  configured?: number; // 是否配置: 0 否, 1 是
  defaultLanguage?: number; // 默认语言: 0 否, 1 是
  language?: string; // 语言
  languageTag?: string; // 语言标识
  state?: number; // 启用状态: 0 禁用, 1 启用
}

/**
 * title: I18nConfigResponse
 */
export interface I18nConfigResponse {
  configured?: number; // 是否配置: 0 否, 1 是
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  defaultLanguage?: number; // 默认语言: 0 否, 1 是
  id?: string; // 主键
  language?: string; // 语言
  languageTag?: string; // 语言标识
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  state?: number; // 启用状态: 0 禁用, 1 启用
}

/**
 * title: I18nInfo
 */
export interface I18nInfo {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  info?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  source?: string;
  type?: string;
}

/**
 * title: I18nInfoRequest
 */
export interface I18nInfoRequest {
  info?: string; // 资源内容
  source?: string; // 资源来源:(backend 后端, frontend 前段)
  type?: string; // 资源类型
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
 * title: ImportVersionRequest
 */
export interface ImportVersionRequest {
  appId?: string; // 应用id
  appPkgUrl?: string; // 应用包路径
  description?: string; // 说明
  mergeConflictList?: Array<MergeConflictDTO>; // 冲突解决列表
}

/**
 * title: InternalMessageRequest
 */
export interface InternalMessageRequest {
  appId?: string; // 应用标识
  branchId?: string; // 应用分支id
  content?: string; // 内容
  env?: string; // 环境 dev,test,prod
  title?: string; // 标题
}

/**
 * title: InternalMessageResponse
 */
export interface InternalMessageResponse {
  appId?: string; // 应用标识
  appName?: string; // 应用名称
  branchId?: string; // 应用分支id
  content?: string; // 内容
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境 dev,test,prod
  id?: string; // id
  jumpAddress?: string; //  跳转地址
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  read?: number; // 是否已读
  receiverId?: string; // 接收人id
  supportJump?: number; // 是否支持跳转
  supportProcess?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  title?: string; // 标题
  type?: string; // 消息分类(系统消息)
}

/**
 * title: KnowledgeBaseChunkRequest
 */
export interface KnowledgeBaseChunkRequest {
  content?: string; // 切片内容
  docId?: string; // 知识库ID
  index?: number; // 切片index
  metaData?: string; // 元数据
  status?: number; // 启用标记
  tags?: string; // 标签
  vectorDbVid?: string; // 向量数据库切片实体ID
}

/**
 * title: KnowledgeBaseChunkResponse
 */
export interface KnowledgeBaseChunkResponse {
  content?: string; // 切片内容
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  docId?: string; // 知识库ID
  id?: string; // $column.comments
  index?: number; // 切片index
  metaData?: string; // 元数据
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  status?: number; // 启用标记
  tags?: string; // 标签
  vectorDbVid?: string; // 向量数据库切片实体ID
}

/**
 * title: KnowledgeBaseDTO
 */
export interface KnowledgeBaseDTO {
  chunkSaveRdb?: number;
  converter?: string;
  description?: string;
  docCount?: number;
  embedModel?: string;
  icon?: string;
  id?: string;
  name?: string;
  reranker?: string;
  similarityThreshold?: string;
  splitter?: string;
  vectorDbCollection?: string;
}

/**
 * title: KnowledgeBaseDocRequest
 */
export interface KnowledgeBaseDocRequest {
  chunkCount?: number; // 切片数量
  converterError?: string; // 解析失败错误信息
  converterMirror?: string; // 解析器快照
  converterResultUrl?: string; // 解析结果，md文件minio的url
  converterRetryCount?: number; // 解析重试次数
  converterStatus?: string; // 解析状态
  ext?: string; // 文件扩展名，如pdf/docx/jpg/png等
  kbId?: string; // 知识库ID（索引）
  name?: string; // 文档名称
  splitterMirror?: string; // 切片器配置快照
  url?: string; // 文件URL
}

/**
 * title: KnowledgeBaseDocResponse
 */
export interface KnowledgeBaseDocResponse {
  chunkCount?: number; // 切片数量
  converterError?: string; // 解析失败错误信息
  converterMirror?: string; // 解析器快照
  converterResultUrl?: string; // 解析结果，md文件minio的url
  converterRetryCount?: number; // 解析重试次数
  converterStatus?: string; // 解析状态
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  ext?: string; // 文件扩展名，如pdf/docx/jpg/png等
  id?: string; // $column.comments
  kbId?: string; // 知识库ID（索引）
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 文档名称
  splitterMirror?: string; // 切片器配置快照
  url?: string; // 文件URL
}

/**
 * title: KnowledgeBaseRequest
 */
export interface KnowledgeBaseRequest {
  chunkSaveRdb?: number; // 切片是否存储到关系数据库
  converter?: string; // 文档解析器以及配置
  description?: string; // 描述
  docCount?: number; // 知识库文档数量
  embedModel?: string; // 嵌入模型模型ID
  icon?: string; // 知识库图标
  name?: string; // 名称
  reranker?: string; // 重排设置，json
  similarityThreshold?: string; // 相似度阈值
  splitter?: string; // 切片器以及配置
  vectorDbCollection?: string; // 向量数据库collection
}

/**
 * title: KnowledgeBaseResponse
 */
export interface KnowledgeBaseResponse {
  chunkSaveRdb?: number; // 切片是否存储到关系数据库
  converter?: string; // 文档解析器以及配置
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  docCount?: number; // 知识库文档数量
  embedModel?: string; // 嵌入模型模型ID
  icon?: string; // 知识库图标
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  reranker?: string; // 重排设置，json
  similarityThreshold?: string; // 相似度阈值
  splitter?: string; // 切片器以及配置
  vectorDbCollection?: string; // 向量数据库collection
}

/**
 * title: LicenseAuthRequest
 */
export interface LicenseAuthRequest {
  appId?: string; // 应用Id
  appKey?: string; // 应用Key
  authorizationCode?: string; // 激活码
  env?: string; // 授权环境
  version?: string; // 平台版本
}

/**
 * title: LicenseDTO
 */
export interface LicenseDTO {
  appId?: string;
  category?: string;
  customerName?: string;
  effectiveDate?: string;
  env?: string;
  expirationDate?: string;
  id?: string;
  productName?: string;
  productType?: string;
  state?: number;
}

/**
 * title: LicenseExpireMsg
 */
export interface LicenseExpireMsg {
  category?: string; // 授权类别 系统授权：system 增购：additional
  expireDays?: number; // 剩余天数
  id?: string;
  productType?: string; // 产品类型
  type?: number; // 消息类别, 1：已到期提醒，0：快到期提醒
}

/**
 * title: LicenseLimitResponse
 */
export interface LicenseLimitResponse {
  licenseId?: string; // 授权信息id
  limit?: number; // 是否限制 0: 不限制 1: 限制
  limitType?: string; // 限制类型
  qty?: number; // 限制数量
}

/**
 * title: LicenseUnbindLogRequest
 */
export interface LicenseUnbindLogRequest {
  licenseId?: string; // 授权id
}

/**
 * title: LoginLogResponse
 */
export interface LoginLogResponse {
  createTime?: string; // 创建时间
  createUserId?: string; // 创建人ID
  createUserName?: string; // 创建人
  description?: string; // 登录失败原因
  id?: string; // ID
  ip?: string; // ip地址
  loginStatus?: string; // 状态(成功:succeed,失败:failure)
  source?: string; // 客户端来源(WEB,MOBILE)
  userAgent?: string; // 浏览器代理
}

/**
 * title: LoginModeConfig
 */
export interface LoginModeConfig {
  address?: string; // 域服务地址
  authType?: string; // 登录方式类型 枚举(ACCOUNT/ 账号登录,DOMAIN_ACCOUNT/域账号密码登录,MOBILE,CARD:刷卡登录)
  certificate?: string; // 证书文件
  domainSuffix?: string; // 域后缀
  enabled?: number; // 是否启用
  ldaps?: number; // 启用LDAPS
  relationField?: string; // 域账号关联字段(username_/账号,emp_no_/工号,mobile_/手机号码)
  relationFieldName?: string; // 域账号关联字段名称，冗余前端显示用
  smsKey?: string; // 授权key
  smsKeySecret?: string; // 授权secret
  smsSdkAppId?: string; // 短信appid
  smsServiceProvider?: string; // 短信服务商
  smsSignName?: string; // 短信签名
  smsTemplateCode?: string; // 短信模板代码
}

/**
 * title: MailConfig
 */
export interface MailConfig {
  connectionTimeout?: number;
  enabled?: number;
  fromMail?: string;
  host?: string;
  password?: string;
  port?: number;
  retryTimes?: number;
  ssl?: boolean;
  timeout?: number;
  userName?: string;
}

/**
 * title: ManagerBean
 */
export interface ManagerBean {
  createTime?: string; // 创建时间
  createUserId?: string; // 创建人Id
  createUserName?: string; // 创建人
  description?: string; // 备注
  fullname?: string; // 姓名
  modifyTime?: string; // 修改时间
  modifyUserId?: string; // 修改人id
  modifyUserName?: string; // 修改人
  roles?: Array<RoleBase>; // 角色列表
  userId?: string; // 用户id
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
 * title: MessageSettingCountResponse
 */
export interface MessageSettingCountResponse {
  dingTalkCount?: number; // 钉钉配置数量
  emailCount?: number; // 邮件配置数量
  feishuCount?: number; // 飞书配置数量
  wxWorkCount?: number; // 企业微信配置数量
}

/**
 * title: MessageSettingRequest
 */
export interface MessageSettingRequest {
  agentid?: string; // 微信、钉钉应用标识
  appkey?: string; // 钉钉企业内部应用标识
  corpid?: string; // 飞书、微信、钉钉企业id
  key?: string; // key
  name?: string; // 名称
  password?: string; // 密码
  remark?: string; // 备注
  secret?: string; // 飞书、微信、钉钉应用密钥
  sendEmail?: string; // 发送者邮箱
  serviceIp?: string; // 主机地址ip
  serviceType?: string; // 服务类型
  ssl?: number; // 是否启用ssl
  timeout?: number; // 超时时间
  type?: string; // 消息分类
  userName?: string; // 账户
}

/**
 * title: MessageSettingResponse
 */
export interface MessageSettingResponse {
  agentid?: string; // 微信、钉钉应用标识
  appkey?: string; // 钉钉企业内部应用标识
  corpid?: string; // 飞书、微信、钉钉企业id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  key?: string; // key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  password?: string; // 密码
  remark?: string; // 备注
  secret?: string; // 飞书、微信、钉钉应用密钥
  sendEmail?: string; // 发送者邮箱
  serviceIp?: string; // 主机地址ip
  serviceType?: string; // 服务类型
  ssl?: number; // 是否启用ssl
  tenantId?: string; // 租户ID
  timeout?: number; // 超时时间
  type?: string; // 消息分类
  userName?: string; // 账户
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
 * title: ModelDTO
 */
export interface ModelDTO {
  apiKey?: string;
  apiUrl?: string;
  baseUrl?: string;
  id?: string;
  label?: string;
  modelId?: string;
  modelType?: string;
  openaiApiCompatible?: number;
  properties?: string;
  providerId?: string;
  providerName?: string;
}

/**
 * title: ModelProviderRequest
 */
export interface ModelProviderRequest {
  apiHost?: string; // api_host_
  apiKey?: string; // api_key_
  description?: string; // 供应商描述
  label?: string; // 标题
  name?: string; // 供应商名称
  type?: string; // 供应商类型:built-in、cloud
}

/**
 * title: ModelProviderResponse
 */
export interface ModelProviderResponse {
  apiHost?: string; // api_host_
  apiKey?: string; // api_key_
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 供应商描述
  id?: string; // $column.comments
  label?: string; // 标题
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 供应商名称
  type?: string; // 供应商类型:built-in、cloud
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
 * title: ModelRequest
 */
export interface ModelRequest {
  apiKey?: string; // api_key_
  apiUrl?: string; // api_url_
  baseUrl?: string; // base_url_
  label?: string; // 标题
  modelId?: string; // 模型ID（注意：各平台不一致)，如 deepseek-r1
  modelType?: string; // 模型类型：llm/embeding/rerank/tts/asr
  openaiApiCompatible?: number; // 是否openai api兼容
  properties?: string; // 模型属性
  providerId?: string; // 供应商id
  providerName?: string; // 供应商名称
}

/**
 * title: ModelResponse
 */
export interface ModelResponse {
  apiKey?: string; // api_key_
  apiUrl?: string; // api_url_
  baseUrl?: string; // base_url_
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  label?: string; // 标题
  modelId?: string; // 模型ID（注意：各平台不一致)，如 deepseek-r1
  modelType?: string; // 模型类型：llm/embeding/rerank/tts/asr
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  openaiApiCompatible?: number; // 是否openai api兼容
  properties?: string; // 模型属性
  providerId?: string; // 供应商id
  providerName?: string; // 供应商名称
}

/**
 * title: Module
 */
export interface Module {
  annotations?: Array<Annotation>;
  classLoader?: ClassLoader;
  declaredAnnotations?: Array<Annotation>;
  descriptor?: ModuleDescriptor;
  layer?: ModuleLayer;
  name?: string;
  named?: boolean;
  packages?: Array<string>;
}

/**
 * title: ModuleDescriptor
 */
export interface ModuleDescriptor {
  automatic?: boolean;
  open?: boolean;
}

/**
 * title: ModuleLayer
 */
export interface ModuleLayer {

}

/**
 * title: MqttPropertiesDTO
 */
export interface MqttPropertiesDTO {
  password?: string; // 密码
  username?: string; // 用户名
}

/**
 * title: NavMenuRequest
 */
export interface NavMenuRequest {
  designerJson?: string; // 页面设计json
  name?: string; // 菜单名称
  runtimeJson?: string; // 运行时json
  selected?: number; // 选中 1: 未选中 0
}

/**
 * title: NavMenuResponse
 */
export interface NavMenuResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number; // 是否删除
  designerJson?: string; // 页面设计json
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 菜单名称
  runtimeJson?: string; // 运行时json
  selected?: number; // 选中 1: 未选中 0
}

/**
 * title: NavPageRequest
 */
export interface NavPageRequest {
  designerJson?: string; // 页面设计json
  name?: string; // 名称
  runtimeJson?: string; // 运行时json
}

/**
 * title: NavPageResponse
 */
export interface NavPageResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  designerJson?: string; // 页面设计json
  id?: string; // id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  runtimeJson?: string; // 运行时json
  tenantId?: string; // 租户id
}

/**
 * title: OpenapiAggregateByModelTreeResponse
 */
export interface OpenapiAggregateByModelTreeResponse {
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  openapiAggregates?: Array<OpenapiAggregateResponse>; // 接口集合
}

/**
 * title: OpenapiAggregateResponse
 */
export interface OpenapiAggregateResponse {
  bsKey?: string; // 服务key
  description?: string; // 接口描述
  id?: string; // id
  key?: string; // 接口key
  method?: string; // 请求方法
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  name?: string; // 接口名称
  url?: string; // 请求路径
}

/**
 * title: OpenapiAuthorization
 */
export interface OpenapiAuthorization {
  appId?: string; // appId及appTag
  appName?: string; // appName
  bsKey?: string; // 服务key
  description?: string; // 接口描述
  id?: string; // id
  key?: string; // 接口key
  method?: string; // 请求方法
  modelCategory?: string; // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
  modelKey?: string; // 模型key
  modelName?: string; // 模型名称
  name?: string; // 接口名称
  url?: string; // 请求路径
}

/**
 * title: OpenapiAuthorizationSetRequest
 */
export interface OpenapiAuthorizationSetRequest {
  accessUserId?: string; // 授权用户id
  accessUserName?: string; // 授权用户名称
  prodApis?: Array<OpenapiAuthorization>; // prod_api集合json
  tenantApis?: Array<OpenapiTenant>; // 租户api集合json
  testApis?: Array<OpenapiAuthorization>; // test api集合json
}

/**
 * title: OpenapiDto
 */
export interface OpenapiDto {
  bsKey?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  i18nConfig?: string;
  id?: string;
  key?: string;
  method?: string;
  modelCategory?: string;
  modelKey?: string;
  modelName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  url?: string;
}

/**
 * title: OpenapiGroupRequest
 */
export interface OpenapiGroupRequest {
  appId?: string; // 应用id
  enabled?: string; // 启用禁用状态
  env?: string; // 所属环境
  opened?: string; // 是否有开放api
  tenantId?: string; // 租户id
}

/**
 * title: OpenapiGroupResponse
 */
export interface OpenapiGroupResponse {
  appId?: string; // 应用id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 应用描述
  enabled?: string; // 启用禁用状态
  env?: string; // 所属环境
  id?: string; // id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 应用名称
  opened?: string; // 是否有开放api
  tenantId?: string; // 租户id
}

/**
 * title: OpenapiKeyGrantResponse
 */
export interface OpenapiKeyGrantResponse {
  accessUserId?: string; // 授权用户id
  accessUserName?: string; // 授权用户名称
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // id
  key?: string; // 访问key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  prodApis?: Array<OpenapiAuthorization>; // prod_api集合json
  secret?: string; // 访问secret
  tenantApis?: Array<OpenapiTenant>; // 租户api集合json
  tenantId?: string; // 租户id
  testApis?: Array<OpenapiAuthorization>; // test api集合json
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
 * title: OpenapiTenant
 */
export interface OpenapiTenant {
  key?: string;
  name?: string;
}

/**
 * title: OrderItem
 */
export interface OrderItem {
  asc?: boolean;
  column?: string;
}

/**
 * title: Org
 */
export interface Org {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  fullPath?: string;
  id?: string;
  identifier?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  parentId?: string;
  sortNum?: number;
  tenantId?: string;
  type?: string;
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
 * title: OrgBaseInfo
 */
export interface OrgBaseInfo {
  createTime?: string;
  fullPath?: string;
  fullPathName?: string;
  id?: string;
  name?: string;
  parentId?: string;
  type?: string;
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
  requiredFields?: Array<string>; // 必填字段/字段key(empNo/工号,mobile/手机号,email/邮箱)
  supportLoginFields?: Array<string>; // 支持登录字段/字段key(username_/账号,emp_no_/工号,mobile_/手机号码,ext1_/扩展字段1)
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
  userIds?: Array<string>; // 用户id集合
}

/**
 * title: OrgPrincipal
 */
export interface OrgPrincipal {
  orgId?: string;
  principal?: string;
}

/**
 * title: OrgRemoveUserRequest
 */
export interface OrgRemoveUserRequest {
  orgId?: string; // 组织id
  userIds?: Array<string>; // 用户id集合
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
  orgNames?: Array<string>; // 所属部门名称
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
 * title: OrgUserSearchRequest
 */
export interface OrgUserSearchRequest {
  allUserOption?: number; // 是否显示下级
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  orgId?: string; // 部门id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  source?: number; // 参数来源，0企业后台管理、1租户后台管理
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}

/**
 * title: Package
 */
export interface Package {
  annotations?: Array<Annotation>;
  declaredAnnotations?: Array<Annotation>;
  implementationTitle?: string;
  implementationVendor?: string;
  implementationVersion?: string;
  name?: string;
  sealed?: boolean;
  specificationTitle?: string;
  specificationVendor?: string;
  specificationVersion?: string;
}

/**
 * title: PackageJson
 */
export interface PackageJson {
  client?: string;
  description?: string;
  icon?: string;
  kit?: string;
  label?: string;
  name?: string;
  platform?: Array<string>;
  readMe?: string;
  screenShot?: string;
  tag?: string;
  tmpPath?: string;
  version?: string;
  zipUrl?: string;
}

/**
 * title: PageBase«AcLicenseResponse»
 */
export interface PageBaseAcLicenseResponse {
  data?: Array<AcLicenseResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«AgentResponse»
 */
export interface PageBaseAgentResponse {
  data?: Array<AgentResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«AppMemberResponse»
 */
export interface PageBaseAppMemberResponse {
  data?: Array<AppMemberResponse>; // 数据
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
 * title: PageBase«AppResponse»
 */
export interface PageBaseAppResponse {
  data?: Array<AppResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«AssetsResponse»
 */
export interface PageBaseAssetsResponse {
  data?: Array<AssetsResponse>; // 数据
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
 * title: PageBase«BiDataSetResponse»
 */
export interface PageBaseBiDataSetResponse {
  data?: Array<BiDataSetResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«BiFileDatasetConfigResponse»
 */
export interface PageBaseBiFileDatasetConfigResponse {
  data?: Array<BiFileDatasetConfigResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«BiShareResponse»
 */
export interface PageBaseBiShareResponse {
  data?: Array<BiShareResponse>; // 数据
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
 * title: PageBase«DataSourceMainResponse»
 */
export interface PageBaseDataSourceMainResponse {
  data?: Array<DataSourceMainResponse>; // 数据
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
 * title: PageBase«DatasourceDevopsResponse»
 */
export interface PageBaseDatasourceDevopsResponse {
  data?: Array<DatasourceDevopsResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DatasourceMoveDataResponse»
 */
export interface PageBaseDatasourceMoveDataResponse {
  data?: Array<DatasourceMoveDataResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DatasourceMoveDetailResponse»
 */
export interface PageBaseDatasourceMoveDetailResponse {
  data?: Array<DatasourceMoveDetailResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DatasourceMoveResponse»
 */
export interface PageBaseDatasourceMoveResponse {
  data?: Array<DatasourceMoveResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DeviceInterconnectionParamResponse»
 */
export interface PageBaseDeviceInterconnectionParamResponse {
  data?: Array<DeviceInterconnectionParamResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DeviceInterconnectionResponse»
 */
export interface PageBaseDeviceInterconnectionResponse {
  data?: Array<DeviceInterconnectionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«DeviceParamRefResponse»
 */
export interface PageBaseDeviceParamRefResponse {
  data?: Array<DeviceParamRefResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ExternalMessageResponse»
 */
export interface PageBaseExternalMessageResponse {
  data?: Array<ExternalMessageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«FileTaskResponse»
 */
export interface PageBaseFileTaskResponse {
  data?: Array<FileTaskResponse>; // 数据
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
 * title: PageBase«InternalMessageResponse»
 */
export interface PageBaseInternalMessageResponse {
  data?: Array<InternalMessageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«KnowledgeBaseChunkResponse»
 */
export interface PageBaseKnowledgeBaseChunkResponse {
  data?: Array<KnowledgeBaseChunkResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«KnowledgeBaseDocResponse»
 */
export interface PageBaseKnowledgeBaseDocResponse {
  data?: Array<KnowledgeBaseDocResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«KnowledgeBaseResponse»
 */
export interface PageBaseKnowledgeBaseResponse {
  data?: Array<KnowledgeBaseResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«LoginLogResponse»
 */
export interface PageBaseLoginLogResponse {
  data?: Array<LoginLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ManagerBean»
 */
export interface PageBaseManagerBean {
  data?: Array<ManagerBean>; // 数据
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
 * title: PageBase«MessageSettingResponse»
 */
export interface PageBaseMessageSettingResponse {
  data?: Array<MessageSettingResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ModelProviderResponse»
 */
export interface PageBaseModelProviderResponse {
  data?: Array<ModelProviderResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ModelResponse»
 */
export interface PageBaseModelResponse {
  data?: Array<ModelResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«NavMenuResponse»
 */
export interface PageBaseNavMenuResponse {
  data?: Array<NavMenuResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«NavPageResponse»
 */
export interface PageBaseNavPageResponse {
  data?: Array<NavPageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OpenapiGroupResponse»
 */
export interface PageBaseOpenapiGroupResponse {
  data?: Array<OpenapiGroupResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«OpenapiKeyGrantResponse»
 */
export interface PageBaseOpenapiKeyGrantResponse {
  data?: Array<OpenapiKeyGrantResponse>; // 数据
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
 * title: PageBase«PluginResponse»
 */
export interface PageBasePluginResponse {
  data?: Array<PluginResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PluginVersionResponse»
 */
export interface PageBasePluginVersionResponse {
  data?: Array<PluginVersionResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmProcessDelegateDetailResponse»
 */
export interface PageBasePmProcessDelegateDetailResponse {
  data?: Array<PmProcessDelegateDetailResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmProcessDelegateResponse»
 */
export interface PageBasePmProcessDelegateResponse {
  data?: Array<PmProcessDelegateResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmProcessInstanceResponse»
 */
export interface PageBasePmProcessInstanceResponse {
  data?: Array<PmProcessInstanceResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmTaskDoneResponse»
 */
export interface PageBasePmTaskDoneResponse {
  data?: Array<PmTaskDoneResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PmTaskTodoResponse»
 */
export interface PageBasePmTaskTodoResponse {
  data?: Array<PmTaskTodoResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PnDatasetLogResponse»
 */
export interface PageBasePnDatasetLogResponse {
  data?: Array<PnDatasetLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PnDatasetResponse»
 */
export interface PageBasePnDatasetResponse {
  data?: Array<PnDatasetResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PnPageResponse»
 */
export interface PageBasePnPageResponse {
  data?: Array<PnPageResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«PnProjectResponse»
 */
export interface PageBasePnProjectResponse {
  data?: Array<PnProjectResponse>; // 数据
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
 * title: PageBase«PublishedAppDtoResponse»
 */
export interface PageBasePublishedAppDtoResponse {
  data?: Array<PublishedAppDtoResponse>; // 数据
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
 * title: PageBase«SealManagementResponse»
 */
export interface PageBaseSealManagementResponse {
  data?: Array<SealManagementResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ShortcutMenuResponse»
 */
export interface PageBaseShortcutMenuResponse {
  data?: Array<ShortcutMenuResponse>; // 数据
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
 * title: PageBase«StartedProcessResponse»
 */
export interface PageBaseStartedProcessResponse {
  data?: Array<StartedProcessResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TaskDelegateResponse»
 */
export interface PageBaseTaskDelegateResponse {
  data?: Array<TaskDelegateResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TaskDoneResponse»
 */
export interface PageBaseTaskDoneResponse {
  data?: Array<TaskDoneResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TaskTodoResponse»
 */
export interface PageBaseTaskTodoResponse {
  data?: Array<TaskTodoResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«TenantDeveloperDTO»
 */
export interface PageBaseTenantDeveloperDTO {
  data?: Array<TenantDeveloperDTO>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«ThirdPartyInvokeLogResponse»
 */
export interface PageBaseThirdPartyInvokeLogResponse {
  data?: Array<ThirdPartyInvokeLogResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«UserExtraResponse»
 */
export interface PageBaseUserExtraResponse {
  data?: Array<UserExtraResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«UserInfoLogResponse»
 */
export interface PageBaseUserInfoLogResponse {
  data?: Array<UserInfoLogResponse>; // 数据
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
 * title: PageBase«UserPasswordHistoryResponse»
 */
export interface PageBaseUserPasswordHistoryResponse {
  data?: Array<UserPasswordHistoryResponse>; // 数据
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
 * title: PageBase«WorkbenchComponentRelationResponse»
 */
export interface PageBaseWorkbenchComponentRelationResponse {
  data?: Array<WorkbenchComponentRelationResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: PageBase«WorkbenchComponentResponse»
 */
export interface PageBaseWorkbenchComponentResponse {
  data?: Array<WorkbenchComponentResponse>; // 数据
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/**
 * title: Page«Map«string,object»»
 */
export interface PageMapstringobject {
  countId?: string;
  current?: number;
  maxLimit?: number;
  optimizeCountSql?: boolean;
  orders?: Array<OrderItem>;
  pages?: number;
  records?: Array<object>;
  searchCount?: boolean;
  size?: number;
  total?: number;
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
 * title: PasswordInfo
 */
export interface PasswordInfo {
  expireTime?: string; // 失效日期
  needChangePass?: boolean; // 是否需要更换密码
  needChangeSignPass?: boolean; // 是否需要更换签名密码
  needSetSignPass?: boolean; // 是否需要更换签名密码
  passModifyTime?: string; // 上次修改密码的时间
  signExpireTime?: string; // 签名密码失效日期
  signPassModifyTime?: string; // 上次修改密码的时间
}

/**
 * title: PermissionRequest
 */
export interface PermissionRequest {
  area?: string; // 端 (平台 BACKEND_MANAGEMENT,租户管理后台 TENANT_CENTER)
  description?: string; // 备注
  parentId?: string; // 父节点id
  type?: string; // 权限分类(MENU:菜单 ,BUTTON:按钮)
}

/**
 * title: PermissionResponse
 */
export interface PermissionResponse {
  area?: string; // 端 (平台 BACKEND_MANAGEMENT,租户管理后台 TENANT_CENTER)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  parentId?: string; // 父节点id
  type?: string; // 权限分类(MENU:菜单 ,BUTTON:按钮)
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
 * title: Plugin
 */
export interface Plugin {
  categoryId?: string;
  client?: string;
  clients?: Array<string>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  icon?: string;
  id?: string;
  key?: string;
  keyWord?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  readMe?: string;
  screenShot?: string;
  tag?: string;
  tags?: Array<string>;
  tenantId?: string;
  tmpPath?: string;
  url?: string;
  version?: string;
  zipUrl?: string;
}

/**
 * title: PluginRequest
 */
export interface PluginRequest {
  categoryId?: string; // 分类Id
  client?: string; // 支持客户端
  description?: string; // 版本说明
  icon?: string; // 组件图标
  id?: string; // id
  ids?: string; // ids
  key?: string; // 组件key
  keyWord?: string;
  name?: string; // 最新名称
  pageNo?: number;
  pageSize?: number;
  readMe?: string;
  screenShot?: string; // 组件截图
  tag?: string; // 标识
  tenantId?: string; // 租户ID
  tmpPath?: string;
  url?: string; // 最新文件地址
  version?: string; // 最新版本号
  zipUrl?: string; // zip文件地址
}

/**
 * title: PluginResponse
 */
export interface PluginResponse {
  categoryId?: string; // 分类Id
  client?: string; // 支持客户端
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 版本说明
  icon?: string; // 组件图标
  id?: string; // 主键
  key?: string; // 组件key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 最新名称
  readMe?: string; // readme文件地址
  screenShot?: string; // 组件截图
  tag?: string; // 标识
  tenantId?: string; // 租户ID
  url?: string; // 最新文件地址
  version?: string; // 最新版本号
  zipUrl?: string; // zip文件地址
}

/**
 * title: PluginTenant
 */
export interface PluginTenant {
  category?: Category;
  plugins?: Array<Plugin>;
}

/**
 * title: PluginVersionRequest
 */
export interface PluginVersionRequest {
  client?: string; // 支持客户端
  description?: string; // 版本说明
  icon?: string; // 组件图标
  key?: string; // 组件key
  latest?: number; // 是否最新版本
  name?: string; // 名称
  pluginId?: string; // 页面组件id
  screenShot?: string; // 组件截图
  tag?: string; // 标识
  tenantId?: string; // 租户ID
  version?: string; // 版本号
  zipUrl?: string; // zip文件地址
}

/**
 * title: PluginVersionResponse
 */
export interface PluginVersionResponse {
  client?: string; // 支持客户端
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 版本说明
  icon?: string; // 组件图标
  id?: string; // 主键
  key?: string; // 组件key
  latest?: number; // 是否最新版本
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 名称
  pluginId?: string; // 页面组件id
  readMe?: string; // readme文件地址
  screenShot?: string; // 组件截图
  tag?: string; // 标识
  tenantId?: string; // 租户ID
  version?: string; // 版本号
  zipUrl?: string; // zip文件地址
}

/**
 * title: PmProcessDelegateDetailRequest
 */
export interface PmProcessDelegateDetailRequest {
  appTag?: string; // 应用标识
  procDefId?: string; // 流程定义id
  taskDelegateId?: string; // 托管ID
}

/**
 * title: PmProcessDelegateDetailResponse
 */
export interface PmProcessDelegateDetailResponse {
  appTag?: string; // 应用标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  procDefId?: string; // 流程定义id
  taskDelegateId?: string; // 托管ID
}

/**
 * title: PmProcessDelegateRequest
 */
export interface PmProcessDelegateRequest {
  delegateAll?: number; // 代理所有流程
  delegateUserId?: string; // 被托管人ID
  endAt?: string; // 结束时间
  envTag?: string; // 环境
  ownerId?: string; // 所有人ID
  startAt?: string; // 开始时间
  tenantId?: string; // 租户Id
}

/**
 * title: PmProcessDelegateResponse
 */
export interface PmProcessDelegateResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  delegateAll?: number; // 代理所有流程
  delegateUserId?: string; // 被托管人ID
  endAt?: string; // 结束时间
  envTag?: string; // 环境
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ownerId?: string; // 所有人ID
  startAt?: string; // 开始时间
  tenantId?: string; // 租户Id
}

/**
 * title: PmProcessInstanceRequest
 */
export interface PmProcessInstanceRequest {
  appTag?: string; // 应用标识
  assigneeNames?: string; // 处理人名称
  assignees?: string; // 当前处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  dataId?: string; // 关联数据ID
  endTime?: string; // 结束时间
  envTag?: string; // 环境
  initiator?: string; // 发起人
  modelKey?: string; // 关联数据模型key
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  result?: string; // 结果(Normal|rollback|Rejected|withdraw)
  startTime?: string; // 开始时间
  status?: string; // 状态(Running|finished)
  taskKeys?: string; // 节点key
  taskNames?: string; // 节点名称
  tenantId?: string; // 租户ID
  title?: string; // 标题
}

/**
 * title: PmProcessInstanceResponse
 */
export interface PmProcessInstanceResponse {
  appTag?: string; // 应用标识
  assigneeNames?: string; // 处理人名称
  assignees?: string; // 当前处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  dataId?: string; // 关联数据ID
  endTime?: string; // 结束时间
  envTag?: string; // 环境
  id?: string; // 主键
  initiator?: string; // 发起人
  modelKey?: string; // 关联数据模型key
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  result?: string; // 结果(Normal、rollback、Rejected、withdraw)
  startTime?: string; // 开始时间
  status?: string; // 状态(Running|finished)
  taskKeys?: string; // 节点key
  taskNames?: string; // 节点名称
  tenantId?: string; // 租户ID
  title?: string; // 标题
}

/**
 * title: PmTaskDoneRequest
 */
export interface PmTaskDoneRequest {
  appTag?: string; // 应用标识
  assignee?: string; // 处理人
  envTag?: string; // 环境 dev prod
  initiator?: string; // 发起人Id
  initiatorName?: string; // 发起人姓名
  initiatorOrgId?: string; // 发起人主部门ID
  initiatorOrgName?: string; // 发起人主部门名称
  operator?: string; // 实际操作人
  owner?: string; // 任务所有人(委托时使用)
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  processInstanceId?: string; // 流程实例ID
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务ID,task对应Id
  taskKey?: string; // 节点Id,xml中对应的activity id
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
  tenantId?: string; // 租户ID
  title?: string; // 标题
  todoId?: string; // gct_pm_task_todo 表id_
}

/**
 * title: PmTaskDoneResponse
 */
export interface PmTaskDoneResponse {
  appTag?: string; // 应用标识
  assignee?: string; // 处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  envTag?: string; // 环境 dev prod
  id?: string; // 主键
  initiator?: string; // 发起人Id
  initiatorName?: string; // 发起人姓名
  initiatorOrgId?: string; // 发起人主部门ID
  initiatorOrgName?: string; // 发起人主部门名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  operator?: string; // 实际操作人
  owner?: string; // 任务所有人(委托时使用)
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  processInstanceId?: string; // 流程实例ID
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务ID,task对应Id
  taskKey?: string; // 节点Id,xml中对应的activity id
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
  tenantId?: string; // 租户ID
  title?: string; // 标题
  todoId?: string; // gct_pm_task_todo 表id_
}

/**
 * title: PmTaskTodoRequest
 */
export interface PmTaskTodoRequest {
  appTag?: string; // 应用标识
  assignee?: string; // 处理人
  envTag?: string; // 环境 dev prod
  initiator?: string; // 发起人Id
  initiatorName?: string; // 发起人姓名
  initiatorOrgId?: string; // 发起人主部门ID
  initiatorOrgName?: string; // 发起人主部门名称
  owner?: string; // 任务所有人(委托时使用)
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  processInstanceId?: string; // 流程实例ID
  taskId?: string; // 任务ID,task对应Id
  taskKey?: string; // 节点Id,xml中对应的activity id
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
  tenantId?: string; // 租户ID
  title?: string; // 标题
}

/**
 * title: PmTaskTodoResponse
 */
export interface PmTaskTodoResponse {
  appTag?: string; // 应用标识
  assignee?: string; // 处理人
  combinedStatus?: string; // 状态和结果结合后的状态枚举
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  envTag?: string; // 环境 dev prod
  id?: string; // 主键
  initiator?: string; // 发起人Id
  initiatorName?: string; // 发起人姓名
  initiatorOrgId?: string; // 发起人主部门ID
  initiatorOrgName?: string; // 发起人主部门名称
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  owner?: string; // 任务所有人(委托时使用)
  procDefId?: string; // 流程定义id
  procDefName?: string; // 流程定义名称
  procDefVer?: string; // 流程版本
  procDefVerId?: string; // 流程版本id
  processInstanceId?: string; // 流程实例ID
  taskId?: string; // 任务ID,task对应Id
  taskKey?: string; // 节点Id,xml中对应的activity id
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
  tenantId?: string; // 租户ID
  title?: string; // 标题
}

/**
 * title: PnDataset
 */
export interface PnDataset {
  biConfigId?: string;
  categoryId?: string;
  categoryName?: string;
  config?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  databaseId?: string;
  databaseName?: string;
  databaseType?: string;
  deleted?: number;
  designSql?: string;
  fileUrl?: string;
  fullSql?: string;
  id?: string;
  key?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  orderValues?: object; // 自定义排序
  script?: string;
  sorts?: Array<Sort>;
  type?: string;
}

/**
 * title: PnDatasetLogRequest
 */
export interface PnDatasetLogRequest {
  datasetId?: string; // 数据集id
  script?: string; // 自定义sql
}

/**
 * title: PnDatasetLogResponse
 */
export interface PnDatasetLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  datasetId?: string; // 数据集id
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  requestype?: number; // API的调用方式 0:全量覆盖 1:全量追加 2:增量抽取 3:直连
  script?: string; // 自定义sql
}

/**
 * title: PnDatasetRequest
 */
export interface PnDatasetRequest {
  biConfigId?: string; // 数据源配置id
  categoryId?: string; // 分类Id
  config?: string; // 预览配置
  databaseId?: string; // 数据源id
  databaseType?: string; // 数据源类型(数据库数据源DB、应用数据源APP)
  designSql?: string; // 设计的sql - 可包含注释
  fileUrl?: string; // 文件地址
  fullSql?: string; // 完整的sql
  id?: string;
  key?: string; // 数据集key
  name?: string;
  script?: string; // 自定义sql
  type?: string; // 数据集类型(数据表TABLE、自定义SQL、数据源配置CONF)
}

/**
 * title: PnDatasetResponse
 */
export interface PnDatasetResponse {
  biConfigId?: string; // 数据源配置id
  categoryId?: string; // 分类Id
  categoryName?: string; // 分类名称
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  databaseId?: string; // 数据源id
  databaseName?: string; // 数据源名称
  databaseType?: string; // 数据源类型(数据库数据源DB、应用数据源APP)
  designSql?: string; // 设计的sql - 可包含注释
  fullSql?: string; // 完整的sql
  id?: string; // $column.comments
  key?: string; // 数据集key
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  script?: string; // 自定义sql
  type?: string; // 数据集类型(数据表TABLE、自定义SQL)
}

/**
 * title: PnPage
 */
export interface PnPage {
  component?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  developCanvas?: string;
  id?: string;
  layout?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  projectId?: string;
  remark?: string;
  themeJson?: string;
  weight?: number;
}

/**
 * title: PnPageRequest
 */
export interface PnPageRequest {
  component?: string; // 绑定发布页面组件名
  developCanvas?: string; // 绑定设计器组件名
  layout?: string; // 页面json
  name?: string; // 页面名称
  projectId?: string; // 工程id
  remark?: string; // 备注
  themeJson?: string; // 主题json
  weight?: number; // 权重
}

/**
 * title: PnPageResponse
 */
export interface PnPageResponse {
  component?: string; // 绑定发布页面组件名
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  developCanvas?: string; // 绑定设计器组件名
  id?: string; // $column.comments
  layout?: string; // 页面json
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 页面名称
  projectId?: string; // 工程id
  remark?: string; // 备注
  themeJson?: string; // 主题json
  weight?: number; // 权重
}

/**
 * title: PnPageSaveRequest
 */
export interface PnPageSaveRequest {
  appId?: string; // 应用ID
  canvasWidth?: number;
  categoryId?: string;
  colNum?: number;
  developCanvas?: string;
  encrypt?: number; // 是否加密
  global?: string; // 全局设置
  height?: number; // 高度
  id?: string; // 工程id
  maxRows?: number;
  name?: string; // 工程名称
  pageList?: Array<PnPage>;
  password?: string; // 密码
  publish?: number; // 是否发布
  remark?: string; // 备注
  rowHeight?: number;
  size?: string; // 尺寸
  tenantId?: string; // 租户Id
  themeJson?: string;
  thumbnail?: string; // 缩略图
  width?: number; // 宽度
}

/**
 * title: PnProjectRequest
 */
export interface PnProjectRequest {
  appId?: string; // 应用ID
  canvasWidth?: number;
  categoryId?: string;
  colNum?: number;
  developCanvas?: string;
  encrypt?: number; // 是否加密
  global?: string; // 全局设置
  height?: number; // 高度
  id?: string; // 工程id
  maxRows?: number;
  name?: string; // 工程名称
  password?: string; // 密码
  publish?: number; // 是否发布
  remark?: string; // 备注
  rowHeight?: number;
  size?: string; // 尺寸
  tenantId?: string; // 租户Id
  themeJson?: string;
  thumbnail?: string; // 缩略图
  width?: number; // 宽度
}

/**
 * title: PnProjectResponse
 */
export interface PnProjectResponse {
  appId?: string; // 应用ID
  canvasWidth?: number;
  categoryId?: string;
  colNum?: number;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  developCanvas?: string;
  encrypt?: number; // 是否加密
  global?: string; // 全局设置
  height?: number; // 高度
  id?: string; // id
  maxRows?: number;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 工程名称
  pageList?: Array<PnPage>;
  password?: string; // 密码
  publish?: number; // 是否发布
  remark?: string; // 备注
  rowHeight?: number;
  size?: string; // 尺寸
  tenantId?: string; // 租户Id
  themeJson?: string;
  thumbnail?: string; // 缩略图
  width?: number; // 宽度
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
 * title: PrintListDto
 */
export interface PrintListDto {
  brand?: string;
  defaultPrint?: string;
  id?: string;
  printName?: string;
}

/**
 * title: PrintLogDto
 */
export interface PrintLogDto {
  branchId?: string;
  env?: string;
  key?: string;
  macAddress?: string;
  printAppId?: string;
  printAppName?: string;
  printContent?: string;
  printIp?: string;
  printName?: string;
  printNumber?: number;
  printPort?: string;
  printType?: string;
  remark?: string;
  resourceName?: string;
  resourceType?: string;
  serverLogId?: string;
  tagName?: string;
}

/**
 * title: PrintLogRequest
 */
export interface PrintLogRequest {
  branchId?: string; // 分支
  env?: string; // 环境
  key?: string; // 打印资源key
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
  tagName?: string;
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
 * title: PrintResourceCount
 */
export interface PrintResourceCount {
  clientCount?: number; // 打印服务数量
  internetCount?: number; // 网络打印机数量
}

/**
 * title: PrintResourceMapping
 */
export interface PrintResourceMapping {
  id?: string;
  macAddress?: string;
  printKey?: string;
  printName?: string;
}

/**
 * title: PrintResourceRemarkRequest
 */
export interface PrintResourceRemarkRequest {
  remark?: string; // 备注
}

/**
 * title: PrintResourceRequest
 */
export interface PrintResourceRequest {
  brand?: string; // 品牌（网络打印机）
  key?: string; // 打印资源key
  macAddress?: string; // 打印资源的mac地址
  name?: string; // 打印资源名称
  printIp?: string; // 打印机IP
  printPort?: string; // 打印机端口协议
  remark?: string; // 备注
  status?: number; // 打印资源连接状态
  type?: string; // 打印资源类型（CLIENT_PRINT、INTERNET_PRINT）
}

/**
 * title: PrintResourceResponse
 */
export interface PrintResourceResponse {
  brand?: string; // 品牌（网络打印机）
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  key?: string; // 打印资源key
  macAddress?: string; // 打印资源的mac地址
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 打印资源名称
  pathType?: string; // btw模板路径类型：local本地选择、common网络共享
  printIp?: string; // 打印机IP
  printPort?: string; // 打印机端口协议
  remark?: string; // 备注
  status?: number; // 打印资源连接状态
  tenantId?: string; // 租户ID
  tmplSaveAddress?: string; // bartender模板保存路径（以此判断显隐藏Bartender TAG）
  type?: string; // 打印资源类型（CLIENT_PRINT、INTERNET_PRINT）
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
 * title: Process
 */
export interface Process {
  processId?: string;
  processKey?: string;
  processName?: string;
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
 * title: PublishedAppDtoResponse
 */
export interface PublishedAppDtoResponse {
  app?: App;
  appId?: string;
  appName?: string;
  appVersion?: string;
  commitTag?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  env?: string;
  id?: string;
  lastVisitTime?: string;
  lastVisitor?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  releaseTag?: string;
  state?: string;
}

/**
 * title: QueryBean
 */
export interface QueryBean {
  sql?: string;
}

/**
 * title: RedirectView
 */
export interface RedirectView {
  applicationContext?: ApplicationContext;
  attributesMap?: object;
  beanName?: string;
  contentType?: string;
  exposePathVariables?: boolean;
  hosts?: Array<string>;
  propagateQueryProperties?: boolean;
  redirectView?: boolean;
  requestContextAttribute?: string;
  staticAttributes?: object;
  url?: string;
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
 * title: RelationBatchDto
 */
export interface RelationBatchDto {
  id?: string;
  positionJson?: string;
}

/**
 * title: RemoveAndHandoverDto
 */
export interface RemoveAndHandoverDto {
  appId?: string;
  userId?: string;
}

/**
 * title: RemoveAndHandoverRequest
 */
export interface RemoveAndHandoverRequest {
  id?: string;
  removeAndHandoverDtoList?: Array<RemoveAndHandoverDto>;
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
  userIds?: Array<string>;
  visibleRange?: string;
}

/**
 * title: ResourceTransferToPageForm
 */
export interface ResourceTransferToPageForm {
  pageId: string;
  resourceId: string;
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
 * title: ResponseEntity«AddDatabaseForm»
 */
export interface ResponseEntityAddDatabaseForm {
  code: number; // 执行结果状态码
  data?: AddDatabaseForm; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AgentDTO»
 */
export interface ResponseEntityAgentDTO {
  code: number; // 执行结果状态码
  data?: AgentDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AgentResponse»
 */
export interface ResponseEntityAgentResponse {
  code: number; // 执行结果状态码
  data?: AgentResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«ApkResponse»
 */
export interface ResponseEntityApkResponse {
  code: number; // 执行结果状态码
  data?: ApkResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«AppCountDto»
 */
export interface ResponseEntityAppCountDto {
  code: number; // 执行结果状态码
  data?: AppCountDto; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppEffectiveLicense»
 */
export interface ResponseEntityAppEffectiveLicense {
  code: number; // 执行结果状态码
  data?: AppEffectiveLicense; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«AppMemberResponse»
 */
export interface ResponseEntityAppMemberResponse {
  code: number; // 执行结果状态码
  data?: AppMemberResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppResponse»
 */
export interface ResponseEntityAppResponse {
  code: number; // 执行结果状态码
  data?: AppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AppSettingDtoResponse»
 */
export interface ResponseEntityAppSettingDtoResponse {
  code: number; // 执行结果状态码
  data?: AppSettingDtoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«AssetsResponse»
 */
export interface ResponseEntityAssetsResponse {
  code: number; // 执行结果状态码
  data?: AssetsResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«AuthBasicInfo»
 */
export interface ResponseEntityAuthBasicInfo {
  code: number; // 执行结果状态码
  data?: AuthBasicInfo; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BiDataSetPreviewResult»
 */
export interface ResponseEntityBiDataSetPreviewResult {
  code: number; // 执行结果状态码
  data?: BiDataSetPreviewResult; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BiDataSetResponse»
 */
export interface ResponseEntityBiDataSetResponse {
  code: number; // 执行结果状态码
  data?: BiDataSetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BiFileDatasetConfigResponse»
 */
export interface ResponseEntityBiFileDatasetConfigResponse {
  code: number; // 执行结果状态码
  data?: BiFileDatasetConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«BiShareResponse»
 */
export interface ResponseEntityBiShareResponse {
  code: number; // 执行结果状态码
  data?: BiShareResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«CardLoginConfig»
 */
export interface ResponseEntityCardLoginConfig {
  code: number; // 执行结果状态码
  data?: CardLoginConfig; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«CrossReport»
 */
export interface ResponseEntityCrossReport {
  code: number; // 执行结果状态码
  data?: CrossReport; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«DataSourceMainResponse»
 */
export interface ResponseEntityDataSourceMainResponse {
  code: number; // 执行结果状态码
  data?: DataSourceMainResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«DatasourceDevopsResponse»
 */
export interface ResponseEntityDatasourceDevopsResponse {
  code: number; // 执行结果状态码
  data?: DatasourceDevopsResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DatasourceExtDTO»
 */
export interface ResponseEntityDatasourceExtDTO {
  code: number; // 执行结果状态码
  data?: DatasourceExtDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DatasourceMoveDataResponse»
 */
export interface ResponseEntityDatasourceMoveDataResponse {
  code: number; // 执行结果状态码
  data?: DatasourceMoveDataResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DatasourceMoveDetailResponse»
 */
export interface ResponseEntityDatasourceMoveDetailResponse {
  code: number; // 执行结果状态码
  data?: DatasourceMoveDetailResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DatasourceMoveResponse»
 */
export interface ResponseEntityDatasourceMoveResponse {
  code: number; // 执行结果状态码
  data?: DatasourceMoveResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DeviceInterconnectionParamResponse»
 */
export interface ResponseEntityDeviceInterconnectionParamResponse {
  code: number; // 执行结果状态码
  data?: DeviceInterconnectionParamResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DeviceInterconnectionResponse»
 */
export interface ResponseEntityDeviceInterconnectionResponse {
  code: number; // 执行结果状态码
  data?: DeviceInterconnectionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«DeviceParamRefResponse»
 */
export interface ResponseEntityDeviceParamRefResponse {
  code: number; // 执行结果状态码
  data?: DeviceParamRefResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ExternalMessageResponse»
 */
export interface ResponseEntityExternalMessageResponse {
  code: number; // 执行结果状态码
  data?: ExternalMessageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«FileTaskResponse»
 */
export interface ResponseEntityFileTaskResponse {
  code: number; // 执行结果状态码
  data?: FileTaskResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«InternalMessageResponse»
 */
export interface ResponseEntityInternalMessageResponse {
  code: number; // 执行结果状态码
  data?: InternalMessageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«JSONObject»
 */
export interface ResponseEntityJSONObject {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«KnowledgeBaseChunkResponse»
 */
export interface ResponseEntityKnowledgeBaseChunkResponse {
  code: number; // 执行结果状态码
  data?: KnowledgeBaseChunkResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«KnowledgeBaseDocResponse»
 */
export interface ResponseEntityKnowledgeBaseDocResponse {
  code: number; // 执行结果状态码
  data?: KnowledgeBaseDocResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«KnowledgeBaseResponse»
 */
export interface ResponseEntityKnowledgeBaseResponse {
  code: number; // 执行结果状态码
  data?: KnowledgeBaseResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«AddDatabaseForm»»
 */
export interface ResponseEntityListAddDatabaseForm {
  code: number; // 执行结果状态码
  data?: Array<AddDatabaseForm>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AgentResponse»»
 */
export interface ResponseEntityListAgentResponse {
  code: number; // 执行结果状态码
  data?: Array<AgentResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ApkResponse»»
 */
export interface ResponseEntityListApkResponse {
  code: number; // 执行结果状态码
  data?: Array<ApkResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«AppMemberPO»»
 */
export interface ResponseEntityListAppMemberPO {
  code: number; // 执行结果状态码
  data?: Array<AppMemberPO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppMemberResponse»»
 */
export interface ResponseEntityListAppMemberResponse {
  code: number; // 执行结果状态码
  data?: Array<AppMemberResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppProcess»»
 */
export interface ResponseEntityListAppProcess {
  code: number; // 执行结果状态码
  data?: Array<AppProcess>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AppResponse»»
 */
export interface ResponseEntityListAppResponse {
  code: number; // 执行结果状态码
  data?: Array<AppResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«App»»
 */
export interface ResponseEntityListApp {
  code: number; // 执行结果状态码
  data?: Array<App>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«AssetsResponse»»
 */
export interface ResponseEntityListAssetsResponse {
  code: number; // 执行结果状态码
  data?: Array<AssetsResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«BiDataSetResponse»»
 */
export interface ResponseEntityListBiDataSetResponse {
  code: number; // 执行结果状态码
  data?: Array<BiDataSetResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«BiFileDatasetConfigResponse»»
 */
export interface ResponseEntityListBiFileDatasetConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<BiFileDatasetConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«BiShareResponse»»
 */
export interface ResponseEntityListBiShareResponse {
  code: number; // 执行结果状态码
  data?: Array<BiShareResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«ColumnInformationSchema»»
 */
export interface ResponseEntityListColumnInformationSchema {
  code: number; // 执行结果状态码
  data?: Array<ColumnInformationSchema>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«DataBaseInformationSchema»»
 */
export interface ResponseEntityListDataBaseInformationSchema {
  code: number; // 执行结果状态码
  data?: Array<DataBaseInformationSchema>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DataSourceMainResponse»»
 */
export interface ResponseEntityListDataSourceMainResponse {
  code: number; // 执行结果状态码
  data?: Array<DataSourceMainResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«DatasourceDevopsResponse»»
 */
export interface ResponseEntityListDatasourceDevopsResponse {
  code: number; // 执行结果状态码
  data?: Array<DatasourceDevopsResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DatasourceMoveDataResponse»»
 */
export interface ResponseEntityListDatasourceMoveDataResponse {
  code: number; // 执行结果状态码
  data?: Array<DatasourceMoveDataResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DatasourceMoveDetailResponse»»
 */
export interface ResponseEntityListDatasourceMoveDetailResponse {
  code: number; // 执行结果状态码
  data?: Array<DatasourceMoveDetailResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DatasourceMoveResponse»»
 */
export interface ResponseEntityListDatasourceMoveResponse {
  code: number; // 执行结果状态码
  data?: Array<DatasourceMoveResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DeviceInterconnectionParamResponse»»
 */
export interface ResponseEntityListDeviceInterconnectionParamResponse {
  code: number; // 执行结果状态码
  data?: Array<DeviceInterconnectionParamResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DeviceInterconnectionResponse»»
 */
export interface ResponseEntityListDeviceInterconnectionResponse {
  code: number; // 执行结果状态码
  data?: Array<DeviceInterconnectionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«DeviceParamRefResponse»»
 */
export interface ResponseEntityListDeviceParamRefResponse {
  code: number; // 执行结果状态码
  data?: Array<DeviceParamRefResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ExternalMessageResponse»»
 */
export interface ResponseEntityListExternalMessageResponse {
  code: number; // 执行结果状态码
  data?: Array<ExternalMessageResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«FileTaskResponse»»
 */
export interface ResponseEntityListFileTaskResponse {
  code: number; // 执行结果状态码
  data?: Array<FileTaskResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«I18nConfigResponse»»
 */
export interface ResponseEntityListI18nConfigResponse {
  code: number; // 执行结果状态码
  data?: Array<I18nConfigResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«InternalMessageResponse»»
 */
export interface ResponseEntityListInternalMessageResponse {
  code: number; // 执行结果状态码
  data?: Array<InternalMessageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«KnowledgeBaseChunkResponse»»
 */
export interface ResponseEntityListKnowledgeBaseChunkResponse {
  code: number; // 执行结果状态码
  data?: Array<KnowledgeBaseChunkResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«KnowledgeBaseDTO»»
 */
export interface ResponseEntityListKnowledgeBaseDTO {
  code: number; // 执行结果状态码
  data?: Array<KnowledgeBaseDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«KnowledgeBaseDocResponse»»
 */
export interface ResponseEntityListKnowledgeBaseDocResponse {
  code: number; // 执行结果状态码
  data?: Array<KnowledgeBaseDocResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«KnowledgeBaseResponse»»
 */
export interface ResponseEntityListKnowledgeBaseResponse {
  code: number; // 执行结果状态码
  data?: Array<KnowledgeBaseResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«LicenseExpireMsg»»
 */
export interface ResponseEntityListLicenseExpireMsg {
  code: number; // 执行结果状态码
  data?: Array<LicenseExpireMsg>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«LicenseLimitResponse»»
 */
export interface ResponseEntityListLicenseLimitResponse {
  code: number; // 执行结果状态码
  data?: Array<LicenseLimitResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«Map»»
 */
export interface ResponseEntityListMap {
  code: number; // 执行结果状态码
  data?: Array<object>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«MessageSettingResponse»»
 */
export interface ResponseEntityListMessageSettingResponse {
  code: number; // 执行结果状态码
  data?: Array<MessageSettingResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«ModelProviderResponse»»
 */
export interface ResponseEntityListModelProviderResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelProviderResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ModelResponse»»
 */
export interface ResponseEntityListModelResponse {
  code: number; // 执行结果状态码
  data?: Array<ModelResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«NavMenuResponse»»
 */
export interface ResponseEntityListNavMenuResponse {
  code: number; // 执行结果状态码
  data?: Array<NavMenuResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«NavPageResponse»»
 */
export interface ResponseEntityListNavPageResponse {
  code: number; // 执行结果状态码
  data?: Array<NavPageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OpenapiAggregateByModelTreeResponse»»
 */
export interface ResponseEntityListOpenapiAggregateByModelTreeResponse {
  code: number; // 执行结果状态码
  data?: Array<OpenapiAggregateByModelTreeResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OpenapiAggregateResponse»»
 */
export interface ResponseEntityListOpenapiAggregateResponse {
  code: number; // 执行结果状态码
  data?: Array<OpenapiAggregateResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OpenapiGroupResponse»»
 */
export interface ResponseEntityListOpenapiGroupResponse {
  code: number; // 执行结果状态码
  data?: Array<OpenapiGroupResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OpenapiKeyGrantResponse»»
 */
export interface ResponseEntityListOpenapiKeyGrantResponse {
  code: number; // 执行结果状态码
  data?: Array<OpenapiKeyGrantResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«OrgBaseInfo»»
 */
export interface ResponseEntityListOrgBaseInfo {
  code: number; // 执行结果状态码
  data?: Array<OrgBaseInfo>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«OrgUserResponse»»
 */
export interface ResponseEntityListOrgUserResponse {
  code: number; // 执行结果状态码
  data?: Array<OrgUserResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«PluginResponse»»
 */
export interface ResponseEntityListPluginResponse {
  code: number; // 执行结果状态码
  data?: Array<PluginResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PluginTenant»»
 */
export interface ResponseEntityListPluginTenant {
  code: number; // 执行结果状态码
  data?: Array<PluginTenant>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PluginVersionResponse»»
 */
export interface ResponseEntityListPluginVersionResponse {
  code: number; // 执行结果状态码
  data?: Array<PluginVersionResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PmProcessDelegateDetailResponse»»
 */
export interface ResponseEntityListPmProcessDelegateDetailResponse {
  code: number; // 执行结果状态码
  data?: Array<PmProcessDelegateDetailResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PmProcessDelegateResponse»»
 */
export interface ResponseEntityListPmProcessDelegateResponse {
  code: number; // 执行结果状态码
  data?: Array<PmProcessDelegateResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PmProcessInstanceResponse»»
 */
export interface ResponseEntityListPmProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: Array<PmProcessInstanceResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PmTaskDoneResponse»»
 */
export interface ResponseEntityListPmTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: Array<PmTaskDoneResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PmTaskTodoResponse»»
 */
export interface ResponseEntityListPmTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: Array<PmTaskTodoResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PnDatasetLogResponse»»
 */
export interface ResponseEntityListPnDatasetLogResponse {
  code: number; // 执行结果状态码
  data?: Array<PnDatasetLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PnDatasetResponse»»
 */
export interface ResponseEntityListPnDatasetResponse {
  code: number; // 执行结果状态码
  data?: Array<PnDatasetResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PnPageResponse»»
 */
export interface ResponseEntityListPnPageResponse {
  code: number; // 执行结果状态码
  data?: Array<PnPageResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PnProjectResponse»»
 */
export interface ResponseEntityListPnProjectResponse {
  code: number; // 执行结果状态码
  data?: Array<PnProjectResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintListDto»»
 */
export interface ResponseEntityListPrintListDto {
  code: number; // 执行结果状态码
  data?: Array<PrintListDto>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintLogResponse»»
 */
export interface ResponseEntityListPrintLogResponse {
  code: number; // 执行结果状态码
  data?: Array<PrintLogResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintResourceMapping»»
 */
export interface ResponseEntityListPrintResourceMapping {
  code: number; // 执行结果状态码
  data?: Array<PrintResourceMapping>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«PrintResourceResponse»»
 */
export interface ResponseEntityListPrintResourceResponse {
  code: number; // 执行结果状态码
  data?: Array<PrintResourceResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«SealManagementResponse»»
 */
export interface ResponseEntityListSealManagementResponse {
  code: number; // 执行结果状态码
  data?: Array<SealManagementResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«ShortcutMenuDtoResponse»»
 */
export interface ResponseEntityListShortcutMenuDtoResponse {
  code: number; // 执行结果状态码
  data?: Array<ShortcutMenuDtoResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«SignLogResponse»»
 */
export interface ResponseEntityListSignLogResponse {
  code: number; // 执行结果状态码
  data?: Array<SignLogResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«TableInformationSchema»»
 */
export interface ResponseEntityListTableInformationSchema {
  code: number; // 执行结果状态码
  data?: Array<TableInformationSchema>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TaskDelegateResponse»»
 */
export interface ResponseEntityListTaskDelegateResponse {
  code: number; // 执行结果状态码
  data?: Array<TaskDelegateResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TenantDeveloperDTO»»
 */
export interface ResponseEntityListTenantDeveloperDTO {
  code: number; // 执行结果状态码
  data?: Array<TenantDeveloperDTO>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«TenantResponse»»
 */
export interface ResponseEntityListTenantResponse {
  code: number; // 执行结果状态码
  data?: Array<TenantResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«UserExtraResponse»»
 */
export interface ResponseEntityListUserExtraResponse {
  code: number; // 执行结果状态码
  data?: Array<UserExtraResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserFieldMeta»»
 */
export interface ResponseEntityListUserFieldMeta {
  code: number; // 执行结果状态码
  data?: Array<UserFieldMeta>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«UserInfoLogResponse»»
 */
export interface ResponseEntityListUserInfoLogResponse {
  code: number; // 执行结果状态码
  data?: Array<UserInfoLogResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«UserPasswordHistoryResponse»»
 */
export interface ResponseEntityListUserPasswordHistoryResponse {
  code: number; // 执行结果状态码
  data?: Array<UserPasswordHistoryResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«List«WorkbenchComponentRelationResponse»»
 */
export interface ResponseEntityListWorkbenchComponentRelationResponse {
  code: number; // 执行结果状态码
  data?: Array<WorkbenchComponentRelationResponse>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«List«WorkbenchComponentResponse»»
 */
export interface ResponseEntityListWorkbenchComponentResponse {
  code: number; // 执行结果状态码
  data?: Array<WorkbenchComponentResponse>; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«Map«string,List«OpenapiDto»»»
 */
export interface ResponseEntityMapstringListOpenapiDto {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Map«string,int»»
 */
export interface ResponseEntityMapstringint {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«Map»
 */
export interface ResponseEntityMap {
  code: number; // 执行结果状态码
  data?: object; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«MessageSettingCountResponse»
 */
export interface ResponseEntityMessageSettingCountResponse {
  code: number; // 执行结果状态码
  data?: MessageSettingCountResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«MessageSettingResponse»
 */
export interface ResponseEntityMessageSettingResponse {
  code: number; // 执行结果状态码
  data?: MessageSettingResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelDTO»
 */
export interface ResponseEntityModelDTO {
  code: number; // 执行结果状态码
  data?: ModelDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelProviderResponse»
 */
export interface ResponseEntityModelProviderResponse {
  code: number; // 执行结果状态码
  data?: ModelProviderResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ModelResponse»
 */
export interface ResponseEntityModelResponse {
  code: number; // 执行结果状态码
  data?: ModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«NavMenuResponse»
 */
export interface ResponseEntityNavMenuResponse {
  code: number; // 执行结果状态码
  data?: NavMenuResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«NavPageResponse»
 */
export interface ResponseEntityNavPageResponse {
  code: number; // 执行结果状态码
  data?: NavPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OpenapiGroupResponse»
 */
export interface ResponseEntityOpenapiGroupResponse {
  code: number; // 执行结果状态码
  data?: OpenapiGroupResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«OpenapiKeyGrantResponse»
 */
export interface ResponseEntityOpenapiKeyGrantResponse {
  code: number; // 执行结果状态码
  data?: OpenapiKeyGrantResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«Org»
 */
export interface ResponseEntityOrg {
  code: number; // 执行结果状态码
  data?: Org; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PackageJson»
 */
export interface ResponseEntityPackageJson {
  code: number; // 执行结果状态码
  data?: PackageJson; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AcLicenseResponse»»
 */
export interface ResponseEntityPageBaseAcLicenseResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAcLicenseResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AgentResponse»»
 */
export interface ResponseEntityPageBaseAgentResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAgentResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AppMemberResponse»»
 */
export interface ResponseEntityPageBaseAppMemberResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAppMemberResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«AppResponse»»
 */
export interface ResponseEntityPageBaseAppResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAppResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«AssetsResponse»»
 */
export interface ResponseEntityPageBaseAssetsResponse {
  code: number; // 执行结果状态码
  data?: PageBaseAssetsResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«BiDataSetResponse»»
 */
export interface ResponseEntityPageBaseBiDataSetResponse {
  code: number; // 执行结果状态码
  data?: PageBaseBiDataSetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«BiFileDatasetConfigResponse»»
 */
export interface ResponseEntityPageBaseBiFileDatasetConfigResponse {
  code: number; // 执行结果状态码
  data?: PageBaseBiFileDatasetConfigResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«BiShareResponse»»
 */
export interface ResponseEntityPageBaseBiShareResponse {
  code: number; // 执行结果状态码
  data?: PageBaseBiShareResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«DataSourceMainResponse»»
 */
export interface ResponseEntityPageBaseDataSourceMainResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDataSourceMainResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«DatasourceDevopsResponse»»
 */
export interface ResponseEntityPageBaseDatasourceDevopsResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDatasourceDevopsResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DatasourceMoveDataResponse»»
 */
export interface ResponseEntityPageBaseDatasourceMoveDataResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDatasourceMoveDataResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DatasourceMoveDetailResponse»»
 */
export interface ResponseEntityPageBaseDatasourceMoveDetailResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDatasourceMoveDetailResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DatasourceMoveResponse»»
 */
export interface ResponseEntityPageBaseDatasourceMoveResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDatasourceMoveResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DeviceInterconnectionParamResponse»»
 */
export interface ResponseEntityPageBaseDeviceInterconnectionParamResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDeviceInterconnectionParamResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DeviceInterconnectionResponse»»
 */
export interface ResponseEntityPageBaseDeviceInterconnectionResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDeviceInterconnectionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«DeviceParamRefResponse»»
 */
export interface ResponseEntityPageBaseDeviceParamRefResponse {
  code: number; // 执行结果状态码
  data?: PageBaseDeviceParamRefResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ExternalMessageResponse»»
 */
export interface ResponseEntityPageBaseExternalMessageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseExternalMessageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«FileTaskResponse»»
 */
export interface ResponseEntityPageBaseFileTaskResponse {
  code: number; // 执行结果状态码
  data?: PageBaseFileTaskResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«InternalMessageResponse»»
 */
export interface ResponseEntityPageBaseInternalMessageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseInternalMessageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«KnowledgeBaseChunkResponse»»
 */
export interface ResponseEntityPageBaseKnowledgeBaseChunkResponse {
  code: number; // 执行结果状态码
  data?: PageBaseKnowledgeBaseChunkResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«KnowledgeBaseDocResponse»»
 */
export interface ResponseEntityPageBaseKnowledgeBaseDocResponse {
  code: number; // 执行结果状态码
  data?: PageBaseKnowledgeBaseDocResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«KnowledgeBaseResponse»»
 */
export interface ResponseEntityPageBaseKnowledgeBaseResponse {
  code: number; // 执行结果状态码
  data?: PageBaseKnowledgeBaseResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«LoginLogResponse»»
 */
export interface ResponseEntityPageBaseLoginLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseLoginLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ManagerBean»»
 */
export interface ResponseEntityPageBaseManagerBean {
  code: number; // 执行结果状态码
  data?: PageBaseManagerBean; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«MessageSettingResponse»»
 */
export interface ResponseEntityPageBaseMessageSettingResponse {
  code: number; // 执行结果状态码
  data?: PageBaseMessageSettingResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ModelProviderResponse»»
 */
export interface ResponseEntityPageBaseModelProviderResponse {
  code: number; // 执行结果状态码
  data?: PageBaseModelProviderResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ModelResponse»»
 */
export interface ResponseEntityPageBaseModelResponse {
  code: number; // 执行结果状态码
  data?: PageBaseModelResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«NavMenuResponse»»
 */
export interface ResponseEntityPageBaseNavMenuResponse {
  code: number; // 执行结果状态码
  data?: PageBaseNavMenuResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«NavPageResponse»»
 */
export interface ResponseEntityPageBaseNavPageResponse {
  code: number; // 执行结果状态码
  data?: PageBaseNavPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OpenapiGroupResponse»»
 */
export interface ResponseEntityPageBaseOpenapiGroupResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOpenapiGroupResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«OpenapiKeyGrantResponse»»
 */
export interface ResponseEntityPageBaseOpenapiKeyGrantResponse {
  code: number; // 执行结果状态码
  data?: PageBaseOpenapiKeyGrantResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«PluginResponse»»
 */
export interface ResponseEntityPageBasePluginResponse {
  code: number; // 执行结果状态码
  data?: PageBasePluginResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PluginVersionResponse»»
 */
export interface ResponseEntityPageBasePluginVersionResponse {
  code: number; // 执行结果状态码
  data?: PageBasePluginVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmProcessDelegateDetailResponse»»
 */
export interface ResponseEntityPageBasePmProcessDelegateDetailResponse {
  code: number; // 执行结果状态码
  data?: PageBasePmProcessDelegateDetailResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmProcessDelegateResponse»»
 */
export interface ResponseEntityPageBasePmProcessDelegateResponse {
  code: number; // 执行结果状态码
  data?: PageBasePmProcessDelegateResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmProcessInstanceResponse»»
 */
export interface ResponseEntityPageBasePmProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: PageBasePmProcessInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmTaskDoneResponse»»
 */
export interface ResponseEntityPageBasePmTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: PageBasePmTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PmTaskTodoResponse»»
 */
export interface ResponseEntityPageBasePmTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: PageBasePmTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PnDatasetLogResponse»»
 */
export interface ResponseEntityPageBasePnDatasetLogResponse {
  code: number; // 执行结果状态码
  data?: PageBasePnDatasetLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PnDatasetResponse»»
 */
export interface ResponseEntityPageBasePnDatasetResponse {
  code: number; // 执行结果状态码
  data?: PageBasePnDatasetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PnPageResponse»»
 */
export interface ResponseEntityPageBasePnPageResponse {
  code: number; // 执行结果状态码
  data?: PageBasePnPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«PnProjectResponse»»
 */
export interface ResponseEntityPageBasePnProjectResponse {
  code: number; // 执行结果状态码
  data?: PageBasePnProjectResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«PublishedAppDtoResponse»»
 */
export interface ResponseEntityPageBasePublishedAppDtoResponse {
  code: number; // 执行结果状态码
  data?: PageBasePublishedAppDtoResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«SealManagementResponse»»
 */
export interface ResponseEntityPageBaseSealManagementResponse {
  code: number; // 执行结果状态码
  data?: PageBaseSealManagementResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ShortcutMenuResponse»»
 */
export interface ResponseEntityPageBaseShortcutMenuResponse {
  code: number; // 执行结果状态码
  data?: PageBaseShortcutMenuResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«StartedProcessResponse»»
 */
export interface ResponseEntityPageBaseStartedProcessResponse {
  code: number; // 执行结果状态码
  data?: PageBaseStartedProcessResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TaskDelegateResponse»»
 */
export interface ResponseEntityPageBaseTaskDelegateResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTaskDelegateResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TaskDoneResponse»»
 */
export interface ResponseEntityPageBaseTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TaskTodoResponse»»
 */
export interface ResponseEntityPageBaseTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: PageBaseTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«TenantDeveloperDTO»»
 */
export interface ResponseEntityPageBaseTenantDeveloperDTO {
  code: number; // 执行结果状态码
  data?: PageBaseTenantDeveloperDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«ThirdPartyInvokeLogResponse»»
 */
export interface ResponseEntityPageBaseThirdPartyInvokeLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseThirdPartyInvokeLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«UserExtraResponse»»
 */
export interface ResponseEntityPageBaseUserExtraResponse {
  code: number; // 执行结果状态码
  data?: PageBaseUserExtraResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«UserInfoLogResponse»»
 */
export interface ResponseEntityPageBaseUserInfoLogResponse {
  code: number; // 执行结果状态码
  data?: PageBaseUserInfoLogResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«UserPasswordHistoryResponse»»
 */
export interface ResponseEntityPageBaseUserPasswordHistoryResponse {
  code: number; // 执行结果状态码
  data?: PageBaseUserPasswordHistoryResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PageBase«WorkbenchComponentRelationResponse»»
 */
export interface ResponseEntityPageBaseWorkbenchComponentRelationResponse {
  code: number; // 执行结果状态码
  data?: PageBaseWorkbenchComponentRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PageBase«WorkbenchComponentResponse»»
 */
export interface ResponseEntityPageBaseWorkbenchComponentResponse {
  code: number; // 执行结果状态码
  data?: PageBaseWorkbenchComponentResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Page«Map«string,object»»»
 */
export interface ResponseEntityPageMapstringobject {
  code: number; // 执行结果状态码
  data?: PageMapstringobject; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PasswordInfo»
 */
export interface ResponseEntityPasswordInfo {
  code: number; // 执行结果状态码
  data?: PasswordInfo; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PluginResponse»
 */
export interface ResponseEntityPluginResponse {
  code: number; // 执行结果状态码
  data?: PluginResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PluginVersionResponse»
 */
export interface ResponseEntityPluginVersionResponse {
  code: number; // 执行结果状态码
  data?: PluginVersionResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmProcessDelegateDetailResponse»
 */
export interface ResponseEntityPmProcessDelegateDetailResponse {
  code: number; // 执行结果状态码
  data?: PmProcessDelegateDetailResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmProcessDelegateResponse»
 */
export interface ResponseEntityPmProcessDelegateResponse {
  code: number; // 执行结果状态码
  data?: PmProcessDelegateResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmProcessInstanceResponse»
 */
export interface ResponseEntityPmProcessInstanceResponse {
  code: number; // 执行结果状态码
  data?: PmProcessInstanceResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmTaskDoneResponse»
 */
export interface ResponseEntityPmTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: PmTaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PmTaskTodoResponse»
 */
export interface ResponseEntityPmTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: PmTaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PnDatasetLogResponse»
 */
export interface ResponseEntityPnDatasetLogResponse {
  code: number; // 执行结果状态码
  data?: PnDatasetLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PnDatasetResponse»
 */
export interface ResponseEntityPnDatasetResponse {
  code: number; // 执行结果状态码
  data?: PnDatasetResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PnPageResponse»
 */
export interface ResponseEntityPnPageResponse {
  code: number; // 执行结果状态码
  data?: PnPageResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PnProjectResponse»
 */
export interface ResponseEntityPnProjectResponse {
  code: number; // 执行结果状态码
  data?: PnProjectResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PrintLogResponse»
 */
export interface ResponseEntityPrintLogResponse {
  code: number; // 执行结果状态码
  data?: PrintLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PrintResourceCount»
 */
export interface ResponseEntityPrintResourceCount {
  code: number; // 执行结果状态码
  data?: PrintResourceCount; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«PrintResourceResponse»
 */
export interface ResponseEntityPrintResourceResponse {
  code: number; // 执行结果状态码
  data?: PrintResourceResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«PublishedAppDtoResponse»
 */
export interface ResponseEntityPublishedAppDtoResponse {
  code: number; // 执行结果状态码
  data?: PublishedAppDtoResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«RolePermissionDTO»
 */
export interface ResponseEntityRolePermissionDTO {
  code: number; // 执行结果状态码
  data?: RolePermissionDTO; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«SealManagementResponse»
 */
export interface ResponseEntitySealManagementResponse {
  code: number; // 执行结果状态码
  data?: SealManagementResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SearchAllOrgOrUserResponse»
 */
export interface ResponseEntitySearchAllOrgOrUserResponse {
  code: number; // 执行结果状态码
  data?: SearchAllOrgOrUserResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Set«string»»
 */
export interface ResponseEntitySetstring {
  code: number; // 执行结果状态码
  data?: Array<string>; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ShortcutMenuDtoResponse»
 */
export interface ResponseEntityShortcutMenuDtoResponse {
  code: number; // 执行结果状态码
  data?: ShortcutMenuDtoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SignLogResponse»
 */
export interface ResponseEntitySignLogResponse {
  code: number; // 执行结果状态码
  data?: SignLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«SqlResult»
 */
export interface ResponseEntitySqlResult {
  code: number; // 执行结果状态码
  data?: SqlResult; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«StartedProcessResponse»
 */
export interface ResponseEntityStartedProcessResponse {
  code: number; // 执行结果状态码
  data?: StartedProcessResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«TaskDelegateResponse»
 */
export interface ResponseEntityTaskDelegateResponse {
  code: number; // 执行结果状态码
  data?: TaskDelegateResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TaskDoneResponse»
 */
export interface ResponseEntityTaskDoneResponse {
  code: number; // 执行结果状态码
  data?: TaskDoneResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TaskTodoResponse»
 */
export interface ResponseEntityTaskTodoResponse {
  code: number; // 执行结果状态码
  data?: TaskTodoResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TenantConfig»
 */
export interface ResponseEntityTenantConfig {
  code: number; // 执行结果状态码
  data?: TenantConfig; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TenantDeveloperDTO»
 */
export interface ResponseEntityTenantDeveloperDTO {
  code: number; // 执行结果状态码
  data?: TenantDeveloperDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«TenantResponse»
 */
export interface ResponseEntityTenantResponse {
  code: number; // 执行结果状态码
  data?: TenantResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«Tenant»
 */
export interface ResponseEntityTenant {
  code: number; // 执行结果状态码
  data?: Tenant; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ThirdPartyInvokeLogResponse»
 */
export interface ResponseEntityThirdPartyInvokeLogResponse {
  code: number; // 执行结果状态码
  data?: ThirdPartyInvokeLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«ThirdPartyLoginConfig»
 */
export interface ResponseEntityThirdPartyLoginConfig {
  code: number; // 执行结果状态码
  data?: ThirdPartyLoginConfig; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserExtraResponse»
 */
export interface ResponseEntityUserExtraResponse {
  code: number; // 执行结果状态码
  data?: UserExtraResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserInfoLogResponse»
 */
export interface ResponseEntityUserInfoLogResponse {
  code: number; // 执行结果状态码
  data?: UserInfoLogResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserLoginResp»
 */
export interface ResponseEntityUserLoginResp {
  code: number; // 执行结果状态码
  data?: UserLoginResp; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserOfTenantDTO»
 */
export interface ResponseEntityUserOfTenantDTO {
  code: number; // 执行结果状态码
  data?: UserOfTenantDTO; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserPasswordHistoryResponse»
 */
export interface ResponseEntityUserPasswordHistoryResponse {
  code: number; // 执行结果状态码
  data?: UserPasswordHistoryResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«UserResponse»
 */
export interface ResponseEntityUserResponse {
  code: number; // 执行结果状态码
  data?: UserResponse; // 返回正确结果时携带的数据
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
 * title: ResponseEntity«WorkbenchComponentRelationResponse»
 */
export interface ResponseEntityWorkbenchComponentRelationResponse {
  code: number; // 执行结果状态码
  data?: WorkbenchComponentRelationResponse; // 返回正确结果时携带的数据
  message: string; // 执行结果信息
  ok?: boolean;
  subCode?: string; // 执行结果子状态码
  subMessage?: string; // 执行结果子信息
}

/**
 * title: ResponseEntity«WorkbenchComponentResponse»
 */
export interface ResponseEntityWorkbenchComponentResponse {
  code: number; // 执行结果状态码
  data?: WorkbenchComponentResponse; // 返回正确结果时携带的数据
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
 * title: RoleBase
 */
export interface RoleBase {
  enabled?: number; // 状态(1:启用 ,0: 禁用)
  id?: string; // 角色主键Id
  name?: string; // 角色名称
  sysBuiltin?: number; // 是否内置角色(0: 否 1: 是)
}

/**
 * title: RolePermissionDTO
 */
export interface RolePermissionDTO {
  permissionIds?: Array<string>; // 权限id 集合
  roleId?: string; // 角色id
}

/**
 * title: RoleRequest
 */
export interface RoleRequest {
  description?: string; // 备注
  enabled?: number; // 状态(启用 1,禁用 0)
  id?: string; // 角色id(编辑角色传id)
  name?: string; // 角色名称
}

/**
 * title: RoleResponse
 */
export interface RoleResponse {
  area?: string; // 端 (平台 PLATFORM,租户管理后台 BACK_END)
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 备注
  enabled?: number; // 状态(1:启用 ,0: 禁用)
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 角色名称
  sysBuiltin?: number; // 是否内置角色(0: 否 1: 是)
  tenantId?: string; // 租户id
}

/**
 * title: RunSqlForm
 */
export interface RunSqlForm {
  pool_name: string;
  sql?: string;
}

/**
 * title: SealManagementRequest
 */
export interface SealManagementRequest {
  id?: string;
  name?: string; // 印章名称
  oldPassword?: string; // 旧密码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  password?: string; // 密码
  sealImage?: string; // 制章内容
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  tenantId?: string; // 租户Id
  type?: string; // 印章类型
}

/**
 * title: SealManagementResponse
 */
export interface SealManagementResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 印章名称
  password?: string; // 密码
  sealImage?: string; // 制章内容
  tenantId?: string; // 租户Id
  type?: string; // 印章类型
}

/**
 * title: SearchAllOrgOrUserResponse
 */
export interface SearchAllOrgOrUserResponse {
  orgIdList?: Array<string>; // 部门id集合
  userIdList?: Array<string>; // 用户id集合
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
  inapplicablePerson?: Array<string>; // 不适用人员范围
  lockHourTimeout?: number; // 锁定时长(单位/时)
  lockMinTimeout?: number; // 锁定时长(单位/分)
  lockTimeout?: number; // 锁定时长(单位/秒)
  loginKickOutMode?: string; // 登录互斥方式(NONE 不开启登录互斥,SAME_END:同端登录互斥 ,DIFFERENT_END:不同端登录互斥)
  maxErrorTimes?: number; // 最大错误次数
  noOpRetainHour?: number; // 用户无操作保留小时
  noOpRetainMinute?: number; // 用户无操作保留分钟
  passMinLength?: number; // 密码最小长度
  passRule?: Array<string>; // 密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
  repeatNum?: number; // 登录密码-最近密码不能相同次数
  sealEnablePassphrase?: number; // 印章密码-是否启用密码复杂度校验
  sealPassMinLength?: number; // 印章密码-密码最小长度
  sealPassRule?: Array<string>; // 印章密码-密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
  sealRepeatNum?: number; // 印章密码-最近密码不能相同次数
  signEnablePassphrase?: number; // 签名密码-是否启用密码复杂度校验
  signExpiryDate?: number; // 签名密码-密码有效时长
  signFirstTimeChangePassword?: number; // 签名密码-首次登录是否修改密码
  signPassMinLength?: number; // 签名密码-密码最小长度
  signPassRule?: Array<string>; // 签名密码-密码复杂度校验规则 枚举多选,(NUMBER/数字,LOWERCASE/小写字母,UPPERCASE/大写字段,SPECHARS/特殊字符 ) 
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
  alias?: string; // sql as 别名
  digit?: number; // 保留小数位
  distinct?: boolean; // 去重
  fieldKey?: string; // 字段key
  format?: string; // 格式化，比如yyyy-MM
  function?: string; // 函数
  includeNull?: boolean; // 空值参与计算
  type?: string; // 数据类型
}

/**
 * title: SendEmailMessageRequest
 */
export interface SendEmailMessageRequest {
  content?: string; // 邮件内容
  id?: string;
  receiveUserId?: string; // 接收人Id
  title?: string; // 邮件标题
}

/**
 * title: SendMessageRequest
 */
export interface SendMessageRequest {
  content?: string; // 消息内容
  id?: string;
  receiveUser?: string; // 接收人
  topic?: string; // 队列
  type?: string; // 发送类型
}

/**
 * title: ShortcutMenuDtoResponse
 */
export interface ShortcutMenuDtoResponse {
  appId?: string;
  color?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string;
  invalid?: number;
  linkPage?: string;
  logo?: string;
  menuId?: string;
  menuName?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  sortNum?: number;
  tenantId?: string;
  terminalType?: string;
  type?: string;
  userId?: string;
}

/**
 * title: ShortcutMenuRequest
 */
export interface ShortcutMenuRequest {
  appId?: string; // 应用id
  env?: string; // 环境标识
  menuId?: string; // 菜单id
  sortNum?: number; // 排序
  terminalType?: string; // 快捷菜单类型（WEB/MOBILE/PAD）
  type?: string; // 类型 应用/菜单
}

/**
 * title: ShortcutMenuResponse
 */
export interface ShortcutMenuResponse {
  appId?: string; // 应用id
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  menuId?: string; // 菜单id
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  sortNum?: number; // 排序
  tenantId?: string; // 租户id
  terminalType?: string; // 快捷菜单类型（WEB/MOBILE）
  type?: string; // 类型 应用/菜单
  userId?: string; // 用户id
}

/**
 * title: SignLogRequest
 */
export interface SignLogRequest {
  address?: string; // 地址
  appId?: string; // 应用
  beginCreateTime?: string; // 操作时间起
  branchId?: string; // 分支id
  createUserId?: string; // 创建人
  endCreateTime?: string; // 操作时间止
  env?: string; // 环境
  eventType?: number; // 事件类型,0登出/1登录
  ip?: string; // IP
  jumpTag?: number; // 租户/应用跳转标识
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  personal?: boolean; // 个人设置
  platform?: string; // 平台
  signWay?: string; // 登录/登出方式
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  source?: string; // 客户端类型,mobile手机端/pc电脑端
  tenantId?: string; // 租户Id
  userName?: string; // 账号
}

/**
 * title: SignLogRequestDTO
 */
export interface SignLogRequestDTO {
  appId?: string; // appId
  appIdOut?: string; // 切出appId
  browser?: string; // 浏览器标识
  changeApp?: boolean; // 营业部切换
  changePlatform?: boolean; // 页面切换
  changeTenant?: boolean; // 租户切换
  env?: string; // 环境
  pageTag?: string; // 浏览器页面标识
  platformIn?: string; // 切入平台
  platformOut?: string; // 切出平台
  signWay?: string; // 登录方式
  tenantIn?: string; // 切入租户
  tenantOut?: string; // 切出租户
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
 * title: SingleRequest
 */
export interface SingleRequest {
  id?: string; // id
}

/**
 * title: SingleRolePermission
 */
export interface SingleRolePermission {
  id?: string;
  permissionId?: string; // 权限id 集合
  roleId?: string; // 角色id
}

/**
 * title: SmsDto
 */
export interface SmsDto {
  accessKeyId?: string; // accseeKeyId
  accessKeySecret?: string; // accessKeySecret
  country?: string; // 国际区号
  phoneNumbers?: string; // 电话号码
  sdkAppId?: string; // 短信应用id
  serviceProvider?: string; // 供应商
  signName?: string; // 短信签名
  templateCode?: string; // 短信模板
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
 * title: SqlResult
 */
export interface SqlResult {
  columns?: Array<ColumnInformationSchema>; // 列名
  rows?: Array<object>; // 行数据
}

/**
 * title: StartedProcessResponse
 */
export interface StartedProcessResponse {
  appTag?: string; // 应用标识
  assigneeNames?: string; // 处理人名称
  assignees?: string; // 处理人IDs
  endTime?: string; // 结束时间
  envTag?: string; // 环境 dev prod
  id?: string; // 主键
  processId?: string; // 流程ID
  processInstanceId?: string; // 流程实例ID
  processName?: string; // 流程名称
  processTitle?: string; // 流程标题
  result?: string; // Normal\rollback|Rejected\withdraw
  startTime?: string; // 开始时间
  status?: string; // Running|fininshed
  taskNames?: string; // 当前节点名称
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
  value?: string; // 配置内容
}

/**
 * title: SysConfigResponse
 */
export interface SysConfigResponse {
  configEnum?: string; // 配置枚举
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
 * title: TableColumnDTO
 */
export interface TableColumnDTO {
  env: string; // 环境(dev/开发,test/测试,prod/生产)
  key: string; // 数据源key
  script: string; // sql脚本
}

/**
 * title: TableHeaderMapping
 */
export interface TableHeaderMapping {
  alias?: string;
  fieldKey?: string;
}

/**
 * title: TableInformationSchema
 */
export interface TableInformationSchema {
  description?: string; // 描述信息
  name?: string; // 名称
}

/**
 * title: TaskDelegateRequest
 */
export interface TaskDelegateRequest {
  appProcessList?: Array<AppProcess>; // 流程KEY
  delegateUserId?: string; // 被托管人ID
  endAt?: string; // 结束时间
  startAt?: string; // 开始时间
}

/**
 * title: TaskDelegateResponse
 */
export interface TaskDelegateResponse {
  appProcessList?: Array<AppProcess>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  delegateUserId?: string; // 被托管人ID
  delegateUserName?: string; // 被托管人姓名
  endAt?: string; // 结束时间
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  ownerId?: string; // 所有人ID
  startAt?: string; // 开始时间
  status?: string; // 结束时间
}

/**
 * title: TaskDoneResponse
 */
export interface TaskDoneResponse {
  appTag?: string; // 应用标识
  assignee?: string; // 处理人ID
  envTag?: string; // 环境 dev prod
  id?: string; // 主键
  operator?: string; // 实际操作人
  owner?: string; // 任务所有人(委托时使用)
  processId?: string; // 流程ID
  processInstanceId?: string; // 流程实例ID
  processName?: string; // 流程名称
  processTitle?: string; // 流程标题
  starterId?: string; // 流程发起人ID
  starterName?: string; // 流程发起人名称
  starterOrgId?: string; // 流程发起人主部门ID
  starterOrgName?: string; // 流程发起人主部门名称
  taskEndTime?: string; // 任务结束时间
  taskId?: string; // 任务ID
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
  todoId?: string; // gct_task_todo 表id_
}

/**
 * title: TaskTodoResponse
 */
export interface TaskTodoResponse {
  appTag?: string; // 应用表示
  assignee?: string; // 处理人
  envTag?: string; // 环境 dev prod
  id?: string; // 主键
  owner?: string; // 任务所有人(委托时使用)
  processId?: string; // 流程ID
  processInstanceId?: string; // 流程实例ID
  processName?: string; // 流程名称
  processTitle?: string; // 流程标题
  starterId?: string; // 发起人iD
  starterName?: string; // 发起人姓名
  starterOrgId?: string; // 发起人主部门ID
  starterOrgName?: string; // 发起人主部门名称
  taskId?: string; // 任务ID
  taskName?: string; // 任务名称
  taskStartTime?: string; // 任务开始时间
}

/**
 * title: Tenant
 */
export interface Tenant {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  domainPrefix?: string;
  enabled?: number;
  id?: string;
  managerIds?: Array<string>;
  managerList?: Array<User>;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  orgName?: string;
  testEnvPort?: string;
}

/**
 * title: TenantConfig
 */
export interface TenantConfig {
  developManagement?: number; // 开发者管理启用禁用
}

/**
 * title: TenantDeveloperDTO
 */
export interface TenantDeveloperDTO {
  account?: string;
  appMemberPOList?: Array<AppMemberDto>;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  description?: string;
  id?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string;
  orgNames?: Array<string>; // 所属部门名称
  phone?: string;
  tenantId?: string;
  type?: string;
  userId?: string;
}

/**
 * title: TenantDeveloperRequest
 */
export interface TenantDeveloperRequest {
  description?: string; // 备注
  id?: string;
  type?: string; // 类型(应用管理员/普通开发者)
  userId?: string; // 用户id
}

/**
 * title: TenantDomainRequest
 */
export interface TenantDomainRequest {
  domainPrefix?: string; // 域名前缀
  name?: string; // 租户名称
  testEnvPort?: string; // 测试环境端口号
}

/**
 * title: TenantRequest
 */
export interface TenantRequest {
  domainPrefix?: string; // 域名前缀
  id?: string;
  managerIds?: Array<string>; // 管理员 id 集合
  name?: string; // 租户名称
  testEnvPort?: string; // 测试环境端口号
}

/**
 * title: TenantResponse
 */
export interface TenantResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  domainPrefix?: string; // 域名前缀
  enabled?: number; // 状态 0：禁用 1：启用
  id?: string; // 主键
  managerList?: Array<UserResponse>; // 管理员列表
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 租户名称
  orgName?: string; // 组织名称
  testEnvPort?: string; // 测试环境端口号
}

/**
 * title: TenantUserRemoveRequest
 */
export interface TenantUserRemoveRequest {
  userIds?: Array<string>; // 用户id集合
}

/**
 * title: TenantUserSearchRequest
 */
export interface TenantUserSearchRequest {
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}

/**
 * title: TestDatabaseConnForm
 */
export interface TestDatabaseConnForm {
  dbType?: string;
  driverClassName?: string;
  dsAppId?: string;
  env?: string;
  password?: string;
  type?: string;
  url?: string;
  username?: string;
}

/**
 * title: ThirdAppConfigReq
 */
export interface ThirdAppConfigReq {
  agentId?: string; // 应用唯一标识
  appId?: string; // 企业ID
  authType?: string; // 登录方式类型 枚举 (QIYEWEIXIN/ 企微登录，FEISHU/飞书登录，DINGDING/钉钉登录，MICROSOFT/微软登录)
  redirectURL?: string; // 重定向URL
  secret?: string; // 应用secret
}

/**
 * title: ThirdPartyInvokeLogResponse
 */
export interface ThirdPartyInvokeLogResponse {
  appKey?: string; // 所属应用key
  appName?: string; // 所属应用名称
  body?: string; // 请求体
  clientIp?: string; // 客户端ip
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  env?: string; // 环境
  headers?: string; // 请求头
  id?: string; // 主键
  invokeTime?: string; // 调用时间
  key?: string; // 接口标识
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 接口名称
  params?: string; // 接口参数
  response?: string; // 响应结果
  result?: number; // 调用结果 1：成功 0：失败
  tenantId?: string; // 租户Id
  timeCost?: number; // 接口耗时
  url?: string; // URL
}

/**
 * title: ThirdPartyLoginConfig
 */
export interface ThirdPartyLoginConfig {
  agentId?: string; // 应用唯一标识
  appId?: string; // 企业ID
  authType?: string; // 登录方式类型 枚举 (QIYEWEIXIN/ 企微登录，FEISHU/飞书登录，DINGDING/钉钉登录，MICROSOFT/微软登录)
  certFileName?: string; // 证书文件名
  enabled?: number; // 是否启用
  redirectURL?: string; // 重定向URL
  secret?: string; // 应用secret
}

/**
 * title: User
 */
export interface User {
  avatar?: string;
  birthday?: string;
  code?: string;
  country?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  email?: string;
  empNo?: string;
  enabled?: number; // 启用状态，0：禁用 1：启用 2：未激活
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
  tenantList?: Array<UserTenantDTO>;
  tenantName?: string;
  tenantNames?: string;
  username?: string;
}

/**
 * title: UserAndOrgRequest
 */
export interface UserAndOrgRequest {
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
  managerName?: string; // 直属上级名
  mobile?: string; // 手机号
  orgId?: string; // 组织id
  orgName?: string; // 组织名
  password?: string; // 密码
  platSeat?: boolean; // 平台席位
  signPassword?: string;
  signType?: string; // 签名方式
  signatureImage?: string; // 签名照片
  signatureImageWrite?: string; // 签名手写图片相对路径
  suiteSeat?: boolean; // 套件席位
  telephone?: string; // 座机号码
  userId?: string;
  userOrgList?: Array<UserOrgRequest>; // 用户所在组织列表
  username?: string; // 账号
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
 * title: UserBaseReq
 */
export interface UserBaseReq {
  authCode?: string;
  code?: string; // 授权code
  country?: string; // 国际区号
  password?: string; // 密码
  source?: string;
  username?: string; // 账号
}

/**
 * title: UserCodeDTO
 */
export interface UserCodeDTO {
  newPassword?: string; // 新密码
  newSignPassword?: string; // 新签名密码
  oldPassword?: string; // 当前密码
  oldSignPassword?: string; // 当前签名密码
  type?: string; // 类型(登录密码LOGIN,签名密码SIGN)
  userId?: string; // userId
}

/**
 * title: UserDetailRequest
 */
export interface UserDetailRequest {
  avatar?: string;
  birthday?: string;
  code?: string;
  country?: string;
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  deleted?: number;
  email?: string;
  empNo?: string;
  enabled?: number; // 启用状态，0：禁用 1：启用 2：未激活
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
  tenantList?: Array<UserTenantDTO>;
  tenantName?: string;
  tenantNames?: string;
  username?: string;
}

/**
 * title: UserExtraRequest
 */
export interface UserExtraRequest {
  duty?: string; // 职务
  enabled?: number; // 是否启用
  managerId?: string; // 直属上级
  tenantId?: string; // 租户id
  userId?: string; // 用户id
}

/**
 * title: UserExtraResponse
 */
export interface UserExtraResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  duty?: string; // 职务
  enabled?: number; // 是否启用
  id?: string; // 主键
  managerId?: string; // 直属上级
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  tenantId?: string; // 租户id
  userId?: string; // 用户id
}

/**
 * title: UserFieldMeta
 */
export interface UserFieldMeta {
  key?: string; // 字段key
  name?: string; // 名称
}

/**
 * title: UserIdAndPrincipal
 */
export interface UserIdAndPrincipal {
  principal?: string;
  userId?: string;
}

/**
 * title: UserIdsDTO
 */
export interface UserIdsDTO {
  userIds?: Array<string>; // userIds
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
 * title: UserInfoLogRequest
 */
export interface UserInfoLogRequest {
  name?: string; // 操作用户名称
  operate?: string; // 操作名称
  recordFieldJson?: string; // 变更记录json
  tenantId?: string; // 租户ID
  userId?: string; // 操作用户id
}

/**
 * title: UserInfoLogResponse
 */
export interface UserInfoLogResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // $column.comments
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 操作用户名称
  operate?: string; // 操作名称
  recordFieldJson?: string; // 变更记录json
  tenantId?: string; // 租户ID
  userId?: string; // 操作用户id
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
 * title: UserLoginResp
 */
export interface UserLoginResp {
  avatar?: string; // 头像url相对路径
  birthday?: string; // 生日
  country?: string; // 国家
  createTime?: string; // 创建时间
  email?: string; // 邮箱
  empNo?: string; // 工号
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
  globalSuperAdmin?: number; // 是否全局超管,0: 否 1: 是
  ip?: string; // 客户端ip
  match?: boolean;
  minioDomain?: string; // minio 域名地址
  mobile?: string; // 手机号码
  mqttProperties?: MqttPropertiesDTO; // mqtt配置
  orgIds?: Array<string>; // 用户所属组织id集合
  platTicket?: string;
  platformManager?: number; // 是否为平台管理员,0: 否 1: 是
  platformManagerPermissions?: Array<string>; // 平台管理员权限点列表
  signType?: string; // 签名类型
  signWay?: string; // 登录方式
  signatureImage?: string; // 签名照片url相对路径
  signatureImageWrite?: string; // 签名手写路径
  suiteTicket?: string;
  telephone?: string; // 座机号码
  tenantList?: Array<UserTenantDTO>; // 租户列表
  token?: string; // token
  userId?: string; // 用户 ID
  username?: string; // 账号
}

/**
 * title: UserOfTenantDTO
 */
export interface UserOfTenantDTO {
  globalSuperAdmin?: number; // 是否全局超管,0: 否 1: 是
  masterOrgId?: string; // 主部门id
  masterOrgName?: string; // 主部门名称
  tenantDeveloper?: number; // 是否为开发者,0: 否 1: 是
  tenantDeveloperType?: string; // 开发者类型(应用管理员/普通开发者)
  tenantManager?: number; // 是否为租户管理员,0: 否 1: 是
  tenantManagerPermissions?: Array<string>; // 租户管理员权限点列表
  tenantSuperAdmin?: number; // 是否租户超管,0: 否 1: 是
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
 * title: UserPasswordHistoryRequest
 */
export interface UserPasswordHistoryRequest {
  oldPassword?: string; // 旧密码
  password?: string; // 新密码
  type?: string; // 类型(登录密码LOGIN,签名密码SIGN)
  userId?: string; // 用户id
}

/**
 * title: UserPasswordHistoryResponse
 */
export interface UserPasswordHistoryResponse {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  id?: string; // 主键
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  oldPassword?: string; // 旧密码
  password?: string; // 新密码
  type?: string; // 类型(登录密码LOGIN,签名密码SIGN)
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
 * title: UserRoleRequest
 */
export interface UserRoleRequest {
  description?: string; // 备注
  roleIds?: Array<string>; // 角色id 集合
  roles?: string;
  userIds?: Array<string>; // 用户id 集合
  users?: string;
}

/**
 * title: UserRoles4Update
 */
export interface UserRoles4Update {
  description?: string; // 备注
  roleIds?: Array<string>; // 角色id 集合
  userId?: string; // 用户id
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
 * title: UserSettingsDTO
 */
export interface UserSettingsDTO {
  avatar?: string; // 头像url相对路径
  country?: string; // 国家区号
  email?: string; // 邮箱
  fullname?: string; // 姓名
  gender?: number; // 性别
  mobile?: string; // 手机号码
  platTicket?: string;
  signType?: string; // 签名类型
  signatureImage?: string; // 签名上传url相对路径
  signatureImageWrite?: string; // 签名手写路径
  suiteTicket?: string;
}

/**
 * title: UserSyncFromThirdPartyRequest
 */
export interface UserSyncFromThirdPartyRequest {
  idField?: string; // 用户唯一标识字段，必须为 username/empNo/mobile，默认为 username
  users?: Array<UserSaveRequest>; // 用户列表
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
 * title: WXWorkConfig
 */
export interface WXWorkConfig {
  agentId?: number; // 应用唯一标识
  corpId?: string; // 企业ID
  enabled?: number; // 是否启用
  redirectURL?: string; // 重定向URL
  retryTimes?: number;
  secret?: string; // 应用secret
}

/**
 * title: WhereRelation
 */
export interface WhereRelation {
  conditions?: Array<object>; // List对象可以是WhereItem,也可以是WhereRelation本身,实现递归
  relation?: string; // AND or OR
}

/**
 * title: WorkbenchComponentRelationBatchRequest
 */
export interface WorkbenchComponentRelationBatchRequest {
  batchDto?: Array<RelationBatchDto>;
}

/**
 * title: WorkbenchComponentRelationDragRequest
 */
export interface WorkbenchComponentRelationDragRequest {
  id?: string; // 用户工作台数据id
  targetSortNum?: number; // 目标位置排序序号
  userId?: string; // 用户id
}

/**
 * title: WorkbenchComponentRelationRequest
 */
export interface WorkbenchComponentRelationRequest {
  enabled?: number; // 状态(开启/关闭)
  positionJson?: string; // 组件位置信息
  sortNum?: number; // 排序序号
  userId?: string; // 用户id
  workbenchComponentId?: string; // 工作台主键id
}

/**
 * title: WorkbenchComponentRelationResponse
 */
export interface WorkbenchComponentRelationResponse {
  appVersionTag?: string; // 应用版本标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  enabled?: number; // 状态(开启/关闭)
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  positionJson?: string; // 组件位置信息
  sortNum?: number; // 排序序号
  userId?: string; // 用户id
  workbenchComponentId?: string; // 工作台主键id
  workbenchComponentName?: string; // 工作台名称
}

/**
 * title: WorkbenchComponentRequest
 */
export interface WorkbenchComponentRequest {
  description?: string; // 描述
  name?: string; // 组件名称
  terminalType?: string; // 终端类型(web/mobile)
}

/**
 * title: WorkbenchComponentResponse
 */
export interface WorkbenchComponentResponse {
  appVersionTag?: string; // 应用版本标识
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  description?: string; // 描述
  id?: string; // ID
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name?: string; // 组件名称
  terminalType?: string; // 终端类型(web/mobile)
  type?: string; // 组件分类(内置builtin/自定义custom)
}

/**
 * title: 共享自定义组件实体类
 */
export interface 共享自定义组件实体类 {
  create_date?: string; // 创建时间
  id?: string; // 主键
  isShare?: string;
  is_share?: string; // 是否共享
  name?: string; // 组件名称
  scriptCode?: string;
  script_code?: string; // 脚本代码
  styleCode?: string;
  style_code?: string; // 样式代码
  templateCode?: string;
  template_code?: string; // 模板代码
  thumbnail?: string; // 缩略图
  update_date?: string; // 更新时间
  uploaderId?: string;
  uploaderUsername?: string;
  uploader_id?: string; // 上传者ID
  uploader_username?: string; // 上传者用户名
}

/**
 * title: 共享自定义组件查询参数
 */
export interface 共享自定义组件查询参数 {
  is_share?: string;
  keyword?: string; // 搜索字符串
  name?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  uploader_id?: string;
}

/**
 * title: 发布
 */
export interface 发布 {
  encrypt?: number;
  password?: string;
  projectId?: string;
  publish?: number;
}

/**
 * title: 可排序查询参数对象
 */
export interface 可排序查询参数对象 {
  dirPath?: string;
  fileName?: string;
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
}

/**
 * title: 地图GeoJson查询参数
 */
export interface 地图GeoJson查询参数 {
  adcode?: string;
  alias_name?: string;
  keyword?: string; // 搜索字符串
  level?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
}

/**
 * title: 地图GeoJson表实体类Req
 */
export interface 地图GeoJson表实体类Req {
  adcode?: string;
  aliasName?: string;
  alias_name?: string;
  create_date?: string; // 创建时间
  id?: string; // 主键
  jsonData?: string;
  json_data?: string;
  level?: string;
  remark?: string;
}

/**
 * title: 地图GeoJson表实体类Res
 */
export interface 地图GeoJson表实体类Res {
  adcode?: string;
  alias_name?: string;
  create_date?: string; // 创建时间
  id?: string; // 主键
  json_data?: string;
  level?: string;
  remark?: string;
}

/**
 * title: 导入组件JSON数据表单数据
 */
export interface 导入组件JSON数据表单数据 {
  compInfoTypeId?: string;
  jsonData?: string;
}

/**
 * title: 操作日志查询参数
 */
export interface 操作日志查询参数 {
  id?: string;
  is_admin?: string;
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  page_id?: string;
  request_method?: string;
  request_uri?: string;
  user_id?: string;
  username?: string;
}

/**
 * title: 收藏组件分组查询参数
 */
export interface 收藏组件分组查询参数 {
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
}

/**
 * title: 收藏组件查询参数
 */
export interface 收藏组件查询参数 {
  group_id?: string;
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
}

/**
 * title: 数据库数据源查询参数
 */
export interface 数据库数据源查询参数 {
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
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

/**
 * title: 登录日志查询参数
 */
export interface 登录日志查询参数 {
  ip?: string;
  keyword?: string; // 搜索字符串
  login_state?: string;
  login_time?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  username?: string;
}

/**
 * title: 组件信息查询参数
 */
export interface 组件信息查询参数 {
  alias_name?: string;
  keyword?: string; // 搜索字符串
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  type_id?: string;
}

/**
 * title: 组件信息表实体类
 */
export interface 组件信息表实体类 {
  aliasName?: string;
  alias_name?: string; // 别名
  classify?: string; // 归类
  create_date?: string; // 创建时间
  enabled?: string; // 是否可用，0：不可用；1：可用
  id?: string; // 主键
  name?: string; // 组件文件名
  remark?: string; // 备注
  thumbnailUri?: string;
  thumbnail_uri?: string; // 缩略图URI
  typeId?: string;
  type_id?: string; // 所属分组ID
}

/**
 * title: 组件分组查询参数
 */
export interface 组件分组查询参数 {
  keyword?: string; // 搜索字符串
  name?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
}

/**
 * title: 组件分组表实体类
 */
export interface 组件分组表实体类 {
  create_date?: string; // 创建时间
  icon?: string; // 图标
  id?: string; // 主键
  name?: string; // 分组名称
  remark?: string; // 备注
  sort?: number; // 排序
}

/**
 * title: 组件收藏分组表实体类
 */
export interface 组件收藏分组表实体类 {
  create_date?: string; // 创建时间
  enshrineComps?: Array<组件收藏表实体类>;
  groupName?: string;
  group_name?: string;
  id?: string; // 主键
  remark?: string;
  sort?: number;
  user_id?: string;
}

/**
 * title: 组件收藏表实体类
 */
export interface 组件收藏表实体类 {
  componentName?: string;
  component_name?: string;
  create_date?: string; // 创建时间
  enshrineName?: string;
  enshrine_name?: string;
  groupId?: string;
  group_id?: string;
  id?: string; // 主键
  layoutItemObj?: string;
  layout_item_obj?: string;
  remark?: string;
  thumbnailUri?: string;
  thumbnail_uri?: string;
  type?: string;
  user_id?: string;
}

/**
 * title: 结果集过滤器表实体类
 */
export interface 结果集过滤器表实体类 {
  create_date?: string; // 创建时间
  filterCode?: string;
  filter_code?: string;
  id?: string; // 主键
  name?: string;
  user_id?: string;
}

/**
 * title: 设置快照状态表单数据
 */
export interface 设置快照状态表单数据 {
  enabled: string;
  id?: string;
  pageId?: string;
}

/**
 * title: 资源分组表实体类
 */
export interface 资源分组表实体类 {
  create_date?: string; // 创建时间
  id?: string; // 主键
  name?: string;
  userId?: string;
  user_id?: string;
}

/**
 * title: 资源查询参数
 */
export interface 资源查询参数 {
  group_id?: string;
  keyword?: string; // 搜索字符串
  original_file_name?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
}

/**
 * title: 页面快照表实体类
 */
export interface 页面快照表实体类 {
  create_date?: string; // 创建时间
  enabled?: string;
  id?: string; // 主键
  isLock?: string;
  is_lock?: string;
  layout?: string;
  name?: string;
  pageId?: string;
  page_id: string;
  remark?: string;
  themeJson?: string;
  theme_json?: string;
}

/**
 * title: 页面模板查询参数
 */
export interface 页面模板查询参数 {
  enabled?: string;
  id?: string;
  is_sys?: string;
  keyword?: string; // 搜索字符串
  name?: string;
  pageIndex?: number; // 页码,默认为1
  pageSize?: number; // 页大小,默认为10
  pageSorts?: Array<OrderItem>; // 排序
  user_id?: string;
}

/**
 * title: 页面模板表实体类
 */
export interface 页面模板表实体类 {
  create_date?: string; // 创建时间
  developCanvas?: string;
  develop_canvas?: string;
  enabled?: string;
  id?: string; // 主键
  isSys?: string;
  is_sys?: string;
  layout?: string;
  name: string;
  themeJson?: string;
  theme_json?: string;
  thumbnail?: string;
  userId?: string;
  user_id?: string;
}
