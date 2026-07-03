import { computed, ComputedRef } from 'vue';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { Page2PermsKeyMap, PagePermissionMap, PagePermissionKey } from '/@/perms/index';

export function usePagePermissions<P extends PagePermissionKey>(
  page: P,
): ComputedRef<PagePermissionMap[P]> {
  const keys = Page2PermsKeyMap[page];

  return computed(() => {
    const perms = {} as PagePermissionMap[P];
    for (const key of keys) {
      perms[key] = !!getPermissionByKey(page, key as string);
    }
    return perms;
  });
}
