import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const pushTypeList = [
  {
    label: t('sys.system'),
    value: 'system',
  },
  {
    label: t('sys.email'),
    value: 'email',
  },
  {
    label: t('sys.workwx'),
    value: 'wecom',
  },
  {
    label: t('sys.feishu'),
    value: 'feishu',
  },
  {
    label: t('sys.dingtalk'),
    value: 'dingtalk',
  },
];

export const pushTypeObj = {
  system: t('sys.system'),
  email: t('sys.email'),
  wecom: t('sys.workwx'),
  feishu: t('sys.feishu'),
  dingtalk: t('sys.dingtalk'),
};
