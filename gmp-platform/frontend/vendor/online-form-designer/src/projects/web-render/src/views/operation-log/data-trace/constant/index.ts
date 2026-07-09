import { useI18n } from '/@/hooks/web/useI18n';

import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

import type { SelectProps } from 'ant-design-vue';

const { t } = useI18n();

/**
 * 操作类型
 */
export enum OperateTypeEnum {
  /** 删除 */
  DELETE = 'DELETE',
  /** 创建 */
  INSERT = 'INSERT',
  /** 修改 */
  UPDATE = 'UPDATE',
  /** 笔记授权 */
  UPDATE_LICENSE = 'UPDATE_LICENSE',
  /** 移除并交接 */
  DELETE_AND_HANDOVER = 'DELETE_AND_HANDOVER',
  /** 移动 */
  MOVE = 'MOVE',
  /** 禁用 */
  DISABLE = 'DISABLE',
  /** 启用 */
  ENABLE = 'ENABLE',
  /** 启用或禁用 */
  ENABLE_OR_DISABLE = 'ENABLE_OR_DISABLE',
  /** 重置登录密码 */
  RESET = 'RESET',
  /** 重置签名密码 */
  RESET_SIGN = 'RESET_SIGN',
  /** 应用上下文中获取 */
  CONTEXT = 'CONTEXT',
  /** 新增或更新 */
  SAVE_OR_UPDATE = 'SAVE_OR_UPDATE',
  /** 查询 */
  SELECT = 'SELECT',
  /** 导入 */
  IMPORT = 'IMPORT',
  /** 导出 */
  EXPORT = 'EXPORT',
  /** 激活 */
  ACTIVATE = 'ACTIVATE',
  /** 上传 */
  UPLOAD = 'UPLOAD',
  /** 测试打印 */
  TEST_PRINT = 'TEST_PRINT',
  /** 消息验证 */
  MESSAGE_CHECK = 'MESSAGE_CHECK',
  /** 移除并交接 */
  CONNECT_TEST = 'CONNECT_TEST',
  /** 新建集团 */
  INSERT_GROUIP = 'INSERT_GROUIP',
  /** 新建公司 */
  INSERT_COMPANY = 'INSERT_COMPANY',
  /** 添加下级公司 */
  INSERT_NEXT_LEVEL_COMPANY = 'INSERT_NEXT_LEVEL_COMPANY',
  /** 添加下级部门 */
  INSERT_NEXT_LEVEL_DEPARTMENT = 'INSERT_NEXT_LEVEL_DEPARTMENT',
  /** 编辑组织 */
  UPDATE_ORG = 'UPDATE_ORG',
  /** 删除组织 */
  DELETE_ORG = 'DELETE_ORG',
  /** 添加 */
  ADD = 'ADD',
  /** 权限配置 */
  PERMISSION_CONFIG = 'PERMISSION_CONFIG',
  /** 添加用户 */
  ADD_USER = 'ADD_USER',
  /** 移除 */
  REMOVE = 'REMOVE',
  /** 设为默认 */
  SET_DEFAULT = 'SET_DEFAULT',
  /** 添加管理员 */
  ADD_ADMIN = 'ADD_ADMIN',
  /** 添加可使用组织 */
  ADD_CAN_BE_USED_ORGANIZATION = 'ADD_CAN_BE_USED_ORGANIZATION',
  /** 添加可见范围 */
  ADD_VISIBILITY = 'ADD_VISIBILITY',
  /** 删除可见范围 */
  DELETE_VISIBILITY = 'DELETE_VISIBILITY',
  /** 删除可使用组织 */
  DELETE_CAN_BE_USED_ORGANIZATION = 'DELETE_CAN_BE_USED_ORGANIZATION',
  /** 删除管理员 */
  DELETE_ADMIN = 'DELETE_ADMIN',
  /** 编辑应用信息 */
  UPDATE_APP = 'UPDATE_APP',
  /** 添加成员 */
  ADD_MEMBER = 'ADD_MEMBER',
  /** 移交成员 */
  HANDOVER_MEMBER = 'HANDOVER_MEMBER',
  /** 移除成员 */
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  /** 创建版本/分支 */
  CREATE_VERSION_BATCH = 'CREATE_VERSION_BATCH',
  /** 合并版本分支 */
  MERGE_VERSION_BATCH = 'MERGE_VERSION_BATCH',
  /** 切换版本分支 */
  SWITCH_VERSION_BATCH = 'SWITCH_VERSION_BATCH',
  /** 添加授权 */
  ADD_AUTH = 'ADD_AUTH',
  /** 解绑授权 */
  UNBIND = 'UNBIND',
  /** 解绑 */
  UNBIND_1 = 'UNBIND_1',
  /** 新建分类 */
  ADD_CATEGORY = 'ADD_CATEGORY',
  /** 新建分类 */
  CATEGORY_NEW = 'CATEGORY_NEW',
  /** 编辑分类 */
  UPDATE_CATEGORY = 'UPDATE_CATEGORY',
  /** 删除分类 */
  DELETE_CATEGORY = 'DELETE_CATEGORY',
  /** 更换分类 */
  CHANGE_CATEGORY = 'CHANGE_CATEGORY',
  /** 创建应用 */
  CREATE_APP = 'CREATE_APP',
  /** 导入应用 */
  UPLOAD_APP = 'UPLOAD_APP',
  /** 导入分支 */
  IMPORT_BATCH = 'IMPORT_BATCH',
  /** 导出版本 */
  EXPORT_VERSION = 'EXPORT_VERSION',
  /** 分配导航菜单 */
  ASS_NAV_MENUE = 'ASS_NAV_MENUE',
  /** 备注 */
  REMARK = 'REMARK',
  /** 配置 */
  MESSAGE_CONF = 'MESSAGE_CONF',
  /** 授权 */
  AUTH = 'AUTH',
  /** 重命名分类 */
  CATEGORY_RENAME = 'CATEGORY_RENAME',
  /** 下载 */
  DOWNLOAD = 'DOWNLOAD',
  /** 删除分类 */
  CATEGORY_DELETE = 'CATEGORY_DELETE',
  /** 覆写 */
  REWRITE = 'REWRITE',
  /** 开放 */
  OEPN = 'OEPN',
  /** 恢复 */
  RECYCLED = 'RECYCLED',
  /** 复制 */
  COPY = 'COPY',
  /** 设计 */
  DESIGN = 'DESIGN',
  /** 导入标签模板 */
  LABEL_IMPORT = 'LABEL_IMPORT',
  /** 激活 */
  ACTIVE = 'ACTIVE',
  /** 开发 */
  DEVELOP = 'DEVELOP',
  /** 手动触发 */
  MANUAL_TRIGGER = 'MANUAL_TRIGGER',
  /** 公开模板 */
  PUBLISH = 'PUBLISH',
  /** 添加权限菜单 */
  ADD_PERMISSSION_MENU = 'ADD_PERMISSSION_MENU',
  /** 分配应用首页 */
  ASSIGN = 'ASSIGN',
  /** 提交 */
  SUBMIT = 'SUBMIT',
  /** 发布验证 */
  DEPLOY_TESTING = 'DEPLOY_TESTING',
  /** 创建发行 */
  CREATE_RELEASE = 'CREATE_RELEASE',
  /** 发布生产 */
  DEPLOY_PROD = 'DEPLOY_PROD',
  /** 权限配置 */
  PERMISSION_EDIT = 'PERMISSION_EDIT',
  /** 一键修改 */
  ONECLICK_EDIT = 'ONECLICK_EDIT',
  /** 测试 */
  TEST = 'TEST',
  /** 版本创建 */
  VERSION_CREATE = 'VERSION_CREATE',
  /** 版本复制 */
  VERSION_COPY = 'VERSION_COPY',
  /** 移出应用 */
  REMOVE_APP = 'REMOVE_APP',
  /** 配置 */
  CONFIG = 'CONFIG',
  /** 终止 */
  TERMINATE = 'TERMINATE',
  /** 转交 */
  REASSIGN = 'REASSIGN',
  /** 回退上一版本 */
  ROOLBACK = 'ROOLBACK',
  /** 发布 */
  DEPLOY = 'DEPLOY',
  /** 取消发布 */
  CANCEL_DEPLOY = 'CANCEL_DEPLOY',
  /** 彻底删除 */
  COMPLETE_DELETE = 'COMPLETE_DELETE',
  /** 还原 */
  RESTORE = 'RESTORE',
  /** 编辑授权 */
  EDIT_AUTH = 'EDIT_AUTH',
  /** 修改印章密码 */
  // CHANGE_SEAL_PASSWORD = 'CHANGE_SEAL_PASSWORD',
  /** 修改密码 */
  UPDATE_SEAL_PASSWORD = 'UPDATE_SEAL_PASSWORD',
  // btw 标签
  BTW_TRANSFORM = 'BTW_TRANSFORM',
}

