import { reactive, ref, watch } from 'vue';
import { getPlatList } from '/@/apis/gct-platform/PlatformConfigController';
import { getBasicConfigDetail } from '/@/apis/gct-apaas/BasicConfigController';
import { PlatformSettingEnum } from '@/hooks/platform/types';

const themeSetting = reactive({
  primaryColor: '',
  darkMode: 'light',
  PassThemeColor: '#026AC8',
  AppThemeColor: '#026AC8',
});
/**登录信息配置 */
const orgConfig = ref({});
const platMap = reactive<any>({});
function hexToRgba(hex, alpha) {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length == 4) {
    r = '0x' + hex[1] + hex[1];
    g = '0x' + hex[2] + hex[2];
    b = '0x' + hex[3] + hex[3];
    // 6 digits
  } else if (hex.length == 7) {
    r = '0x' + hex[1] + hex[2];
    g = '0x' + hex[3] + hex[4];
    b = '0x' + hex[5] + hex[6];
  }
  return 'rgba(' + +r + ',' + +g + ',' + +b + ',' + alpha + ')';
}
function setThemeColor(color?: string) {
  if (color) {
    themeSetting.primaryColor = color;
    document.documentElement.style.setProperty('--van-primary-color', color);
    document.documentElement.style.setProperty('--van-primary-color-1', hexToRgba(color, 0.1));
    document.documentElement.style.setProperty('--van-primary-color-2', hexToRgba(color, 0.2));
    document.documentElement.style.setProperty('--van-primary-color-3', hexToRgba(color, 0.3));
    document.documentElement.style.setProperty('--van-primary-color-4', hexToRgba(color, 0.4));
    document.documentElement.style.setProperty('--van-primary-color-5', hexToRgba(color, 0.5));
    document.documentElement.style.setProperty('--van-primary-color-6', hexToRgba(color, 0.6));
    document.documentElement.style.setProperty('--van-primary-color-7', hexToRgba(color, 0.7));
    document.documentElement.style.setProperty('--van-primary-color-8', hexToRgba(color, 0.8));
    document.documentElement.style.setProperty('--van-primary-color-9', hexToRgba(color, 0.9));
  }
}

export function useplatSetting() {
  function setPassTheme(color?: string) {
    setThemeColor(color || themeSetting.PassThemeColor);
  }
  function setAppTheme() {
    setThemeColor(themeSetting.AppThemeColor || themeSetting.PassThemeColor);
  }
  async function getAppPlat() {
    const list = await getPlatList();
    list?.forEach((i) => {
      i.configEnum && (platMap[i.configEnum] = i);
      try {
        if (i.configEnum === PlatformSettingEnum.THEME) {
          themeSetting.PassThemeColor = JSON.parse(i.value).themeColor;
        }
        if (i.configEnum === PlatformSettingEnum.ORGANIZATION) {
          orgConfig.value = JSON.parse(i.value);
        }
      } catch (error) {
        // xxx
      }
    });
  }
  async function getBasicThemeColor() {
    const res = await getBasicConfigDetail({ configEnum: PlatformSettingEnum.THEME });
    if (res) {
      try {
        platMap[PlatformSettingEnum.THEME] = res;
        themeSetting.AppThemeColor = JSON.parse(res.value).themeColor;
      } catch (error) {
        // xxx
      }
    }
  }
  return { orgConfig, themeSetting, getAppPlat, getBasicThemeColor, setPassTheme, setAppTheme };
}
