import request from '@mobile/utils/request';
import type { UserRoleRequest, ResponseEntitystring, UserRoles4Update } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * (平台管理)添加管理员 保存
 * import { postPlatUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postPlatUserRole(data: UserRoleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/user-role`,
      method: 'post',
      data,
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
export async function deletePlatUserRole(params: deletePlatUserRoleQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/user-role`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * (平台管理)管理员角色编辑
 * import { postPlatUserRoleReset } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postPlatUserRoleReset(data: UserRoles4Update, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/user-role/reset`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)添加管理员 保存
 * import { postTenantUserRole } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postTenantUserRole(data: UserRoleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/user-role`,
      method: 'post',
      data,
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
export async function deleteTenantUserRole(params: deleteTenantUserRoleQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/user-role`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * (租户管理后台)管理员角色编辑
 * import { postTenantUserRoleReset } from "/@/apis/gct-platform/UserRoleController"
 */
export async function postTenantUserRoleReset(data: UserRoles4Update, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/user-role/reset`,
      method: 'post',
      data,
      ...config,
    },
  );
}