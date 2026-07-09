import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const webColumns: BasicColumn[] = [
  {
    dataIndex: 'name',
    title: t('sys.appDesigner.menuName'),
    align: 'left',
    width: 220,
  },
  {
    dataIndex: 'type',
    title: t('sys.appDesigner.menuType'),
    align: 'left',
    width: 120,
  },
  {
    dataIndex: 'sysBuiltin',
    title: t('sys.appDesigner.menuSource'),
    align: 'left',
    width: 120,
  },
  // {
  //   dataIndex: 'linkPageName',
  //   title: t('sys.appDesigner.linkPage'),
  //   align: 'left',
  // },
  {
    dataIndex: 'menuUrl',
    title: t('sys.appDesigner.menuPathAndPage'),
    align: 'left',
  },
  {
    dataIndex: 'visible',
    title: t('sys.appDesigner.revealing'),
    align: 'left',
    width: 90,
  },
  {
    dataIndex: 'createUserName',
    title: t('sys.creator'),
    align: 'left',
    width: 100,
  },
  {
    dataIndex: 'createTime',
    title: t('sys.createTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'modifyUserName',
    title: t('sys.modifier'),
    align: 'left',
    width: 100,
  },
  {
    dataIndex: 'modifyTime',
    title: t('sys.modifyTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'actions',
    title: t('sys.operation'),
    fixed: 'right',
    width: 220,
    align: 'left',
  },
];

export const mobileColumns: BasicColumn[] = [
  {
    dataIndex: 'name',
    title: t('sys.appDesigner.menuName'),
    align: 'left',
    width: 220,
  },
  {
    dataIndex: 'type',
    title: t('sys.appDesigner.menuType'),
    align: 'left',
  },
  {
    dataIndex: 'sysBuiltin',
    title: t('sys.appDesigner.menuSource'),
    align: 'left',
  },
  // {
  //   dataIndex: 'linkPageName',
  //   title: t('sys.appDesigner.linkPage'),
  //   align: 'left',
  // },
  {
    dataIndex: 'menuUrl',
    title: t('sys.appDesigner.menuPathAndPage'),
    align: 'left',
  },
  {
    dataIndex: 'visible',
    title: t('sys.appDesigner.revealing'),
    align: 'left',
  },
  {
    dataIndex: 'createUserName',
    title: t('sys.creator'),
    align: 'left',
  },
  {
    dataIndex: 'createTime',
    title: t('sys.createTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'modifyUserName',
    title: t('sys.modifier'),
    align: 'left',
  },
  {
    dataIndex: 'modifyTime',
    title: t('sys.modifyTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'actions',
    title: t('sys.operation'),
    fixed: 'right',
    width: 220,
    align: 'left',
  },
];
