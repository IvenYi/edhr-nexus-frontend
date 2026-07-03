import request from '@mobile/utils/request';
import type { ResponseEntityRolePermissionDTO, SingleRolePermission, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * (平台管理后台)查询角色权限点
 * import { getRolePermissionPlatList } from "/@/apis/gct-platform/RolePermissionController"
 */
export interface getRolePermissionPlatListQueryInterface {
  roleId: string; // 角色id
}
export async function getRolePermissionPlatList(params: getRolePermissionPlatListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRolePermissionDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/plat/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色权限删除
 * import { postRolePermissionPlatRemove } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionPlatRemove(data: SingleRolePermission, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/plat/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色权限保存
 * import { postRolePermissionPlatSingle } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionPlatSingle(data: SingleRolePermission, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/plat/single`,
      method: 'post',
      data,
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
export async function getRolePermissionTenantList(params: getRolePermissionTenantListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRolePermissionDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/tenant/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色权限删除
 * import { postRolePermissionTenantRemove } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionTenantRemove(data: SingleRolePermission, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/tenant/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色权限保存
 * import { postRolePermissionTenantSingle } from "/@/apis/gct-platform/RolePermissionController"
 */
export async function postRolePermissionTenantSingle(data: SingleRolePermission, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role-permission/tenant/single`,
      method: 'post',
      data,
      ...config,
    },
  );
}