import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export enum categoryEnum {
  /** 系统授权 */
  system = 'INITIALIZING',
  /** 增购 */
  additional = 'SUCCESS',
}

export const StatusOptions = {
  0: '已失效',
  1: '生效中',
  2: '未生效',
};

// 表格列信息
export const columns = [
  {
    title: t('sys.license.product'),
    dataIndex: 'productName',
    key: 'productName',
  },
  {
    title: t('sys.license.category'),
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: t('sys.status'),
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: t('sys.license.expirationDate'),
    dataIndex: 'expirationDate',
    key: 'expirationDate',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.operation'),
    width: 200,
    dataIndex: 'actions',
    key: 'actions',
  },
];
