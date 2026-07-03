import { defHttp } from '@/utils/http/axios';
import { ResponseEntityRolePermissionDTO, SingleRolePermission, ResponseEntitystring } from './model/index';

/**
 * (平台管理后台)查询角色权限点
 * import { getRolePermissionPlatList } from "/@/apis/gct-platform/RolePermissionController"
 */
export interface getRolePermissionPlatListQueryInterface {
  roleId: string; // 角色id
}
export async function getRolePermissionPlatList(params: getRolePermissionPlatListQueryInterface = {}, config = {}): Promise<ResponseEntityRolePermissionDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role-permission/plat/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色权限删除
 * import { postRolePermissionPlatRemove } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionPlatRemove(data: SingleRolePermission, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role-permission/plat/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色权限保存
 * import { postRolePermissionPlatSingle } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionPlatSingle(data: SingleRolePermission, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role-permission/plat/single`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)查询角色权限点
 * import { getRolePermissionTenantList } from "/@/apis/gct-platform/RolePermissionController"
 */
export interface getRolePermissionTenantListQueryInterface {
  roleId: string; // 角色id
}
export async function getRolePermissionTenantList(params: getRolePermissionTenantListQueryInterface = {}, config = {}): Promise<ResponseEntityRolePermissionDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role-permission/tenant/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色权限删除
 * import { postRolePermissionTenantRemove } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionTenantRemove(data: SingleRolePermission, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role-permission/tenant/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色权限保存
 * import { postRolePermissionTenantSingle } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionTenantSingle(data: SingleRolePermission, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role-permission/tenant/single`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}