/**
 * 所属应用模块
 */
export enum BizModelTypeEnum {
  /** 基础设置 */
  BASIC_SETTING = 'BASIC_SETTING',
  /** 一键部署 */
  DEPLOY = 'DEPLOY',
  /** 全局事件 */
  GLOBAL_EVENT = 'GLOBAL_EVENT',
  /** 国际化 */
  LANGUAGE = 'LANGUAGE',
  /** 逻辑开发 */
  LOGIC_DEVELOP = 'LOGIC_DEVELOP',
  /** 定时任务 */
  SCHEDULE_JOB = 'SCHEDULE_JOB',
  /** 菜单设置 */
  MENU_SETTING = 'MENU_SETTING',
  /** 模型设计 */
  MODEL_DESIGN = 'MODEL_DESIGN',
  /** 页面设计 */
  PAGE_DESIGN = 'PAGE_DESIGN',
  /** 打印设计 */
  PRINT_DESIGN = 'PRINT_DESIGN',
  /** 流程设计 */
  PROCESS_DESIGN = 'PROCESS_DESIGN',
  /** 系统变量 */
  SYSTEM_VARIABLES = 'SYSTEM_VARIABLES',
  /** 版本管理 */
  VERSION_CONTROL = 'VERSION_CONTROL',
  /** 消息模板 */
  MESSAGE_TMPL = 'MESSAGE_TMPL',
  /** "移动端应用首页 */
  MOBILE_HOMEPAGE = 'MOBILE_HOMEPAGE',
  /** eDHR设计 */
  EDHR_TMPL = 'EDHR_TMPL',
  /** 表单设计 */
  ONLINE_FORM_TMPL = 'ONLINE_FORM_TMPL',
  /** 用户管理 */
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  /** 角色管理 */
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  /** 后台管理员 */
  PLAT_ADMIN = 'PLAT_ADMIN',
  /** 组织成员 */
  ORGANIZATION_MENMBERS = 'ORGANIZATION_MENMBERS',
  /** 权限管理 */
  PERMISSION_MANAGEMENT = 'PERMISSION_MANAGEMENT',
  /** 席位管理 */
  SEAT_MANAGEMENT = 'SEAT_MANAGEMENT',
  /** 租户列表 */
  TENANT_LIST = 'TENANT_LIST',
  /** 平台设置 */
  PLATFORM_SETTING = 'PLATFORM_SETTING',
  /** 语言管理 */
  LANGUAGE_MANAGEMENT = 'LANGUAGE_MANAGEMENT',
  /** 翻译管理 */
  TRANLATION_MANAGEMENT = 'TRANLATION_MANAGEMENT',
  /** 平台授权 */
  PLATFORM_AUTHORISATION = 'PLATFORM_AUTHORISATION',
  /** BI授权 */
  MODULE_AUTHORISATION = 'MODULE_AUTHORISATION',
  /** 应用设置 */
  APP_SETTING = 'APP_SETTING',
  /** 开发人员 */
  DEVELOPER = 'DEVELOPER',
  /** 印章管理 */
  SEAL_MANAGEMENT = 'SEAL_MANAGEMENT',
  /** 应用管理 */
  APP_MANAGEMENT = 'APP_MANAGEMENT',
  /** 资源管理 */
  RESOURCE_MANAGEMENT = 'RESOURCE_MANAGEMENT',
  /** 基础设置 */
  BASE_SETTING = 'BASE_SETTING',
  /** 移动端设计 */
  MOBILE_DESIGN = 'MOBILE_DESIGN',
  /** 打印机管理 */
  PRINTER_MANAGE = 'PRINTER_MANAGE',
  /** 消息通知管理 */
  MESSAGE_NOTIFY = 'MESSAGE_NOTIFY',
  /** 数据源管理 */
  DATASOURCE_MANAGE = 'DATASOURCE_MANAGE',
  /** API管理 */
  API_MANAGE = 'API_MANAGE',
  /** 验证环境管理 */
  TEST_ENV_MANAGE = 'TEST_ENV_MANAGE',
  /** 水印设置 */
  WATERMARK_SETTING = 'WATERMARK_SETTING',
  /** 数据库运维 */
  DATASOURCE_DEVOPS = 'DATASOURCE_DEVOPS',
  /** 安全设置 */
  SECURITY_SETTING = 'SECURITY_SETTING',
  /** 登录设置 */
  LOGIN_SETTING = 'LOGIN_SETTING',
  /** 主题设置 */
  THEME_SETTING = 'THEME_SETTING',
  /** 组织设置 */
  ORGANIZATION_SETTING = 'ORGANIZATION_SETTING',
  /** APK设置 */
  APK_SETTING = 'APK_SETTING',
  /** 审计日志 */
  AUDITLOG = 'AUDITLOG',
  /** 专业应用 */
  PRO_APP = 'PRO_APP',
  /** 图标资源 */
  ICON_RESOURCE = 'ICON_RESOURCE',
  /** 图片资源 */
  IMAGE_RESOURCE = 'IMAGE_RESOURCE',
  /** 自定义导航菜单 */
  NAV_MENU = 'NAV_MENU',
  /** 自定义导航页面 */
  NAV_PAGE = 'NAV_PAGE',
  /** 打印服务 */
  PRINT_SERVICE = 'PRINT_SERVICE',
  /** NET_PRINTER */
  NET_PRINTER = 'NET_PRINTER',
  /** API分组 */
  API_CATEGORY = 'API_CATEGORY',
  /** API密钥管理 */
  API_KEY = 'API_KEY',
  /** API调用日志 */
  API_CALL_LOG = 'API_CALL_LOG',
  /** 标签打印 */
  LABEL_DESIGN = 'LABEL_DESIGN',
  // btw 标签打印
  BTW_LABEL_DESIGN = 'BTW_LABEL_DESIGN',
  /** 单据打印 */
  // DOCUMENT_DESIGN = 'DOCUMENT_DESIGN',
  /** 逻辑编排 */
  // SO_DEVELOP = 'SO_DEVELOP',
  /** 应用部署 */
  APP_DEPLOY = 'APP_DEPLOY',
  /** 数据运维 */
  DATA_OPERATION = 'DATA_OPERATION',
  /** 审计日志 */
  AUDIT_LOG = 'AUDIT_LOG',
  /** 用户组 */
  USER_GROUP = 'USER_GROUP',
  /** 角色管理 */
  ROLE = 'ROLE',
  /** 在线用户 */
  ONLINE_USER = 'ONLINE_USER',
  /** 审批流管理 */
  PROCESS_MANAGE = 'PROCESS_MANAGE',
  /** 审批流实例管理 */
  PROCESS_INSTANCE_MANAGE = 'PROCESS_INSTANCE_MANAGE',
  /** 回收站 */
  RESTORE = 'RESTORE',
  /** 生产环境管理 */
  PRO_ENV_MANAGE = 'PRO_ENV_MANAGE',
  /** 自定义页面组件 */
  CUS_PAGE_COMP = 'CUS_PAGE_COMP',
  /** 报表设计 */
  report_module = 'report_module',
  /** 数据集 */
  REPORT_DATA_SET = 'REPORT_DATA_SET',
  /** 公共信息卡 */
  COMMON_INFO_CARD = 'COMMON_INFO_CARD',
  /** 个人信息 */
  PERSONAL_INFORMATION = 'PERSONAL_INFORMATION',
  /** 修改密码 */
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export const ModelTypeOptions = {
  BACKEND_MANAGEMENT: [
    {
      label: t('sys.menu.userManagement'),
      value: BizModelTypeEnum.USER_MANAGEMENT,
    },
    {
      label: t('sys.menu.orgMember'),
      value: BizModelTypeEnum.ORGANIZATION_MENMBERS,
    },
    {
      label: t('sys.menu.roleManagement'),
      value: BizModelTypeEnum.ROLE_MANAGEMENT,
    },
    {
      label: t('sys.menu.administrator'),
      value: BizModelTypeEnum.PLAT_ADMIN,
    },
    {
      label: t('sys.menu.seatManagement'),
      value: BizModelTypeEnum.SEAT_MANAGEMENT,
    },
    {
      label: t('sys.menu.tenantList'),
      value: BizModelTypeEnum.TENANT_LIST,
    },
    {
      label: t('sys.menu.basicSetting'),
      value: BizModelTypeEnum.BASE_SETTING,
    },
    {
      label: t('sys.platform.watermarkSetting'),
      value: BizModelTypeEnum.WATERMARK_SETTING,
    },
    {
      label: t('sys.platform.securitySetting'),
      value: BizModelTypeEnum.SECURITY_SETTING,
    },
    {
      label: t('sys.platform.loginSetting'),
      value: BizModelTypeEnum.LOGIN_SETTING,
    },
    {
      label: t('sys.platform.themeSetting'),
      value: BizModelTypeEnum.THEME_SETTING,
    },
    {
      label: t('sys.platform.orgSetting'),
      value: BizModelTypeEnum.ORGANIZATION_SETTING,
    },
    {
      label: t('sys.platform.apkSetting'),
      value: BizModelTypeEnum.APK_SETTING,
    },
    {
      label: t('sys.menu.languageManagement'),
      value: BizModelTypeEnum.LANGUAGE_MANAGEMENT,
    },
    {
      label: t('sys.menu.i18nManagement'),
      value: BizModelTypeEnum.TRANLATION_MANAGEMENT,
    },
    {
      label: t('sys.menu.platformAuthorization'),
      value: BizModelTypeEnum.PLATFORM_AUTHORISATION,
    },
    {
      label: t('sys.license.moduleLisence'),
      value: BizModelTypeEnum.MODULE_AUTHORISATION,
    },
    {
      label: t('sys.changePassword'),
      value: BizModelTypeEnum.CHANGE_PASSWORD,
    },
  ],
  TENANT_CENTER: [
    {
      label: t('sys.menu.userManagement'),
      value: BizModelTypeEnum.USER_MANAGEMENT,
    },
    {
      label: t('sys.menu.orgMember'),
      value: BizModelTypeEnum.ORGANIZATION_MENMBERS,
    },
    {
      label: t('sys.menu.roleManagement'),
      value: BizModelTypeEnum.ROLE_MANAGEMENT,
    },
    {
      label: t('sys.menu.administrator'),
      value: BizModelTypeEnum.PLAT_ADMIN,
    },
    {
      label: t('sys.menu.seatManagement'),
      value: BizModelTypeEnum.SEAT_MANAGEMENT,
    },
    {
      label: t('sys.menu.appSetting'),
      value: BizModelTypeEnum.APP_SETTING,
    },
    {
      label: t('sys.menu.developer'),
      value: BizModelTypeEnum.DEVELOPER,
    },
    {
      label: t('sys.app.pro'),
      value: BizModelTypeEnum.PRO_APP,
    },
    {
      label: t('sys.developer.assetCenter.iconResource'),
      value: BizModelTypeEnum.ICON_RESOURCE,
    },
    {
      label: t('sys.developer.assetCenter.imgResource'),
      value: BizModelTypeEnum.IMAGE_RESOURCE,
    },
    {
      label: t('sys.menu.sealManagement'),
      value: BizModelTypeEnum.SEAL_MANAGEMENT,
    },
    {
      label: t('sys.menu.basicSetting'),
      value: BizModelTypeEnum.BASE_SETTING,
    },
    {
      label: t('sys.menu.personalInfo'),
      value: BizModelTypeEnum.PERSONAL_INFORMATION,
    },
    {
      label: t('sys.changePassword'),
      value: BizModelTypeEnum.CHANGE_PASSWORD,
    },
  ],
  DEVELOPER: [
    {
      label: t('sys.app.pro'),
      value: BizModelTypeEnum.PRO_APP,
    },
    {
      label: t('sys.menu.customNavMenu'),
      value: BizModelTypeEnum.NAV_MENU,
    },
    {
      label: t('sys.menu.customNavPage'),
      value: BizModelTypeEnum.NAV_PAGE,
    },
    {
      label: t('sys.developer.assetCenter.iconResource'),
      value: BizModelTypeEnum.ICON_RESOURCE,
    },
    {
      label: t('sys.developer.assetCenter.imgResource'),
      value: BizModelTypeEnum.IMAGE_RESOURCE,
    },
    {
      label: t('sys.menu.customPageComp'),
      value: BizModelTypeEnum.CUS_PAGE_COMP,
    },
    {
      label: t('sys.pageDesigner.printService'),
      value: BizModelTypeEnum.PRINT_SERVICE,
    },
    {
      label: t('sys.integration.networkPrinter'),
      value: BizModelTypeEnum.NET_PRINTER,
    },
    {
      label: t('sys.menu.messageTemplateManagement'),
      value: BizModelTypeEnum.MESSAGE_NOTIFY,
    },
    {
      label: t('sys.menu.dataSourceManagement'),
      value: BizModelTypeEnum.DATASOURCE_MANAGE,
    },
    {
      label: t('sys.integration.apiGrouping'),
      value: BizModelTypeEnum.API_CATEGORY,
    },
    {
      label: 'API' + t('sys.integration.keyManagement'),
      value: BizModelTypeEnum.API_KEY,
    },
    {
      label: 'API' + t('sys.integration.callLog'),
      value: BizModelTypeEnum.API_CALL_LOG,
    },
    {
      label: t('sys.menu.envTestManagement'),
      value: BizModelTypeEnum.TEST_ENV_MANAGE,
    },
    {
      label: t('sys.menu.envProdManagement'),
      value: BizModelTypeEnum.PRO_ENV_MANAGE,
    },
    {
      label: t('sys.menu.dataBaseOps'),
      value: BizModelTypeEnum.DATASOURCE_DEVOPS,
    },
    {
      label: t('sys.menu.auditLog'),
      value: BizModelTypeEnum.AUDITLOG,
    },
  ],
  USER_DEFINED: [
    {
      label: t('sys.menu.MessageTemplate'),
      value: BizModelTypeEnum.MESSAGE_TMPL,
    },
    {
      label: t('sys.menu.reportDataSet'),
      value: BizModelTypeEnum.REPORT_DATA_SET,
    },
    {
      label: t('sys.report.reportDesign'),
      value: BizModelTypeEnum.report_module,
    },
    {
      label: t('sys.menu.approvalMgt'),
      value: BizModelTypeEnum.PROCESS_MANAGE,
    },
    {
      label: t('sys.menu.processInstance'),
      value: BizModelTypeEnum.PROCESS_INSTANCE_MANAGE,
    },
    {
      label: t('sys.menu.formDesign'),
      value: BizModelTypeEnum.ONLINE_FORM_TMPL,
    },
    {
      label: t('sys.menu.eDHRDesign'),
      value: BizModelTypeEnum.EDHR_TMPL,
    },
    {
      label: t('sys.menu.labelDesign'),
      value: BizModelTypeEnum.LABEL_DESIGN,
    },
    {
      label: t('sys.menu.btwLabelTemplate'),
      value: BizModelTypeEnum.BTW_LABEL_DESIGN,
    },
    // {
    //   label: t('sys.menu.documentDesign'),
    //   value: BizModelTypeEnum.DOCUMENT_DESIGN,
    // },
    {
      label: t('sys.menu.timedTask'),
      value: BizModelTypeEnum.SCHEDULE_JOB,
    },
    {
      label: t('sys.userGroup'),
      value: BizModelTypeEnum.USER_GROUP,
    },
    {
      label: t('sys.menu.roleManagement'),
      value: BizModelTypeEnum.ROLE,
    },
    {
      label: t('sys.menu.onlineUser'),
      value: BizModelTypeEnum.ONLINE_USER,
    },
  ],
  APPDESIGNER: [
    {
      label: t('sys.menu.modelDesign'),
      value: BizModelTypeEnum.MODEL_DESIGN,
    },
    {
      label: t('sys.recycleBin'),
      value: BizModelTypeEnum.RESTORE,
    },
    {
      label: t('sys.menu.pageDesign'),
      value: BizModelTypeEnum.PAGE_DESIGN,
    },
    {
      label: t('sys.menu.labelDesign'),
      value: BizModelTypeEnum.LABEL_DESIGN,
    },
    // {
    //   label: t('sys.menu.documentDesign'),
    //   value: BizModelTypeEnum.DOCUMENT_DESIGN,
    // },
    {
      label: t('sys.menu.processDesign'),
      value: BizModelTypeEnum.PROCESS_DESIGN,
    },
    {
      label: t('sys.menu.informationCard'),
      value: BizModelTypeEnum.COMMON_INFO_CARD,
    },
    {
      label: t('sys.model.field_type_logic') + t('sys.script'),
      value: BizModelTypeEnum.LOGIC_DEVELOP,
    },
    // {
    //   label: t('sys.model.field_type_logic') + t('sys.orchestration'),
    //   value: BizModelTypeEnum.SO_DEVELOP,
    // },
    {
      label: t('sys.menu.timedTask'),
      value: BizModelTypeEnum.SCHEDULE_JOB,
    },
    {
      label: t('sys.menu.MessageTemplate'),
      value: BizModelTypeEnum.MESSAGE_TMPL,
    },
    {
      label: t('sys.menu.i18nSetting'),
      value: BizModelTypeEnum.LANGUAGE,
    },
    {
      label: t('sys.menu.globalEvents'),
      value: BizModelTypeEnum.GLOBAL_EVENT,
    },
    {
      label: t('sys.menu.systemVariables'),
      value: BizModelTypeEnum.SYSTEM_VARIABLES,
    },
    {
      label: t('sys.menu.menuSetting'),
      value: BizModelTypeEnum.MENU_SETTING,
    },
    {
      label: t('sys.menu.personalization'),
      value: BizModelTypeEnum.BASIC_SETTING,
    },
    {
      label: t('sys.menu.CustomAppIndex'),
      value: BizModelTypeEnum.MOBILE_HOMEPAGE,
    },
    {
      label: t('sys.menu.appDeployment'),
      value: BizModelTypeEnum.APP_DEPLOY,
    },
    {
      label: t('sys.menu.dataOps'),
      value: BizModelTypeEnum.DATA_OPERATION,
    },
    {
      label: t('sys.menu.auditLog'),
      value: BizModelTypeEnum.AUDIT_LOG,
    },
  ],
};

export const EnterpriseOperateTypeOptions = {
  USER_MANAGEMENT: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.forgetFormTitle'),
      value: OperateTypeEnum.RESET,
    },
    {
      label: t('sys.component.userCmp.resetSinPwd'),
      value: OperateTypeEnum.RESET_SIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ORGANIZATION_MENMBERS: [
    {
      label: t('sys.new') + t('sys.modalBloc'),
      value: OperateTypeEnum.INSERT_GROUIP,
    },
    {
      label: t('sys.new') + t('sys.modalCompany'),
      value: OperateTypeEnum.INSERT_COMPANY,
    },
    {
      label: t('sys.org.addChildCompany'),
      value: OperateTypeEnum.INSERT_NEXT_LEVEL_COMPANY,
    },
    {
      label: t('sys.org.addChildDept'),
      value: OperateTypeEnum.INSERT_NEXT_LEVEL_DEPARTMENT,
    },
    {
      label: t('sys.edit') + t('sys.organization'),
      value: OperateTypeEnum.UPDATE_ORG,
    },
    {
      label: t('sys.delete') + t('sys.organization'),
      value: OperateTypeEnum.DELETE_ORG,
    },
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  ROLE_MANAGEMENT: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.action.permissionSetting'),
      value: OperateTypeEnum.PERMISSION_CONFIG,
    },
  ],
  PLAT_ADMIN: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  SEAT_MANAGEMENT: [
    {
      label: t('sys.component.userCmp.addUser'),
      value: OperateTypeEnum.ADD_USER,
    },
    {
      label: t('sys.remove'),
      value: OperateTypeEnum.REMOVE,
    },
  ],
  TENANT_LIST: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
  ],
  BASE_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],

  WATERMARK_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],

  SECURITY_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  LOGIN_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  THEME_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  ORGANIZATION_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  APK_SETTING: [
    {
      label: t('sys.upload'),
      value: OperateTypeEnum.UPLOAD,
    },
    {
      label: t('sys.download'),
      value: OperateTypeEnum.DOWNLOAD,
    },
    {
      label: t('sys.activate'),
      value: OperateTypeEnum.ACTIVE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  LANGUAGE_MANAGEMENT: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.setDefault'),
      value: OperateTypeEnum.SET_DEFAULT,
    },
  ],
  TRANLATION_MANAGEMENT: [
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  PLATFORM_AUTHORISATION: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.unbind'),
      value: OperateTypeEnum.UNBIND_1,
    },
  ],
  MODULE_AUTHORISATION: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.unbind'),
      value: OperateTypeEnum.UNBIND_1,
    },
  ],
  CHANGE_PASSWORD: [
    {
      label: t('sys.changePassword'),
      value: OperateTypeEnum.UPDATE_SEAL_PASSWORD,
    },
  ],
};

