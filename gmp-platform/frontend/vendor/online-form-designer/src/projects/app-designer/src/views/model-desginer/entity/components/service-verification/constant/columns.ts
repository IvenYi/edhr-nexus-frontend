import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const serviceVerificationColumns: BasicColumn[] = [
  {
    title: `${t('sys.appDesigner.verification')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.name'),
    dataIndex: 'name',
  },
  {
    title: t('sys.type'),
    dataIndex: 'sysBuiltin',
  },
  {
    title: t('sys.appDesigner.linkService'),
    dataIndex: 'relationBizServiceNames',
  },
  {
    title: t('sys.status'),
    dataIndex: 'status',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const rulesColumns: BasicColumn[] = [
  {
    title: t('sys.appDesigner.rulesName'),
    dataIndex: 'name',
  },
  {
    title: t('sys.appDesigner.rulesType'),
    dataIndex: 'type',
  },
  {
    title: t('sys.appDesigner.abnormalInfo'),
    dataIndex: 'exception',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];
