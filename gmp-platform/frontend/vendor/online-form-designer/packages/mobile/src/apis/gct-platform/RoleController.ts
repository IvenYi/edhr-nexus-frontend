import request from '@mobile/utils/request';
import type { ResponseEntityListRoleResponse, RoleRequest, ResponseEntitystring, ResponseEntityRoleResponse, ResponseEntityPageBaseRoleResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 列表
 * import { getRoleList } from "/@/apis/gct-platform/RoleController"
 */
export async function getRoleList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListRoleResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/role/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * (平台管理) 新增编辑 角色
 * import { postRolePlat } from "/@/apis/gct-platform/RoleController"
 */
export async function postRolePlat(data: RoleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/plat`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色删除
 * import { deleteRolePlat } from "/@/apis/gct-platform/RoleController"
 */
export interface deleteRolePlatQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRolePlat(params: deleteRolePlatQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/plat`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * (平台管理)角色详情
 * import { getRolePlatInfo } from "/@/apis/gct-platform/RoleController"
 */
export interface getRolePlatInfoQueryInterface {
  id: string; // id
}
export async function getRolePlatInfo(params: getRolePlatInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRoleResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/role/plat/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (平台管理)角色条件查询分页列表
 * import { getRolePlatPageList } from "/@/apis/gct-platform/RoleController"
 */
export interface getRolePlatPageListQueryInterface {
  enabled?: number; // 状态(1:启用 ,0: 禁用 空查询全部)
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  roleName?: string; // 角色名称
}
export async function getRolePlatPageList(params: getRolePlatPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/role/plat/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (平台管理后台)角色 启用禁用
 * import { putRolePlatByIdByEnabled } from "/@/apis/gct-platform/RoleController"
 */
export interface putRolePlatByIdByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  id: string; // id
}
export async function putRolePlatByIdByEnabled(path: putRolePlatByIdByEnabledPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/plat/${path?.id}/${path?.enabled}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * (租户管理后台)新增编辑 角色
 * import { postRoleTenant } from "/@/apis/gct-platform/RoleController"
 */
export async function postRoleTenant(data: RoleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/tenant`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色删除
 * import { deleteRoleTenant } from "/@/apis/gct-platform/RoleController"
 */
export interface deleteRoleTenantQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRoleTenant(params: deleteRoleTenantQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/tenant`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * (租户管理后台)角色详情
 * import { getRoleTenantInfo } from "/@/apis/gct-platform/RoleController"
 */
export interface getRoleTenantInfoQueryInterface {
  id: string; // id
}
export async function getRoleTenantInfo(params: getRoleTenantInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRoleResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/role/tenant/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色条件查询分页列表
 * import { getRoleTenantPageList } from "/@/apis/gct-platform/RoleController"
 */
export interface getRoleTenantPageListQueryInterface {
  enabled?: number; // 状态(1:启用 ,0: 禁用 空查询全部)
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  roleName?: string; // 角色名称
}
export async function getRoleTenantPageList(params: getRoleTenantPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/role/tenant/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (租户管理后台)角色 启用禁用
 * import { putRoleTenantByIdByEnabled } from "/@/apis/gct-platform/RoleController"
 */
export interface putRoleTenantByIdByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  id: string; // id
}
export async function putRoleTenantByIdByEnabled(path: putRoleTenantByIdByEnabledPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/role/tenant/${path?.id}/${path?.enabled}`,
      method: 'put',
      ...config,
    },
  );
}