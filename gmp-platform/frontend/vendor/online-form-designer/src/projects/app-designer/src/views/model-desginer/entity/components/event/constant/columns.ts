import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const eventColumns: BasicColumn[] = [
  {
    dataIndex: 'bizServiceName',
    title: t('sys.appDesigner.service'),
    align: 'left',
  },
  {
    dataIndex: 'type',
    title: t('sys.pageDesigner.eventType'),
    align: 'left',
  },
  {
    dataIndex: 'executeType',
    title: t('sys.executeType'),
    align: 'left',
  },
  {
    dataIndex: 'resourceType',
    title: t('sys.triggerMode'),
    align: 'left',
  },
  {
    dataIndex: 'name',
    title: t('sys.triggerInfo'),
    align: 'left',
  },
  {
    dataIndex: 'enabled',
    title: t('sys.status'),
    width: 100,
    align: 'left',
  },
  {
    dataIndex: 'description',
    title: t('sys.explain'),
    align: 'left',
  },
  {
    dataIndex: 'actions',
    title: t('sys.operation'),
    fixed: 'right',
    width: 150,
    align: 'left',
  },
];
