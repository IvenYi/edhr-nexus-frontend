import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const constraintColumns: BasicColumn[] = [
  {
    dataIndex: 'type',
    title: t('sys.pageDesigner.constraintType'),
    width: 200,
    align: 'left',
  },
  {
    dataIndex: 'fieldNames',
    title: t('sys.pageDesigner.constraintFields'),
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

export const treeModelConstraintColumns: BasicColumn[] = [
  {
    dataIndex: 'type',
    title: t('sys.pageDesigner.constraintType'),
    width: 200,
    align: 'left',
  },
  {
    dataIndex: 'range',
    title: t('sys.pageDesigner.constraintRange'),
    width: 200,
    align: 'left',
  },
  {
    dataIndex: 'fieldNames',
    title: t('sys.pageDesigner.constraintFields'),
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
