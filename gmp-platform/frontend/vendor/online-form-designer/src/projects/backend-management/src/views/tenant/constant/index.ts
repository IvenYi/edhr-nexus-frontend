import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const applicationStatusOptions = {
  /** 初始化中 */
  initializing: 'INITIALIZING',
  /** 成功 */
  success: 'SUCCESS',
  /** 失败 */
  fail: 'FAIL',
};

export enum StatusEnum {
  /** 全部 */
  ALL = -1,
  /** 启用 */
  NORMAL = 1,
  /** 禁用 */
  DISABLED = 0,
}

// 表格列信息
export const columns = [
  {
    title: t('sys.tenantName'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('sys.associatedOrg'),
    dataIndex: 'orgName',
    key: 'orgName',
  },
  {
    title: t('sys.tenantState'),
    dataIndex: 'enabled',
    key: 'enabled',
  },
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
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
