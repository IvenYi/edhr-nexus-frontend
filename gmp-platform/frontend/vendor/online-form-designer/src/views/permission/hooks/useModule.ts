import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { ProjectName } from '/@/enums/appEnum';
import {
  postRolePlat,
  deleteRolePlat,
  putRolePlatByIdByEnabled,
  getRolePlatInfo,
  getRolePlatPageList,
  postRoleTenant,
  deleteRoleTenant,
  putRoleTenantByIdByEnabled,
  getRoleTenantInfo,
  getRoleTenantPageList,
} from '/@/apis/gct-platform/RoleController';
import {
  postPlatUserRole,
  deletePlatUserRole,
  postPlatUserRoleReset,
  postTenantUserRole,
  deleteTenantUserRole,
  postTenantUserRoleReset,
} from '/@/apis/gct-platform/UserRoleController';
import {
  getManagerPlatPageList,
  getManagerTenantPageList,
} from '/@/apis/gct-platform/ManagerController';

import {
  getRolePermissionPlatList,
  postRolePermissionPlatRemove,
  postRolePermissionPlatSingle,
  getRolePermissionTenantList,
  postRolePermissionTenantRemove,
  postRolePermissionTenantSingle,
} from '/@/apis/gct-platform/RolePermissionController';

import { getUserPageList } from '/@/apis/gct-platform/UserController';
import { getTenantManagementUserPageList } from '/@/apis/gct-platform/TenantManagementUserController';

const { getCurrentProject } = usePermissionStoreWithOut();

/**
 * 角色管理相关api
 * @returns
 */
export function useRoleApis() {
  return getCurrentProject === ProjectName.TENANT_CENTER
    ? {
        postRole: postRoleTenant,
        deleteRole: deleteRoleTenant,
        putRoleByIdByEnabled: putRoleTenantByIdByEnabled,
        getRoleInfo: getRoleTenantInfo,
        getRolePageList: getRoleTenantPageList,
      }
    : {
        postRole: postRolePlat,
        deleteRole: deleteRolePlat,
        putRoleByIdByEnabled: putRolePlatByIdByEnabled,
        getRoleInfo: getRolePlatInfo,
        getRolePageList: getRolePlatPageList,
      };
}

/**
 * 管理员相关api
 * @returns
 */
export function useAdminApis() {
  return getCurrentProject === ProjectName.TENANT_CENTER
    ? {
        postUserRole: postTenantUserRole,
        deleteUserRole: deleteTenantUserRole,
        postUserRoleReset: postTenantUserRoleReset,
        getManagerPageList: getManagerTenantPageList,
      }
    : {
        postUserRole: postPlatUserRole,
        deleteUserRole: deletePlatUserRole,
        postUserRoleReset: postPlatUserRoleReset,
        getManagerPageList: getManagerPlatPageList,
      };
}

/**
 * 角色权限点api
 * @returns
 */
export function useRolePermissionApis() {
  return getCurrentProject === ProjectName.TENANT_CENTER
    ? {
        getRolePermissionList: getRolePermissionTenantList,
        postRolePermissionRemove: postRolePermissionTenantRemove,
        postRolePermissionSingle: postRolePermissionTenantSingle,
      }
    : {
        getRolePermissionList: getRolePermissionPlatList,
        postRolePermissionRemove: postRolePermissionPlatRemove,
        postRolePermissionSingle: postRolePermissionPlatSingle,
      };
}

export function useUserApis() {
  return getCurrentProject === ProjectName.TENANT_CENTER
    ? {
        getUserPageList: getTenantManagementUserPageList,
      }
    : {
        getUserPageList,
      };
}
