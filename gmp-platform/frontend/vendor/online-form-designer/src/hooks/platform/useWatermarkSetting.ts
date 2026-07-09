import { reactive } from 'vue';
import { PlatformSettingEnum } from './types';
import { getPlatInfo, postPlatWatermark } from '/@/apis/gct-platform/PlatformConfigController';
import { isEmpty } from 'lodash-es';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';

const initData = {
  openWatermark: false,
  watermarkContent: 'custom',
  fontSize: 16,
  color: '#000000',
  verticalAlign: 'middle',
  textAlign: 'center',
  text: '${username}',
  transparent: 15,
  width: 1600,
  height: 1080,
};

const watermarkSetting = reactive({ ...initData });

export function useWatermarkSetting() {
  const postWatermarkSetting = async () => {
    const value = JSON.stringify(watermarkSetting);
    await postPlatWatermark({ value });
  };

  const loadWatermarkSetting = async () => {
    const res = await getPlatInfo({ configEnum: PlatformSettingEnum.WATERMARK });
    // console.log(config);
    res && setWatermarkSetting(res);
  };

  function setWatermarkSetting(data: SysConfigResponse) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(watermarkSetting, JSON.parse(value));
    } catch (err) {
      console.warn(err);
    }
  }

  // 保存

  // getWatermarkConfig();

  return {
    watermarkSetting,
    loadWatermarkSetting,
    postWatermarkSetting,
    setWatermarkSetting,
  };
}
