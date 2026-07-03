import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { UserServiceTypeOptionsMap } from '/@app-designer/constant';

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
    customRender: ({ record }) => {
      const i18nKey = UserServiceTypeOptionsMap[record.type]?.label;
      return i18nKey ? t(i18nKey) : record.type;
    },
  },
  {
    title: t('sys.description'),
    dataIndex: 'description',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 120,
    align: 'left',
    fixed: 'right',
  },
];
