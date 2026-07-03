import { useI18n } from '/@/hooks/web/useI18n';

import type { SelectProps } from 'ant-design-vue';

const { t } = useI18n();

export enum StatusEnum {
  /** 启用 */
  NORMAL = 1,
  /** 禁用 */
  DISABLED = 0,
}

export enum LoginStatusEnum {
  /** 成功 */
  SUCCEED = 'SUCCEED',
  /** 失败 */
  FAILURE = 'FAILURE',
}

export enum DeviceSourceEnum {
  /** 电脑端 */
  WEB = 'WEB',
  /** 移动端 */
  MOBILE = 'MOBILE',
}

export const Ch_LoginStatus = {
  [LoginStatusEnum.SUCCEED]: t('sys.portal.succeed'),
  [LoginStatusEnum.FAILURE]: t('sys.portal.failure'),
};

export const DeviceSourceOptions: SelectProps['options'] = [
  {
    label: t('sys.portal.deviceWeb'),
    value: DeviceSourceEnum.WEB,
  },
  {
    label: t('sys.portal.deviceMobile'),
    value: DeviceSourceEnum.MOBILE,
  },
];

export const getChValue = (options: SelectProps['options'], type) => {
  if (!options) {
    return '';
  }
  const res = options.find((item) => item.value === type);
  if (res) {
    return res.label;
  }
  return '';
};
