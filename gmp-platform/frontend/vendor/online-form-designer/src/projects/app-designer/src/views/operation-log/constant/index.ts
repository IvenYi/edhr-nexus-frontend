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
  /** eDHR模板 */
  EDHR_TMPL = 'EDHR_TMPL',
  /** 在线表单模板 */
  ONLINE_FORM_TMPL = 'ONLINE_FORM_TMPL',
}

export const OperateTypeOptions: SelectProps['options'] = [
  {
    label: t('sys.appDesigner.operateDelete'),
    value: OperateTypeEnum.DELETE,
  },
  {
    label: t('sys.appDesigner.operateInsert'),
    value: OperateTypeEnum.INSERT,
  },
  {
    label: t('sys.appDesigner.operateUpdate'),
    value: OperateTypeEnum.UPDATE,
  },
];

export const BizModelTypeOptions: SelectProps['options'] = [
  {
    label: t('sys.menu.basicSetting'),
    value: BizModelTypeEnum.BASIC_SETTING,
  },
  {
    label: t('sys.menu.deployment'),
    value: BizModelTypeEnum.DEPLOY,
  },
  {
    label: t('sys.menu.globalEvents'),
    value: BizModelTypeEnum.GLOBAL_EVENT,
  },
  {
    label: t('sys.menu.i18nSetting'),
    value: BizModelTypeEnum.LANGUAGE,
  },
  {
    label: t('sys.menu.logicDevelop'),
    value: BizModelTypeEnum.LOGIC_DEVELOP,
  },
  {
    label: t('sys.menu.timedTask'),
    value: BizModelTypeEnum.SCHEDULE_JOB,
  },
  {
    label: t('sys.menu.MessageTemplate'),
    value: BizModelTypeEnum.MESSAGE_TMPL,
  },
  {
    label: t('sys.menu.menuSetting'),
    value: BizModelTypeEnum.MENU_SETTING,
  },
  {
    label: t('sys.menu.modelDesign'),
    value: BizModelTypeEnum.MODEL_DESIGN,
  },
  {
    label: t('sys.menu.pageDesign'),
    value: BizModelTypeEnum.PAGE_DESIGN,
  },
  {
    label: t('sys.menu.printDesign'),
    value: BizModelTypeEnum.PRINT_DESIGN,
  },
  {
    label: t('sys.menu.processDesign'),
    value: BizModelTypeEnum.PROCESS_DESIGN,
  },
  {
    label: t('sys.menu.systemVariables'),
    value: BizModelTypeEnum.SYSTEM_VARIABLES,
  },
  {
    label: t('sys.menu.versionManagement'),
    value: BizModelTypeEnum.VERSION_CONTROL,
  },
  {
    label: t('sys.menu.CustomAppIndex'),
    value: BizModelTypeEnum.MOBILE_HOMEPAGE,
  },
  {
    label: t('sys.menu.eDhrTemplate'),
    value: BizModelTypeEnum.EDHR_TMPL,
  },
  {
    label: t('sys.menu.onlineFormTemplate'),
    value: BizModelTypeEnum.ONLINE_FORM_TMPL,
  },
];

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
