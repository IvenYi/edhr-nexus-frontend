import request from '@mobile/utils/request';
import type { RoleRequest, ResponseEntitystring, ResponseEntityRoleResponse, ResponseEntityListRoleResponse, ResponseEntityPageBaseRoleResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新增编辑 角色
 * import { postRole } from "/@/apis/gct-apaas/RoleController"
 */
export async function postRole(data: RoleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role`,
      method: 'post',
      data,
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
export async function deleteRole(params: deleteRoleQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role`,
      method: 'delete',
      params,
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
export async function getRoleInfo(params: getRoleInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRoleResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/role/info`,
      method: 'get',
      params,
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
export async function getRoleList(params: getRoleListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListRoleResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/role/list`,
      method: 'get',
      params,
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
export async function getRolePageList(params: getRolePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseRoleResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/role/page/list`,
      method: 'get',
      params,
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
export async function putRoleByIdByEnabled(path: putRoleByIdByEnabledPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role/${path?.id}/${path?.enabled}`,
      method: 'put',
      ...config,
    },
  );
}