export const TenantOperateTypeOptions = {
  USER_MANAGEMENT: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.forgetFormTitle'),
      value: OperateTypeEnum.RESET,
    },
    {
      label: t('sys.component.userCmp.resetSinPwd'),
      value: OperateTypeEnum.RESET_SIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ORGANIZATION_MENMBERS: [
    {
      label: t('sys.org.addChildDept'),
      value: OperateTypeEnum.INSERT_NEXT_LEVEL_DEPARTMENT,
    },
    {
      label: t('sys.edit') + t('sys.organization'),
      value: OperateTypeEnum.UPDATE_ORG,
    },
    {
      label: t('sys.delete') + t('sys.organization'),
      value: OperateTypeEnum.DELETE_ORG,
    },
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  ROLE_MANAGEMENT: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.action.permissionSetting'),
      value: OperateTypeEnum.PERMISSION_CONFIG,
    },
  ],
  PLAT_ADMIN: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  SEAT_MANAGEMENT: [
    {
      label: t('sys.component.userCmp.addUser'),
      value: OperateTypeEnum.ADD_USER,
    },
    {
      label: t('sys.remove'),
      value: OperateTypeEnum.REMOVE,
    },
  ],
  APP_SETTING: [
    {
      label: t('sys.add') + t('sys.admin'),
      value: OperateTypeEnum.ADD_ADMIN,
    },
    {
      label: t('sys.add') + t('sys.visibleRange'),
      value: OperateTypeEnum.ADD_VISIBILITY,
    },
    {
      label: t('sys.add') + t('sys.canUseOrg'),
      value: OperateTypeEnum.ADD_CAN_BE_USED_ORGANIZATION,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delText') + t('sys.admin'),
      value: OperateTypeEnum.DELETE_ADMIN,
    },
    {
      label: t('sys.delText') + t('sys.visibleRange'),
      value: OperateTypeEnum.DELETE_VISIBILITY,
    },
    {
      label: t('sys.delText') + t('sys.canUseOrg'),
      value: OperateTypeEnum.DELETE_CAN_BE_USED_ORGANIZATION,
    },
  ],
  DEVELOPER: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.remove'),
      value: OperateTypeEnum.REMOVE,
    },
    {
      label: t('sys.edhr.handover'),
      value: OperateTypeEnum.DELETE_AND_HANDOVER,
    },
  ],
  SEAL_MANAGEMENT: [
    {
      label: t('sys.appDesigner.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.changePassword'),
      value: OperateTypeEnum.UPDATE_SEAL_PASSWORD,
    },
  ],
  PRO_APP: [
    {
      label: t('sys.developer.appCenter.editAppInfo'),
      value: OperateTypeEnum.UPDATE_APP,
    },
    {
      label: t('sys.activate'),
      value: OperateTypeEnum.ACTIVE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.developer.appCenter.rest'),
      value: OperateTypeEnum.RESTORE,
    },
    {
      label: t('sys.developer.appCenter.completelyDelete'),
      value: OperateTypeEnum.COMPLETE_DELETE,
    },
    {
      label: t('sys.add') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.ADD_MEMBER,
    },
    {
      label: t('sys.developer.appCenter.transfer') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.HANDOVER_MEMBER,
    },
    {
      label: t('sys.remove') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.REMOVE_MEMBER,
    },
    {
      label: t('sys.setUp') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.CREATE_VERSION_BATCH,
    },

    {
      label: t('sys.import') + t('sys.branch'),
      value: OperateTypeEnum.IMPORT_BATCH,
    },
    {
      label: t('sys.merge') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.MERGE_VERSION_BATCH,
    },
    {
      label: t('sys.app.version.toggle') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.SWITCH_VERSION_BATCH,
    },
    {
      label: t('sys.add') + t('sys.integration.authorize'),
      value: OperateTypeEnum.ADD_AUTH,
    },
    {
      label: t('sys.edit') + t('sys.integration.authorize'),
      value: OperateTypeEnum.UPDATE_LICENSE,
    },
    {
      label: t('sys.license.licenseUnbind') + t('sys.integration.authorize'),
      value: OperateTypeEnum.UNBIND,
    },
  ],
  ICON_RESOURCE: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.ADD_CATEGORY,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.UPDATE_CATEGORY,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.DELETE_CATEGORY,
    },
    {
      label: t('sys.component.userCmp.move'),
      value: OperateTypeEnum.CHANGE_CATEGORY,
    },
    {
      label: t('sys.upload'),
      value: OperateTypeEnum.UPLOAD,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  IMAGE_RESOURCE: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.ADD_CATEGORY,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.UPDATE_CATEGORY,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.DELETE_CATEGORY,
    },
    {
      label: t('sys.component.userCmp.move'),
      value: OperateTypeEnum.CHANGE_CATEGORY,
    },
    {
      label: t('sys.upload'),
      value: OperateTypeEnum.UPLOAD,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  BASE_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  PERSONAL_INFORMATION: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  CHANGE_PASSWORD: [
    {
      label: t('sys.changePassword'),
      value: OperateTypeEnum.UPDATE_SEAL_PASSWORD,
    },
  ],
};

