import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const sysVarColumns: BasicColumn[] = [
  {
    dataIndex: 'key',
    title: t('sys.appDesigner.variable') + 'KEY',
    fixed: 'left',
  },
  {
    dataIndex: 'devValue',
    title: t('sys.appDesigner.developEnv'),
  },
  {
    dataIndex: 'testValue',
    title: t('sys.appDesigner.testEnv'),
  },
  {
    dataIndex: 'prodValue',
    title: t('sys.appDesigner.productionEnv'),
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
