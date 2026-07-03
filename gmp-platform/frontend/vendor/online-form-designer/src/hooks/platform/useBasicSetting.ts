import { reactive } from 'vue';
import { PlatformSettingEnum } from './types';
import { PlatformBaseConfig } from '/@/apis/gct-platform/model';
import {
  getPlatInfo,
  // getPlatVersion,
  postPlatBase,
} from '/@/apis/gct-platform/PlatformConfigController';
import { postPlatBase as apaasPostPlatBase } from '/@/apis/gct-apaas/PlatformConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { omit } from 'lodash-es';

// 基础配置信息
const basicSetting: PlatformBaseConfig = reactive({
  copyright:
    '© 2016-<span class="ownInput">${当前年份}</span> 冠骋信息技术（苏州）有限公司 版权所有',
  description: '',
  icon: '',
  loadingImage: '',
  logo: '',
  name: '冠骋云PaaS平台',
  thumbnail: '',
  version: __APP_INFO__.pkg.version,
});

export function useBasicSetting(isPlatform = true) {
  const postBasicSetting = () => {
    if (isPlatform) {
      postPlatBase(omit({ ...basicSetting }, 'version'));
    } else {
      apaasPostPlatBase(omit({ ...basicSetting }, 'version'));
    }
  };

  async function loadBasicSetting() {
    const res = await getPlatInfo({ configEnum: PlatformSettingEnum.THEME });
    res && setBasicSetting(res, false);
    const res1 = await getPlatInfo({ configEnum: PlatformSettingEnum.BASIC });
    res1 && setBasicSetting(res1, true);
  }

  function setBasicSetting(data: SysConfigResponse, transfer = true) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(basicSetting, transfer ? JSON.parse(value) : value, {
        version: __APP_INFO__.pkg.version,
      });
      console.log()
    } catch (err) {
      console.warn(err);
    }
  }

  return {
    basicSetting,
    loadBasicSetting,
    setBasicSetting,
    postBasicSetting,
  };
}