export const DeveloperOperateTypeOptions = {
  PRO_APP: [
    {
      label: t('sys.developer.appCenter.createApp'),
      value: OperateTypeEnum.CREATE_APP,
    },
    {
      label: t('sys.importApp'),
      value: OperateTypeEnum.UPLOAD_APP,
    },
    {
      label: t('sys.developer.appCenter.editAppInfo'),
      value: OperateTypeEnum.UPDATE_APP,
    },
    {
      label: t('sys.activate'),
      value: OperateTypeEnum.ACTIVE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.developer.appCenter.rest'),
      value: OperateTypeEnum.RESTORE,
    },
    {
      label: t('sys.developer.appCenter.completelyDelete'),
      value: OperateTypeEnum.COMPLETE_DELETE,
    },
    {
      label: t('sys.add') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.ADD_MEMBER,
    },
    {
      label: t('sys.developer.appCenter.transfer') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.HANDOVER_MEMBER,
    },
    {
      label: t('sys.remove') + t('sys.appDesigner.member'),
      value: OperateTypeEnum.REMOVE_MEMBER,
    },
    {
      label: t('sys.setUp') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.CREATE_VERSION_BATCH,
    },

    {
      label: t('sys.import') + t('sys.branch'),
      value: OperateTypeEnum.IMPORT_BATCH,
    },

    {
      label: t('sys.export') + t('sys.appDesigner.version'),
      value: OperateTypeEnum.EXPORT_VERSION,
    },
    {
      label: t('sys.merge') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.MERGE_VERSION_BATCH,
    },
    {
      label: t('sys.app.version.toggle') + t('sys.appDesigner.version') + '/' + t('sys.branch'),
      value: OperateTypeEnum.SWITCH_VERSION_BATCH,
    },
    {
      label: t('sys.add') + t('sys.integration.authorize'),
      value: OperateTypeEnum.ADD_AUTH,
    },
    {
      label: t('sys.edit') + t('sys.integration.authorize'),
      value: OperateTypeEnum.EDIT_AUTH,
    },
    {
      label: t('sys.license.licenseUnbind') + t('sys.integration.authorize'),
      value: OperateTypeEnum.UNBIND,
    },
  ],
  NAV_MENU: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.menu.assignNavMenu'),
      value: OperateTypeEnum.ASS_NAV_MENUE,
    },
  ],
  NAV_PAGE: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ICON_RESOURCE: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.ADD_CATEGORY,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.UPDATE_CATEGORY,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.DELETE_CATEGORY,
    },
    {
      label: t('sys.component.userCmp.move'),
      value: OperateTypeEnum.CHANGE_CATEGORY,
    },
    {
      label: t('sys.upload'),
      value: OperateTypeEnum.UPLOAD,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  IMAGE_RESOURCE: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.ADD_CATEGORY,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.UPDATE_CATEGORY,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.DELETE_CATEGORY,
    },
    {
      label: t('sys.component.userCmp.move'),
      value: OperateTypeEnum.CHANGE_CATEGORY,
    },
    {
      label: t('sys.upload'),
      value: OperateTypeEnum.UPLOAD,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  CUS_PAGE_COMP: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.ADD_CATEGORY,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.DELETE_CATEGORY,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  PRINT_SERVICE: [
    {
      label: t('sys.notes'),
      value: OperateTypeEnum.REMARK,
    },

    {
      label: t('sys.integration.testPrint'),
      value: OperateTypeEnum.TEST_PRINT,
    },
  ],
  NET_PRINTER: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.integration.testPrint'),
      value: OperateTypeEnum.TEST_PRINT,
    },
  ],
  MESSAGE_NOTIFY: [
    {
      label: t('sys.add'),
      value: OperateTypeEnum.ADD,
    },
    {
      label: t('sys.config'),
      value: OperateTypeEnum.MESSAGE_CONF,
    },
    {
      label: t('sys.test'),
      value: OperateTypeEnum.MESSAGE_CHECK,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  DATASOURCE_MANAGE: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  API_CATEGORY: [
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
  ],
  API_KEY: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.integration.authorize'),
      value: OperateTypeEnum.AUTH,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  API_CALL_LOG: [
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
  ],
  TEST_ENV_MANAGE: [
    {
      label: t('sys.add') + t('sys.admin'),
      value: OperateTypeEnum.ADD_ADMIN,
    },
    {
      label: t('sys.add') + t('sys.visibleRange'),
      value: OperateTypeEnum.ADD_VISIBILITY,
    },
    {
      label: t('sys.add') + t('sys.canUseOrg'),
      value: OperateTypeEnum.ADD_CAN_BE_USED_ORGANIZATION,
    },
    {
      label: t('sys.remove'),
      value: OperateTypeEnum.REMOVE,
    },
    {
      label: t('sys.delText') + t('sys.admin'),
      value: OperateTypeEnum.DELETE_ADMIN,
    },
    {
      label: t('sys.delText') + t('sys.visibleRange'),
      value: OperateTypeEnum.DELETE_VISIBILITY,
    },
    {
      label: t('sys.delText') + t('sys.canUseOrg'),
      value: OperateTypeEnum.DELETE_CAN_BE_USED_ORGANIZATION,
    },
  ],
  PRO_ENV_MANAGE: [
    {
      label: t('sys.pageDesigner.backLastVersion'),
      value: OperateTypeEnum.ROOLBACK,
    },
  ],
  DATASOURCE_DEVOPS: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  AUDITLOG: [
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
  ],
};

export const AppDesignerOperateTypeOptions = {
  MODEL_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.overwrite'),
      value: OperateTypeEnum.REWRITE,
    },
    {
      label: t('sys.openness'),
      value: OperateTypeEnum.OEPN,
    },
    {
      label: t('sys.cancelOpenness'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.APIConfig'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  RESTORE: [
    {
      label: t('sys.editor.recover'),
      value: OperateTypeEnum.RECYCLED,
    },
  ],
  PAGE_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.copy'),
      value: OperateTypeEnum.COPY,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  LABEL_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.pageDesigner.importLabelTmpl'),
      value: OperateTypeEnum.LABEL_IMPORT,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  DOCUMENT_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  PROCESS_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  COMMON_INFO_CARD: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  LOGIC_DEVELOP: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.activate'),
      value: OperateTypeEnum.ACTIVE,
    },

    {
      label: t('sys.appDesigner.develop'),
      value: OperateTypeEnum.DEVELOP,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  SO_DEVELOP: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.appDesigner.develop'),
      value: OperateTypeEnum.DEVELOP,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  SCHEDULE_JOB: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.appDesigner.timedTask.grid.actions.manualExecution'),
      value: OperateTypeEnum.MANUAL_TRIGGER,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  MESSAGE_TMPL: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.message.openTemplate'),
      value: OperateTypeEnum.PUBLISH,
    },
  ],
  LANGUAGE: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.IMPORT,
    },
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
  ],
  GLOBAL_EVENT: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  SYSTEM_VARIABLES: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  MENU_SETTING: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.appDesigner.addPermissionMenu'),
      value: OperateTypeEnum.ADD_PERMISSSION_MENU,
    },
  ],
  BASIC_SETTING: [
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
  ],
  MOBILE_HOMEPAGE: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.appDesigner.customAppHome.assignAppHome'),
      value: OperateTypeEnum.ASSIGN,
    },
  ],
  APP_DEPLOY: [
    {
      label: t('sys.pageDesigner.submit'),
      value: OperateTypeEnum.SUBMIT,
    },
    {
      label: t('sys.pageDesigner.deployTest'),
      value: OperateTypeEnum.DEPLOY_TESTING,
    },
    {
      label: t('sys.pageDesigner.createRelease'),
      value: OperateTypeEnum.CREATE_RELEASE,
    },
    {
      label: t('sys.pageDesigner.deployProd'),
      value: OperateTypeEnum.DEPLOY_PROD,
    },
  ],
  DATA_OPERATION: [
    {
      label: t('sys.app.batchModifying'),
      value: OperateTypeEnum.ONECLICK_EDIT,
    },
  ],
  AUDIT_LOG: [
    {
      label: t('sys.export'),
      value: OperateTypeEnum.EXPORT,
    },
  ],
};

