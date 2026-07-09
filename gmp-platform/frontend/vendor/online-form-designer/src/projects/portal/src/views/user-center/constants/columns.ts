import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

import type { ColumnProps } from 'ant-design-vue/lib/table';

const { t } = useI18n();

// 登录足迹table列
export const loginFootPrintColumns: ColumnsType<any> = [
  {
    key: 'loginStatus',
    dataIndex: 'loginStatus',
    title: t('sys.loginState'),
    align: 'left',
    width: 90,
  },
  {
    key: 'createUserName',
    dataIndex: 'createUserName',
    title: t('sys.portal.createUserName'),
    align: 'left',
  },
  {
    key: 'createTime',
    dataIndex: 'createTime',
    title: t('sys.loginTime'),
    align: 'left',
  },
  {
    key: 'source',
    dataIndex: 'source',
    title: t('sys.client'),
    align: 'left',
  },
  {
    key: 'ip',
    dataIndex: 'ip',
    title: t('sys.ipAddress'),
    align: 'left',
  },
  {
    key: 'userAgent',
    dataIndex: 'userAgent',
    title: t('sys.portal.loginBrowser'),
    align: 'left',
  },
];

// web/mobile工作台-组件table列
export const compColumns: ColumnProps[] = [
  {
    dataIndex: 'workbenchComponentName',
    key: 'workbenchComponentName',
    title: t('sys.portal.compName'),
    align: 'center',
  },
  {
    dataIndex: 'enabled',
    key: 'enabled',
    title: t('sys.portal.compStatus'),
    align: 'center',
  },
  {
    dataIndex: 'description',
    key: 'description',
    title: t('sys.portal.compDesc'),
    align: 'center',
  },
  {
    dataIndex: 'action',
    key: 'action',
    title: t('sys.operation'),
    align: 'center',
    fixed: 'right',
    width: 100,
  },
];
