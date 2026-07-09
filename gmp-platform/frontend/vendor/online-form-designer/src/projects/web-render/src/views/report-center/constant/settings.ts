import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const viewcolumns = [
  {
    title: t('sys.reportName'),
    key: 'name',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: t('sys.description'),
    key: 'description',
    dataIndex: 'description',
  },

  {
    title: t('sys.creator'),
    key: 'createUserName',
    dataIndex: 'createUserName',
    width: 200,
  },
  {
    title: t('sys.createTime'),
    key: 'createTime',
    dataIndex: 'createTime',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.modifier'),
    key: 'modifyUserName',
    dataIndex: 'modifyUserName',
    width: 200,
  },
  {
    title: t('sys.modifyTime'),
    key: 'modifyTime',
    dataIndex: 'modifyTime',
    minWidth: 170,
    width: 170,
  },
];
