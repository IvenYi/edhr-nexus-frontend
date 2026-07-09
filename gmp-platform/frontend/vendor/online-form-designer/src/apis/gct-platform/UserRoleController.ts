import { defHttp } from '@/utils/http/axios';
import { UserRoleRequest, ResponseEntitystring, UserRoles4Update } from './model/index';

/**
 * (平台管理)添加管理员 保存
 * import { postPlatUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postPlatUserRole(data: UserRoleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/user-role`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理)管理员角色删除
 * import { deletePlatUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export interface deletePlatUserRoleQueryInterface {
  userId: string; // 删除的userId
}
export async function deletePlatUserRole(params: deletePlatUserRoleQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/plat/user-role`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * (平台管理)管理员角色编辑
 * import { postPlatUserRoleReset } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postPlatUserRoleReset(data: UserRoles4Update, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/user-role/reset`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)添加管理员 保存
 * import { postTenantUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postTenantUserRole(data: UserRoleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/user-role`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)管理员角色删除
 * import { deleteTenantUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export interface deleteTenantUserRoleQueryInterface {
  userId: string; // 删除的userId
}
export async function deleteTenantUserRole(params: deleteTenantUserRoleQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/tenant/user-role`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)管理员角色编辑
 * import { postTenantUserRoleReset } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postTenantUserRoleReset(data: UserRoles4Update, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/user-role/reset`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}