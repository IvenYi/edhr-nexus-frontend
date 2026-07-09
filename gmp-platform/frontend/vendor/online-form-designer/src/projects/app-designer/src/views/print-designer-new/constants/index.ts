import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';

const { t } = useI18n();

export const enum TabsEnum {
  /** 模型设计 */
  MODEL = 'ModelDesign',
  /** 表单设计 */
  FORM = 'FormDesign',
  /** 流程配置 */
  BPMN = 'BpmnSetting',
}



export enum BpmnVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HISTORY = 'HISTORY',
}

export const PageSettingEnum = {
  submit: '提交',
  reset: '重置',
  staging: '暂存',
  cancel: '取消',
  edit: '编辑',
  delete: '删除',
  save: '保存',
  log: '日志',
};

export const PageSettingConfig = {
  addPage: [
    {
      button: 'submit',
      buttonName: '提交',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'reset',
      buttonName: '重置',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'staging',
      buttonName: '暂存',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'cancel',
      buttonName: '取消',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 0,
    },
  ],
  editPage: [
    {
      button: 'save',
      buttonName: '保存',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'reset',
      buttonName: '重置',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'cancel',
      buttonName: '取消',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 0,
    },
  ],
  detailPage: [
    {
      button: 'edit',
      buttonName: '编辑',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 1,
    },
    {
      button: 'delete',
      buttonName: '删除',
      i18nConfig: '',
      buttonType: '按钮',
      enabled: 0,
    },
    {
      button: 'log',
      buttonName: '日志',
      i18nConfig: '',
      buttonType: '功能',
      enabled: 1,
    },
  ],
};

export const ListColumns: BasicColumn[] = [
  {
    title: t('sys.name'),
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: t('sys.description'),
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: t('sys.modifier'),
    dataIndex: 'modifyUserName',
    key: 'modifyUserName',
    ellipsis: true,
  },
  {
    title: t('sys.modifyTime'),
    dataIndex: 'modifyTime',
    key: 'modifyTime',
    ellipsis: true,
  },
  {
    fixed: 'right',
    width: 200,
    title: t('sys.operation'),
    dataIndex: 'actions',
    key: 'actions',
  },
];

export const pagerSizeMap = {
  A3: 'A3',
  A4: 'A4',
  A5: 'A5',
  CUSTOM: '自定义',
};
