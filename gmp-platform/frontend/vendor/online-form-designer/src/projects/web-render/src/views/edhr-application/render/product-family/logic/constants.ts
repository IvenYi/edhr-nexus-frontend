import { BasicColumn } from '/@/components/Table';

export enum ProductFamilyAction {
  /** 删除 */
  DELETE = 'delete',
  /** 编辑 */
  EDIT = 'edit',
  /** 新增 */
  NEW = 'new',
  /** 复制 */
  COPY = 'copy',
  /** 详情 */
  DETAIL = 'detail',
  /** 导入 */
  IMPORT = 'import',
  /** 下载导入模版 */
  DOWNLOAD_IMPORT_TEMPLATE = 'export-template',
  /** 建模追溯 */
  MODELING_TRACEABILITY = 'modelingTraceability',
}

export const ProductFamilyActionMap = {
  [ProductFamilyAction.DELETE]: {
    label: $t('sys.delete'),
    color: 'error',
    popConfirm: {
      title: $t('sys.deleteConfirm'),
    },
  },
  [ProductFamilyAction.EDIT]: {
    label: $t('sys.edit'),
  },
  [ProductFamilyAction.NEW]: {
    label: $t('sys.new'),
  },
  [ProductFamilyAction.COPY]: {
    label: $t('sys.copy'),
  },
  [ProductFamilyAction.DETAIL]: {
    label: $t('sys.detail'),
  },
  [ProductFamilyAction.IMPORT]: {
    label: $t('sys.import'),
  },
  [ProductFamilyAction.MODELING_TRACEABILITY]: {
    label: $t('sys.appDesigner.modelTrace'),
  },
};

export const ProductFamilyTableColumns: BasicColumn[] = [
  {
    title: $t('sys.edhr.productFamilyName'),
    dataIndex: 'name_',
    width: 300,
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.productFamilyCode'),
    dataIndex: 'code_',
    width: 300,
    ellipsis: true,
  },
  {
    title: $t('sys.description'),
    dataIndex: 'description_',
    width: 300,
    ellipsis: true,
  },
  {
    title: $t('sys.modifier'),
    dataIndex: 'modify_user_name_',
    width: 120,
    ellipsis: true,
  },
  {
    title: $t('sys.modifyTime'),
    dataIndex: 'modify_time_',
    width: 200,
    ellipsis: true,
  },
  {
    title: $t('sys.operation'),
    dataIndex: 'action',
    width: 250,
    align: 'left',
    fixed: 'right',
  },
];

/** 表格操作列操作 */
export const ProductFamilyTableActions = [
  // ProductFamilyAction.DETAIL,
  ProductFamilyAction.EDIT,
  ProductFamilyAction.DELETE,
  ProductFamilyAction.COPY,
  ProductFamilyAction.MODELING_TRACEABILITY,
];
