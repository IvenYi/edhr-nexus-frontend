import { serverAddress } from '@mobile/stores/sessionHooks';
import { toRef, computed } from 'vue';

export const _isAndroid = window.location.origin === 'file://';

/**minio资源根路径 */
export const MOBILE_MINIO_PATH = toRef(() => (serverAddress.value || location.origin) + `/minio/`);

/** 版本号（不带hash） */
export const AppVersion = computed(() => {
  const arr = __APP_VERSION__.split('.');
  return arr.splice(0, arr.length - 1).join('.');
});
