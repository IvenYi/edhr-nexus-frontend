import { useRouter, type RouteRecordRaw } from 'vue-router';

import { useAppStore } from '/@/store/modules/app';
import { usePermissionStore } from '/@/store/modules/permission';
import { useUserStore } from '/@/store/modules/user';

import { useTabs } from './useTabs';

import { resetRouter, getCurrentRouter } from '/@/hooks/web/useRouter';

import projectSetting from '/@/settings/projectSetting';
import { PermissionModeEnum, ProjectName } from '/@/enums/appEnum';
import { RoleEnum } from '/@/enums/roleEnum';

import { intersection } from 'lodash-es';
import { isArray } from '/@/utils/is';
import { useMultipleTabStore } from '/@/store/modules/multipleTab';
// import { router } from '/@portal/router';
// User permissions related operations
export function usePermission() {
  const userStore = useUserStore();
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const router = getCurrentRouter();
  const vueRouter = useRouter();

  const { closeAll } = useTabs(router);

  /**
   * Change permission mode
   */
  async function togglePermissionMode() {
    appStore.setProjectConfig({
      permissionMode:
        appStore.projectConfig?.permissionMode === PermissionModeEnum.BACK
          ? PermissionModeEnum.ROUTE_MAPPING
          : PermissionModeEnum.BACK,
    });
    location.reload();
  }

  /**
   * Reset and regain authority resource information
   * 重置和重新获得权限资源信息
   * @param id
   */
  async function resume() {
    const tabStore = useMultipleTabStore();
    tabStore.clearCacheTabs();
    resetRouter();
    const routes = await permissionStore.buildRoutesAction();
    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });
    permissionStore.setLastBuildMenuTime();
    closeAll();
  }

  /**
   * Determine whether there is permission
   */
  function hasPermission(
    value?: RoleEnum | RoleEnum[] | string | string[],
    def = true,
    isPage = false,
  ): boolean {
    if (!value) {
      return def;
    }

    if (permissionStore.getCurrentProject === ProjectName.DEVELOPER_CENTER) {
      return true;
    }

    const permMode = appStore.projectConfig?.permissionMode;

    if ([PermissionModeEnum.ROUTE_MAPPING, PermissionModeEnum.ROLE].includes(permMode)) {
      if (!isArray(value)) {
        return userStore.getRoleList?.includes(value as RoleEnum);
      }
      return (intersection(value, userStore.getRoleList) as RoleEnum[]).length > 0;
    }

    // 管理后台权限
    if (
      PermissionModeEnum.PLATFORM_ROLE === permMode &&
      permissionStore.getCurrentProject === ProjectName.BACKEND_MANAGEMENT
    ) {
      if (!vueRouter) {
        return false;
      }
      if (userStore.getUserInfo?.globalSuperAdmin) {
        return true;
      }
      const blocks = (value as string).split('.');
      if (isPage) {
        if (blocks.length === 1) {
          blocks.unshift('BACKEND_MANAGEMENT');
        }
        const pKey = blocks.join('.');
        return userStore.getUserPermissions[pKey];
      } else {
        if (blocks.length === 1) {
          blocks.unshift('BACKEND_MANAGEMENT', vueRouter.currentRoute.value.name as string);
        } else if (blocks.length === 2) {
          blocks.unshift('BACKEND_MANAGEMENT');
        }
        const pKey = blocks.join('.');
        const pKeyStandby = [blocks[0], blocks[1], '*'].join('.');
        return !!(userStore.getUserPermissions[pKey] || userStore.getUserPermissions[pKeyStandby]);
      }
    }

    // 租户管理后台权限
    if (
      PermissionModeEnum.PLATFORM_ROLE === permMode &&
      permissionStore.getCurrentProject === ProjectName.TENANT_CENTER
    ) {
      if (!vueRouter) {
        return false;
      }
      if (
        userStore.getTenantUserInfo?.globalSuperAdmin ||
        userStore.getTenantUserInfo?.tenantSuperAdmin
      ) {
        return true;
      }
      const blocks = (value as string).split('.');
      if (isPage) {
        if (blocks.length === 1) {
          blocks.unshift('TENANT_CENTER');
        }
        const pKey = blocks.join('.');
        return userStore.getTenantUserPermissions![pKey];
      } else {
        if (blocks.length === 1) {
          blocks.unshift('TENANT_CENTER', vueRouter.currentRoute.value.name as string);
        } else if (blocks.length === 2) {
          blocks.unshift('TENANT_CENTER');
        }
        const pKey = blocks.join('.');
        const pKeyStandby = [blocks[0], blocks[1], '*'].join('.');
        return !!(
          userStore.getTenantUserPermissions![pKey] ||
          userStore.getTenantUserPermissions![pKeyStandby]
        );
      }
    }

    return true;
  }

  /**
   * Change roles
   * @param roles
   */
  async function changeRole(roles: RoleEnum | RoleEnum[]): Promise<void> {
    if (projectSetting.permissionMode !== PermissionModeEnum.ROUTE_MAPPING) {
      throw new Error(
        'Please switch PermissionModeEnum to ROUTE_MAPPING mode in the configuration to operate!',
      );
    }

    if (!isArray(roles)) {
      roles = [roles];
    }
    userStore.setRoleList(roles);
    await resume();
  }

  /**
   * refresh menu data
   */
  async function refreshMenu() {
    resume();
  }

  return { changeRole, hasPermission, togglePermissionMode, refreshMenu };
}
