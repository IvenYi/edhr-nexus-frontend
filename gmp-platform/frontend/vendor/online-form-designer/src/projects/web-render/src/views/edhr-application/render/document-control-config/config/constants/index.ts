import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';
import { SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
import { IBaseButtonConfig } from '../components/base-button-setting';

const { t } = useI18n();

export const enum TabsEnum {
  /** 模型设计 */
  MODEL = 'ModelDesign',
  /** 表单设计 */
  FORM = 'FormDesign',
  /** 按钮配置 */
  BASE_BUTTON = 'BaseButton',
  /** 流程配置 */
  BPMN = 'BpmnSetting',
}

/** 单据模式 */
export enum FormEditionEnum {
  /** 专业模式 */
  PROFESSIONAL = 'PROFESSIONAL',
  /** 普通模式 */
  EASY = 'EASY',
}

export enum BpmnVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HISTORY = 'HISTORY',
}

export const BaseButtonConfig: IBaseButtonConfig[] = [
  {
    title: $t('sys.appDesigner.approval.button.Save'),
    type: 'Save',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
  },
  {
    title: $t('sys.appDesigner.approval.button.Submit'),
    type: 'Submit',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
  },
  {
    title: $t('sys.appDesigner.approval.button.Qualified'),
    type: 'Qualified',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
  },
  {
    title: $t('sys.appDesigner.approval.button.Unqualified'),
    type: 'Unqualified',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
  },
];

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

/** 电子表单模型字段表格 */
export const OnlineFOrmDataFieldColumns: BasicColumn[] = [
  {
    title: `${t('sys.field')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.field') + t('sys.name'),
    dataIndex: 'name',
  },
  {
    title: t('sys.field') + t('sys.type'),
    dataIndex: 'type',
  },
  {
    title: t('sys.component.dataConnection.fieldSource'),
    dataIndex: 'createType',
  },
  {
    title: t('sys.model.uniqueOrNot'),
    dataIndex: 'uniqueConstraint',
  },
  {
    title: t('sys.requiredOrNot'),
    dataIndex: 'required',
  },
  {
    title: t('sys.status'),
    dataIndex: 'status',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 220,
    align: 'center',
    fixed: 'right',
  },
];

export const onlineFormViewFieldColumns: BasicColumn[] = [
  {
    title: `${t('sys.field')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.field') + t('sys.name'),
    dataIndex: 'name',
  },
  {
    title: t('sys.field') + t('sys.type'),
    dataIndex: 'type',
  },
  {
    title: t('sys.model.viewOriginFieldKey'),
    dataIndex: 'originFieldKey',
  },
  {
    title: t('sys.status'),
    dataIndex: 'status',
  },
];

export const onlineFormViewSqlFieldColumns: BasicColumn[] = [
  {
    title: `${t('sys.field')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.field') + t('sys.name'),
    dataIndex: 'name',
  },
  {
    title: t('sys.field') + t('sys.type'),
    dataIndex: 'type',
  },
  {
    title: t('sys.model.viewOriginFieldKey'),
    dataIndex: 'column',
  },
  {
    title: t('sys.status'),
    dataIndex: 'status',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'center',
    fixed: 'right',
  },
];
