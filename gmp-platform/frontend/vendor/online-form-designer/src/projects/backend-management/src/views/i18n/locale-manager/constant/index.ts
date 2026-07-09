import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const localeColumns = [
  {
    title: t('sys.i18n.language'),
    dataIndex: 'language',
  },
  {
    title: t('sys.i18n.languageIdentification'),
    dataIndex: 'languageTag',
  },
  {
    title: t('sys.i18n.enableStatus'),
    dataIndex: 'state',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
  },
];
