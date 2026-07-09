import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const columns: BasicColumn[] = [
  {
    title: t('sys.index'),
    dataIndex: 'no',
    fixed: 'left',
    width: 72,
  },
  {
    title: t('sys.fullname'),
    dataIndex: 'fullname',
    fixed: 'left',
  },
  {
    title: t('sys.userName'),
    dataIndex: 'username',
  },
  {
    title: t('sys.mobile'),
    dataIndex: 'mobile',
    width: 136,
  },

  {
    title: t('sys.Dept'),
    dataIndex: 'orgNames',
  },

  {
    title: t('sys.createUser'),
    dataIndex: 'createUserName',
  },
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.modifier'),
    dataIndex: 'modifyUserName',
  },
  {
    title: t('sys.modifyTime'),
    dataIndex: 'modifyTime',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 80,
    align: 'left',
    fixed: 'right',
  },
];
