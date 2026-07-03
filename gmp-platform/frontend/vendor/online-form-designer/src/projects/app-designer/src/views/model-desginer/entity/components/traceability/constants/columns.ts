import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export const traceLogColumns = [
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: t('sys.createUser'),
    dataIndex: 'modifyUserName',
    key: 'modifyUserName',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'masterOperationType',
    key: 'masterOperationType',
  },
];

export const traceDetailColumns = [
  {
    title: t('sys.appDesigner.model'),
    dataIndex: 'modelKey',
  },
  {
    title: t('sys.appDesigner.field'),
    dataIndex: 'fieldName',
    key: 'fieldName',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'operationType',
    key: 'operationType',
  },
];
