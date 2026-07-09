import { getAid, serverAddress } from '../stores/sessionHooks';
import { ServeStart, GctNative } from '@native/index';
import { _isAndroid } from '@mobile/utils/const';
import { useAppStore } from '@mobile/stores/useAppStore';

export async function initStart() {
  if (_isAndroid) {
    const data = await ServeStart.getServeConfig();
    const appStore = useAppStore();
    serverAddress.value = data.serverAddress;
    if (data.singleApp) {
      const singleAppId = data.appTag || getAid.value;
      const logo = {
        logoType: data.logoType,
        logo: data.logo,
        color: data.logoColor,
        bgColor: data.logoBgColor,
      };
      if (singleAppId) {
        appStore.setSingleApp(singleAppId, data.appName, data.tenantId, logo);
      } else {
        console.warn('singleApp 模式缺少 appTag，跳过 setSingleApp');
      }
    }
    console.log('服务地址：', data, appStore);
    /**隐藏安卓头部 */
    GctNative.NATIVE.toolbarController(false);
  }
}
