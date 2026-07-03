import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const watermarkOpts: any = [
  {
    value: 'username',
    label: t('sys.platform.currentUsername'),
  },
  {
    value: 'email',
    label: t('sys.platform.currentEmail'),
  },
  {
    value: 'account',
    label: t('sys.platform.currentAccount'),
  },
  {
    value: 'date',
    label: t('sys.platform.currentDate'),
  },
];

export enum PasswordEnum {
  Login = 'login',
  Signature = ' signature',
  Seal = 'seal',
}
