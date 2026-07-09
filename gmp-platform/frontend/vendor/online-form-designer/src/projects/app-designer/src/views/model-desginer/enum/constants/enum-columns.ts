import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const dataEnumColumns: BasicColumn[] = [
  {
    title: t('sys.index'),
    dataIndex: 'index',
    width: 72,
    fixed: 'left',
  },
  {
    title: t('sys.name'),
    dataIndex: 'text',
  },
  {
    title: t('sys.model.enumValue'),
    dataIndex: 'value',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const ConfigColumns = {
  color: {
    title: t('sys.model.nameColor'),
    dataIndex: 'textColor',
  },
  icon: {
    title: t('sys.model.fieldIcon'),
    dataIndex: 'icon',
  },
};