export const AppFrontOperateTypeOptions = {
  USER_GROUP: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ROLE: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.enable'),
      value: OperateTypeEnum.ENABLE,
    },
    {
      label: t('sys.disable'),
      value: OperateTypeEnum.DISABLE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
    {
      label: t('sys.menu.rolePermissionSetting'),
      value: OperateTypeEnum.PERMISSION_EDIT,
    },
  ],
  SCHEDULE_JOB: [
    {
      label: t('sys.appDesigner.timedTask.grid.actions.manualExecution'),
      value: OperateTypeEnum.MANUAL_TRIGGER,
    },
  ],
  MESSAGE_TMPL: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.test'),
      value: OperateTypeEnum.TEST,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  LABEL_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.import'),
      value: OperateTypeEnum.LABEL_IMPORT,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.pageDesigner.version_createText'),
      value: OperateTypeEnum.VERSION_CREATE,
    },
    {
      label: t('sys.copy'),
      value: OperateTypeEnum.COPY,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.pageDesigner.version_copyText'),
      value: OperateTypeEnum.VERSION_COPY,
    },

    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  BTW_LABEL_DESIGN: [
    {
      label: t('sys.convertTemplate'),
      value: OperateTypeEnum.BTW_TRANSFORM,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.copy'),
      value: OperateTypeEnum.COPY,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  DOCUMENT_DESIGN: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },

    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ONLINE_FORM_TMPL: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.pageDesigner.version_createText'),
      value: OperateTypeEnum.VERSION_CREATE,
    },
    {
      label: t('sys.pageDesigner.version_copyText'),
      value: OperateTypeEnum.VERSION_COPY,
    },
    {
      label: t('sys.copy'),
      value: OperateTypeEnum.COPY,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  ONLINE_USER: [
    {
      label: t('sys.kickOutApp'),
      value: OperateTypeEnum.REMOVE_APP,
    },
  ],
  EDHR_TMPL: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.pageDesigner.version_createText'),
      value: OperateTypeEnum.VERSION_CREATE,
    },
    {
      label: t('sys.pageDesigner.version_copyText'),
      value: OperateTypeEnum.VERSION_COPY,
    },
    {
      label: t('sys.copy'),
      value: OperateTypeEnum.COPY,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.developer.appCenter.design'),
      value: OperateTypeEnum.DESIGN,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  PROCESS_MANAGE: [
    {
      label: t('sys.config'),
      value: OperateTypeEnum.CONFIG,
    },
  ],
  PROCESS_INSTANCE_MANAGE: [
    {
      label: t('sys.process.paasBpmnButtonEvent.Terminate'),
      value: OperateTypeEnum.TERMINATE,
    },
    {
      label: t('sys.process.paasBpmnButtonEvent.Reassign'),
      value: OperateTypeEnum.REASSIGN,
    },
  ],
  report_module: [
    {
      label: t('sys.new') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_NEW,
    },
    {
      label: t('sys.component.dataConnection.rename') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_RENAME,
    },
    {
      label: t('sys.delete') + t('sys.category'),
      value: OperateTypeEnum.CATEGORY_DELETE,
    },
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.component.userCmp.move'),
      value: OperateTypeEnum.MOVE,
    },
    {
      label: t('sys.publish'),
      value: OperateTypeEnum.DEPLOY,
    },
    {
      label: t('sys.report.unPublish'),
      value: OperateTypeEnum.CANCEL_DEPLOY,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
  REPORT_DATA_SET: [
    {
      label: t('sys.new'),
      value: OperateTypeEnum.INSERT,
    },
    {
      label: t('sys.edit'),
      value: OperateTypeEnum.UPDATE,
    },
    {
      label: t('sys.delete'),
      value: OperateTypeEnum.DELETE,
    },
  ],
};

export const getChValue = (options: SelectProps['options'], type) => {
  if (!options) {
    return '';
  }
  const res = options.find((item) => item.value === type);
  if (res) {
    return res.label;
  }
  return '';
};

export const operationLogColumns: ColumnsType<any> = [
  {
    key: 'createTime',
    dataIndex: 'createTime',
    title: t('sys.appDesigner.operateTime'),
  },
  {
    key: 'createUserName',
    dataIndex: 'createUserName',
    title: t('sys.appDesigner.operatePerson'),
  },
  {
    key: 'operateType',
    dataIndex: 'operateType',
    title: t('sys.appDesigner.operate'),
  },
  {
    key: 'module',
    dataIndex: 'module',
    title: t('sys.appDesigner.operateModule'),
  },
];

// 如下三个目前还不支持
// 表单模板
// DHR模板
// 流转单模板
export const ApplicationModelMap = {
  em_shopfloor: '车间建模',
  em_product_family: '产品家族',
  em_product: '产品列表',
  em_document: 'SOP文档',
  em_uom: '单位建模',
  em_device_type: '设备类型',
  em_device: '设备列表',
  em_form_tmpl: '表单模板',
  em_form_category: '表单分类',
  em_edhr_tmpl: 'DHR模板',
  em_edhr_category: 'DHR分类',
  em_circulation_document: '流转单模板',
  em_edhr_summary_process: '汇总配置',
  em_sn_rule: '编码规则',
  em_operation: '工序建模',
  em_routing: '工艺路线',
  em_product_process: '制程配置',
  em_txn_definition: '事务列表',
  em_txn_usage_rule: '事务配置',
  em_not_good_group: '不良分类',
  em_not_good_reason: '不良原因',
  em_scrap_group: '报废分类',
  em_scrap_reason: '报废原因',
};

export const ApplicationModelOptions = Object.entries(ApplicationModelMap).map(
  ([value, label]) => ({ value, label }),
);
