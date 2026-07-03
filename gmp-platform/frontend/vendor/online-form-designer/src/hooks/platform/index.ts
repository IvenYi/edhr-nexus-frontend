import { getPlatList } from '/@/apis/gct-platform/PlatformConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { useBasicSetting } from './useBasicSetting';
import { useLoginSetting } from './useLoginSetting';
import { useOrgSetting } from './useOrgSetting';
import { useSecuritySetting } from './useSecuritySetting';
import { useThemeSetting } from './useThemeSetting';
import { useWatermarkSetting } from './useWatermarkSetting';
import { useDeploySetting } from './useDeploySetting';
import { PlatformSettingEnum } from './types';
import { OnlineControl } from '/@/utils/onlineControl';
import { getBasicConfigDetail } from '/@/apis/gct-apaas/BasicConfigController';

const { setBasicSetting } = useBasicSetting();
const { setLoginSetting } = useLoginSetting();
const { setOrgSetting } = useOrgSetting();
const { setSecuritySetting } = useSecuritySetting();
const { setThemeSetting } = useThemeSetting();
const { setWatermarkSetting } = useWatermarkSetting();
const { setDeploySetting } = useDeploySetting();

export function usePlatformSetting() {
  async function loadPlatformSetting(loadAppSetting = false) {
    const res = await getPlatList();
    const map = {};
    res?.forEach((row) => {
      map[row.configEnum!] = row;
    });

    if (!window.location.href.includes('#/login') && loadAppSetting) {
      console.log('getBasicConfigDetail');
      const appSettingRes = await getBasicConfigDetail({
        configEnum: PlatformSettingEnum.THEME,
      });
      console.log('appSettingRes', appSettingRes);

      if (appSettingRes) {
        map[PlatformSettingEnum.THEME] = appSettingRes;
      }
    }

    map[PlatformSettingEnum.BASIC] &&
      setBasicSetting(map[PlatformSettingEnum.BASIC] as SysConfigResponse);
    map[PlatformSettingEnum.LOGIN] &&
      (await setLoginSetting(map[PlatformSettingEnum.LOGIN] as SysConfigResponse));
    map[PlatformSettingEnum.ORGANIZATION] &&
      setOrgSetting(map[PlatformSettingEnum.ORGANIZATION] as SysConfigResponse);
    map[PlatformSettingEnum.SECURITY] &&
      setSecuritySetting(map[PlatformSettingEnum.SECURITY] as SysConfigResponse);
    map[PlatformSettingEnum.THEME] &&
      setThemeSetting(map[PlatformSettingEnum.THEME] as SysConfigResponse);
    map[PlatformSettingEnum.WATERMARK] &&
      setWatermarkSetting(map[PlatformSettingEnum.WATERMARK] as SysConfigResponse);
    // 部署方式
    map[PlatformSettingEnum.DEPLOY] &&
      setDeploySetting(map[PlatformSettingEnum.DEPLOY] as SysConfigResponse);
    /**退出登录倒计时 */
    OnlineControl.runListener();
  }

  return {
    loadPlatformSetting,
  };
}
