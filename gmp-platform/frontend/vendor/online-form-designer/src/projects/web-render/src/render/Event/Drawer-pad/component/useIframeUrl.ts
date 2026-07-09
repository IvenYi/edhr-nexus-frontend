import { serverAddress, getAid } from '@mobile/stores/sessionHooks';
import { getBranchId, AccessToken, CurrentTenant } from '@mobile/stores/loginHooks';
import { computed } from 'vue';

export function useIframeUrl(path: string, query) {
  const branchId = getBranchId();
  const url = computed(() => {
    const urlParams = Object.entries(query).reduce((total, [key, value]) => {
      if (value !== null && value !== undefined) {
        total += total ? `&${key}=${value}` : `${key}=${value}`;
      }
      return total;
    }, '');

    const host = (
      serverAddress.value ||
      import.meta.env.VITE_GLOBAL_HOST ||
      location.origin
    ).replace(/\/$/, '');
    // todo 0506
    const pathname = branchId ? `${getAid.value}/${branchId}` : `${getAid.value}`;
    const _pathname = pathname?.replace(/^\/+|\/+$/g, '');
    // const baseUrl = `http://localhost:5173/src/projects/web/${pathname}/index.html`;
    const baseUrl = `${host}/web/${_pathname}`;
    return `${baseUrl}#/mobile-render/${path}?${urlParams}&token=${AccessToken.value}&tenantId=${CurrentTenant.value.id}`;
  });

  return { url };
}
