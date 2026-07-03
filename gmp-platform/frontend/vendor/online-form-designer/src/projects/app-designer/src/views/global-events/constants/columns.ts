import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const globalEventColumns: BasicColumn[] = [
  {
    dataIndex: 'key',
    title: t('sys.appDesigner.events') + 'KEY',
    fixed: 'left',
  },
  {
    dataIndex: 'type',
    title: t('sys.appDesigner.eventsType'),
  },
  {
    dataIndex: 'jsKey',
    title: t('sys.appDesigner.eventsTriggerType'),
  },
  {
    dataIndex: 'jsName',
    title: t('sys.appDesigner.eventsExecuteAction'),
  },
  {
    dataIndex: 'description',
    title: t('sys.notes'),
  },
  {
    dataIndex: 'action',
    title: t('sys.operation'),
    fixed: 'right',
  },
];
