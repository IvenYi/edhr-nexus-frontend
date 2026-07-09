import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListRoleResponse, RoleRequest, ResponseEntitystring, ResponseEntityRoleResponse, ResponseEntityPageBaseRoleResponse } from './model/index';

/**
 * 列表
 * import { getRoleList } from "/@/apis/gct-platform/RoleController"
 */
export async function getRoleList(config = {}): Promise<ResponseEntityListRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理) 新增编辑 角色
 * import { postRolePlat } from "/@/apis/gct-platform/RoleController"
 */
export async function postRolePlat(data: RoleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role/plat`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteRolePlat(params: deleteRolePlatQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/role/plat`,
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
 * (平台管理)角色详情
 * import { getRolePlatInfo } from "/@/apis/gct-platform/RoleController"
 */
export interface getRolePlatInfoQueryInterface {
  id: string; // id
}
export async function getRolePlatInfo(params: getRolePlatInfoQueryInterface = {}, config = {}): Promise<ResponseEntityRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role/plat/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getRolePlatPageList(params: getRolePlatPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role/plat/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putRolePlatByIdByEnabled(path: putRolePlatByIdByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/role/plat/${path?.id}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)新增编辑 角色
 * import { postRoleTenant } from "/@/apis/gct-platform/RoleController"
 */
export async function postRoleTenant(data: RoleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/role/tenant`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteRoleTenant(params: deleteRoleTenantQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/role/tenant`,
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
 * (租户管理后台)角色详情
 * import { getRoleTenantInfo } from "/@/apis/gct-platform/RoleController"
 */
export interface getRoleTenantInfoQueryInterface {
  id: string; // id
}
export async function getRoleTenantInfo(params: getRoleTenantInfoQueryInterface = {}, config = {}): Promise<ResponseEntityRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role/tenant/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getRoleTenantPageList(params: getRoleTenantPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/role/tenant/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putRoleTenantByIdByEnabled(path: putRoleTenantByIdByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/role/tenant/${path?.id}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}