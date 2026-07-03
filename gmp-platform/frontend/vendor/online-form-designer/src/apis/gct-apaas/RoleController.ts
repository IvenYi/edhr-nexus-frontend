import { defHttp } from '@/utils/http/axios';
import { RoleRequest, ResponseEntitystring, ResponseEntityRoleResponse, ResponseEntityListRoleResponse, ResponseEntityPageBaseRoleResponse } from './model/index';

/**
 * 新增编辑 角色
 * import { postRole } from "/@/apis/gct-apaas/RoleController"
 */
export async function postRole(data: RoleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/role`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 角色删除
 * import { deleteRole } from "/@/apis/gct-apaas/RoleController"
 */
export interface deleteRoleQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRole(params: deleteRoleQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/role`,
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
 * 详情
 * import { getRoleInfo } from "/@/apis/gct-apaas/RoleController"
 */
export interface getRoleInfoQueryInterface {
  id: string; // id
}
export async function getRoleInfo(params: getRoleInfoQueryInterface = {}, config = {}): Promise<ResponseEntityRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/role/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getRoleList } from "/@/apis/gct-apaas/RoleController"
 */
export interface getRoleListQueryInterface {
  enabled?: number; // 状态(1:启用 ,0: 禁用 空查询全部)
  roleName?: string; // 角色名称
}
export async function getRoleList(params: getRoleListQueryInterface = {}, config = {}): Promise<ResponseEntityListRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/role/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 角色条件查询分页列表
 * import { getRolePageList } from "/@/apis/gct-apaas/RoleController"
 */
export interface getRolePageListQueryInterface {
  enabled?: number; // 状态(1:启用 ,0: 禁用 空查询全部)
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  roleName?: string; // 角色名称
}
export async function getRolePageList(params: getRolePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/role/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 角色 启用禁用
 * import { putRoleByIdByEnabled } from "/@/apis/gct-apaas/RoleController"
 */
export interface putRoleByIdByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  id: string; // id
}
export async function putRoleByIdByEnabled(path: putRoleByIdByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/role/${path?.id}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}