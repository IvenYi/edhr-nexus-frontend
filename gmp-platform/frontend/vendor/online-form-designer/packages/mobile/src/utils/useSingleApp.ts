import { getAid } from '@mobile/stores/sessionHooks';
import { _isAndroid } from '@mobile/utils/const';
import { ServeStart } from '@native/index';
import { ref } from 'vue';
import { useEnv } from './useEnv';

const isPreview = ref<boolean>(false);
const branchId = ref<string>();
const pathname = ref<string>();
const { ENV } = useEnv();

export function useSingleApp() {
  /**
   * 初始化独立应用
   */
  async function initSingleApp() {
    if (_isAndroid) {
      const {
        appTag,
        isPreview: _isPreview,
        branchId: _branchId,
        env: _env,
        pathname: _pathname,
      } = await ServeStart.getServeConfig();
      getAid.value = appTag;
      branchId.value = _branchId;
      ENV.value = _env;
      isPreview.value = _isPreview === 'true';
      pathname.value = _pathname;
    } else {
      const aid = location.pathname.match(/\/edhr-render\/(\S[^/]+)/)?.[1];
      getAid.value = aid || import.meta.env.VITE_GLOBAL_APP_ID;
      branchId.value = import.meta.env.VITE_GLOBAL_BRANCH_ID;
      ENV.value = import.meta.env.VITE_GLOBAL_ENV;
      isPreview.value = true;
    }
  }

  return {
    initSingleApp,
    isPreview,
    branchId,
    pathname,
  };
}
