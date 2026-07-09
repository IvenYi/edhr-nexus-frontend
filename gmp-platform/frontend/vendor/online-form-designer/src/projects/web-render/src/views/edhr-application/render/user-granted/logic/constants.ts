import { BasicColumn } from '/@/components/Table';

export enum UserGrantedAction {
  /** 添加 */
  Add = 'add',
  /** 移除并交接 */
  Handover = 'handover',
}

export const UserGrantedActionMap = {
  [UserGrantedAction.Add]: {
    label: $t('sys.add'),
    color: 'error',
    popConfirm: {
      title: $t('sys.deleteConfirm'),
    },
  },
  [UserGrantedAction.Handover]: {
    label: $t('sys.edhr.handover'),
  },
};

export const UserGrantedTableColumns = [
  {
    title: $t('sys.fullname'),
    field: 'fullname',
  },
  {
    title: $t('sys.userName'),
    field: 'username',
  },
  {
    title: $t('sys.phone'),
    field: 'mobile',
  },
  {
    title: $t('sys.empNo'),
    field: 'empNo',
  },
];

/** 表格操作列操作 */
export const UserGrantedTableActions = [UserGrantedAction.Handover];
