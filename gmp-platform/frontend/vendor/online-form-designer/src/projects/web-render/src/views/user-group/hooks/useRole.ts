import { computed } from 'vue';
import { BasicAction } from '/@/enums/authActionEnum';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { usePagePermissions } from '../../edhr-application/hooks/usePagePermissions';

const appInfoStore = useAppInfoStore();
const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

export function useRole() {
  const ROLE_KEY = 'UserGroup';
  const UG = 'user-group';

  const userGroupUsePerms = computed(() => {
    if (inEDHRApp.value) {
      const perms = usePagePermissions(UG);
      return perms.value;
    }

    return {
      [BasicAction.Insert]: getPermissionByKey(ROLE_KEY, BasicAction.Insert),
      [BasicAction.Update]: getPermissionByKey(ROLE_KEY, BasicAction.Update),
      [BasicAction.Delete]: getPermissionByKey(ROLE_KEY, BasicAction.Delete),
    };
  });

  return {
    userGroupUsePerms,
    inEDHRApp,
  };
}
