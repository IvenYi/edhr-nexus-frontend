import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const functionColumns: BasicColumn[] = [
  {
    title: t('sys.appDesigner.globalMethodName'),
    dataIndex: 'name',
  },
  {
    title: `${t('sys.model.functionMenu')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.type'),
    dataIndex: 'type',
  },
  {
    title: t('sys.description'),
    dataIndex: 'description',
  },
  // {
  //   title: t('sys.operation'),
  //   dataIndex: 'action',
  //   width: 150,
  //   align: 'center',
  //   fixed: 'right',
  // },
];
