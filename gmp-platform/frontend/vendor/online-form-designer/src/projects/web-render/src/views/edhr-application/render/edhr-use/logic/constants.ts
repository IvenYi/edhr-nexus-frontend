import { BasicColumn } from '/@/components/Table';

export enum EdhrUseAction {
  /** 删除 */
  DELETE = 'delete',
  /** 编辑 */
  EDIT = 'edit',
  /** 新增 */
  NEW = 'new',
  /** 检验项 */
  ITEMS = 'items',
}

export const EdhrUseActionMap = {
  [EdhrUseAction.DELETE]: {
    label: $t('sys.delete'),
    color: 'error',
    popConfirm: {
      title: $t('sys.deleteConfirm'),
    },
  },
  [EdhrUseAction.EDIT]: {
    label: $t('sys.edit'),
  },
  [EdhrUseAction.NEW]: {
    label: $t('sys.new'),
  },
  [EdhrUseAction.ITEMS]: {
    label: $t('sys.edhr.itemsSetting'),
  },
};

export const EdhrUseTableColumns: BasicColumn[] = [
  {
    title: $t('sys.edhr.product'),
    dataIndex: '__dict__product_ref_',
    width: 300,
  },
  {
    title: $t('sys.edhr.productFamily'),
    dataIndex: '__dict__product_family_id_',
    width: 200,
  },
  {
    title: $t('sys.edhr.edhrTemplate'),
    dataIndex: '__dict__edhr_id_',
    width: 300,
  },
  {
    title: $t('sys.edhr.releaseTemplate'),
    dataIndex: '__dict__product_release_ref_',
    width: 300,
  },
  {
    title: $t('sys.modifier'),
    dataIndex: 'modify_user_name_',
    width: 120,
  },
  {
    title: $t('sys.modifyTime'),
    dataIndex: 'modify_time_',
    width: 200,
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
// export const EdhrUseTableActions = [EdhrUseAction.EDIT, EdhrUseAction.DELETE, EdhrUseAction.ITEMS];
export const EdhrUseTableActions = [EdhrUseAction.EDIT, EdhrUseAction.DELETE];
