import { defHttp } from '@/utils/http/axios';
import { PermissionRequest, ResponseEntitystring, ResponseEntityPermissionResponse, ResponseEntityListPermissionResponse, ResponseEntityPageBasePermissionResponse } from './model/index';

/**
 * 保存
 * import { postPermission } from "/@/apis/gct-apaas/PermissionController"
 */
export async function postPermission(data: PermissionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/permission`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePermission } from "/@/apis/gct-apaas/PermissionController"
 */
export interface deletePermissionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePermission(params: deletePermissionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/permission`,
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
 * import { getPermissionInfo } from "/@/apis/gct-apaas/PermissionController"
 */
export interface getPermissionInfoQueryInterface {
  id: string; // id
}
export async function getPermissionInfo(params: getPermissionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPermissionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/permission/info`,
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
 * import { getPermissionList } from "/@/apis/gct-apaas/PermissionController"
 */
export interface getPermissionListQueryInterface {
  relationId?: string; // ...
}
export async function getPermissionList(params: getPermissionListQueryInterface = {}, config = {}): Promise<ResponseEntityListPermissionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/permission/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPermissionPageList } from "/@/apis/gct-apaas/PermissionController"
 */
export interface getPermissionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPermissionPageList(params: getPermissionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePermissionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/permission/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPermissionById } from "/@/apis/gct-apaas/PermissionController"
 */
export interface putPermissionByIdPathInterface {
  id: string; // id
}
export async function putPermissionById(path: putPermissionByIdPathInterface, data: PermissionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/permission/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}