import { reactive, ref, unref, computed } from 'vue';
import { serverAddress } from '@mobile/stores/sessionHooks';
import { _isAndroid } from '@mobile/utils/const';
import { CurrentTenant, AccessToken } from '@mobile/stores/loginHooks';
import { useStorage } from '@vueuse/core';
import { getTenantInfoByPortOrDomain } from '/@/apis/gct-platform/TenantController';

const ENV = useStorage('ENV', '');
const IP_REG = /^http:\/\/\d{1,3}(\.\d{1,3}){3}:(\d{1,5})$/;
const HOST_REG = /^https?:\/\/([a-z0-9]+)-test\./;
const isTestEnv = ref<boolean>(false);
const isSandbox = computed(() => {
  return /\/mobile-sandbox\/|\/pad-sandbox\//.test(location.pathname);
});
export function useEnv() {
  /**
   * 检测是否为测试环境
   * @param loadTenant 是否加载租户信息
   */
  async function checkIsTestEnv() {
    const platformOrigin = removeTrailingSlash(
      process.env.NODE_ENV === 'development'
        ? import.meta.env.VITE_GLOBAL_HOST
        : serverAddress.value || location.origin,
    );

    /**域名模式 */
    const isHostMode = HOST_REG.test(platformOrigin);
    if (isHostMode) {
      const matches = platformOrigin.match(HOST_REG);
      isTestEnv.value = /\/test-single\//.test(platformOrigin) || !!(matches && matches[1]);
      if (isTestEnv.value) {
        const res = await getTenantInfoByPortOrDomain({
          domain: matches[1],
        });
        if (!AccessToken.value || !CurrentTenant.value?.id) {
          CurrentTenant.value = res;
        }
      }
    } else {
      /**ip模式逻辑 */
      const matches = platformOrigin.match(IP_REG);
      const port = matches && matches[2];
      if (port) {
        const res = await getTenantInfoByPortOrDomain({
          port,
        });
        if (!AccessToken.value || !CurrentTenant.value?.id) {
          CurrentTenant.value = res || {};
        }
        isTestEnv.value = res?.testEnvPort === port;
      }
    }
  }

  function getEnv() {
    if (ENV.value) {
      return ENV.value;
    } else if (isTestEnv.value) {
      return 'test';
    } else if (_isAndroid) {
      return 'prod';
    } else if (isSandbox.value) {
      return 'sbx';
    } else {
      return 'dev';
    }
  }

  return {
    ENV,
    getEnv,
    isTestEnv,
    checkIsTestEnv,
    isSandbox,
  };
}
export function getEnvCode() {
  if (ENV.value) {
    return ENV.value;
  } else if (isTestEnv.value) {
    return 'test';
  } else if (_isAndroid) {
    return 'prod';
  } else if (isSandbox.value) {
    return 'sbx';
  } else {
    return 'dev';
  }
}

function removeTrailingSlash(url) {
  // 检查字符串是否以 / 结尾，如果是则去除最后一个字符
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
