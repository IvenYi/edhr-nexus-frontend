import { BasicColumn } from '/@/components/Table';

export enum ProductAction {
  /** 删除 */
  DELETE = 'delete',
  /** 删除版本 */
  DELETE_VERSION = 'delete-version',
  /** 编辑版本 */
  EDIT_VERSION = 'edit-version',
  /** 新增 */
  CREATE = 'create',
  /** 版本创建 */
  CREATE_VERSION = 'create-version',
  /** 复制，整体带默认版本 */
  COPY = 'copy',
  /** 复制，带默认版本 */
  COPY_VERSION = 'copy-version',
  /** 详情 */
  DETAIL = 'detail',
  /** 导入 */
  IMPORT = 'import',
  /** 下载导入模版 */
  DOWNLOAD_IMPORT_TEMPLATE = 'export-template',
  /** 建模追溯 */
  MODELING_TRACEABILITY = 'modelingTraceability',
}

export const ProductActionMap = {
  [ProductAction.DELETE]: {
    label: $t('sys.delete'),
    color: 'error',
    popConfirm: {
      title: $t('sys.deleteConfirm'),
    },
  },
  [ProductAction.DELETE_VERSION]: {
    label: $t('sys.delete'),
    color: 'error',
    popConfirm: {
      title: $t('sys.deleteConfirm'),
    },
  },
  [ProductAction.EDIT_VERSION]: {
    label: $t('sys.edit'),
  },
  [ProductAction.CREATE]: {
    label: $t('sys.new'),
  },
  [ProductAction.CREATE_VERSION]: {
    label: $t('sys.pageDesigner.version_createText'),
  },
  [ProductAction.COPY_VERSION]: {
    label: $t('sys.pageDesigner.version_copyText'),
  },
  [ProductAction.COPY]: {
    label: $t('sys.copy'),
  },
  [ProductAction.DETAIL]: {
    label: $t('sys.detail'),
  },
  [ProductAction.IMPORT]: {
    label: $t('sys.import'),
  },
  [ProductAction.MODELING_TRACEABILITY]: {
    label: $t('sys.appDesigner.modelTrace'),
  },
};

export const ProductTableColumns: BasicColumn[] = [
  {
    title: $t('sys.edhr.productName'),
    dataIndex: 'name_',
    width: 300,
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.productType'),
    dataIndex: '__dict__product_type',
    width: 200,
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.productFamily'),
    dataIndex: '__dict__product_family',
    width: 300,
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.productCode'),
    dataIndex: 'code_',
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
    width: 270,
    align: 'left',
    fixed: 'right',
  },
];

/** 表格操作列操作 */
export const ProductTableRdoActions = [
  ProductAction.COPY,
  ProductAction.DELETE,
  ProductAction.CREATE_VERSION,
];

export const ProductTableVersionActions = [
  // ProductAction.DETAIL,
  ProductAction.EDIT_VERSION,
  ProductAction.DELETE_VERSION,
  ProductAction.COPY_VERSION,
  ProductAction.MODELING_TRACEABILITY,
];
