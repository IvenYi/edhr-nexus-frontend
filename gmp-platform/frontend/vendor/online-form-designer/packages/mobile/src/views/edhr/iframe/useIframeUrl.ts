import { useRoute } from 'vue-router';
import { serverAddress, getAid } from '@mobile/stores/sessionHooks';
import { getBranchId, AccessToken } from '@mobile/stores/loginHooks';
import { computed } from 'vue';
import { useSingleApp } from '@mobile/utils/useSingleApp';

export function useIframeUrl(path: string) {
  const route = useRoute();
  const branchId = getBranchId();
  const { pathname } = useSingleApp();
  const url = computed(() => {
    const urlParams = Object.entries(route.query).reduce((total, [key, value]) => {
      console.log('key', key);
      console.log('value', value);
      if (value !== null && value !== undefined) {
        total += total ? `&${key}=${value}` : `${key}=${value}`;
      }
      return total;
    }, '');

    const host = (serverAddress.value || import.meta.env.VITE_GLOBAL_HOST).replace(/\/$/, '');
    const _pathname = pathname.value?.replace(/^\/+|\/+$/g, '');
    return `${host}/${_pathname}#/mobile-render/${path}?${urlParams}&token=${AccessToken.value}`;
  });

  return { url };
}
