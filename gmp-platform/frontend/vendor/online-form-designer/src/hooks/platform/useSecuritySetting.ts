import { reactive } from 'vue';
import { PlatformSettingEnum } from './types';
import { SecurityConfig } from '/@/apis/gct-platform/model';
import { getPlatInfo, postPlatSecurity } from '/@/apis/gct-platform/PlatformConfigController';
import { postPlatSecurity as apaasPostPlatSecurity } from '/@/apis/gct-apaas/PlatformConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';

const securitySetting: SecurityConfig = reactive({
  durationHour: 2,
  durationMinute: 0,
  enableChangePassword: 1,
  enableChangeSignPassword: 0,
  enableSignPassword: 0,
  enableKickOut: 1,
  enablePassphrase: 1,
  signEnablePassphrase: 1,
  enableLockAccount: 1,
  expiryDate: 30,
  signExpiryDate: 30,
  firstTimeChangePassword: 0,
  signFirstTimeChangePassword: 0,
  lockTimeout: 0,
  loginKickOutMode: 'SAME_END',
  maxErrorTimes: 2,
  passMinLength: 6,
  signPassMinLength: 6,
  passRule: ['NUMBER'],
  signPassRule: ['NUMBER'],
  signRepeatNum: 1,
  repeatNum: 1,
  timeUnit: 'DAYS',
  signTimeUnit: 'DAYS',
  noOpRetainHour: 8,
  noOpRetainMinute: 0,
  earlyAlarmMinute: 5,
  earlyAlarmSecond: 0,
  inapplicablePerson: [],
  lockHourTimeout: 0,
  lockMinTimeout: 5,
});

export function useSecuritySetting(isPlatform = true) {
  const postSecuritySetting = async () => {
    // const value = JSON.stringify(securitySetting);
    if (isPlatform) {
      await postPlatSecurity(securitySetting);
    } else {
      await apaasPostPlatSecurity(securitySetting);
    }
  };

  // getThemeConfig();

  async function loadSecuritySetting() {
    const res = await getPlatInfo({ configEnum: PlatformSettingEnum.SECURITY });
    // console.log(config);
    res && setSecuritySetting(res);
  }

  function setSecuritySetting(data: SysConfigResponse) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(securitySetting, JSON.parse(value));
    } catch (err) {
      console.warn(err);
    }
  }

  return {
    securitySetting,
    postSecuritySetting,
    loadSecuritySetting,
    setSecuritySetting,
  };
}
