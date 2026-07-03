import request from '@mobile/utils/request';
import type { PermissionRequest, ResponseEntitystring, ResponseEntityListPermissionResponse, ResponseEntityPageBasePermissionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPermission } from "/@/apis/gct-platform/PermissionController"
 */
export async function postPermission(data: PermissionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/permission`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePermission } from "/@/apis/gct-platform/PermissionController"
 */
export interface deletePermissionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePermission(params: deletePermissionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/permission`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 列表
 * import { getPermissionList } from "/@/apis/gct-platform/PermissionController"
 */
export async function getPermissionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPermissionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/permission/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPermissionPageList } from "/@/apis/gct-platform/PermissionController"
 */
export interface getPermissionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPermissionPageList(params: getPermissionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePermissionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/permission/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPermissionById } from "/@/apis/gct-platform/PermissionController"
 */
export interface putPermissionByIdPathInterface {
  id: string; // id
}
export async function putPermissionById(path: putPermissionByIdPathInterface, data: PermissionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/permission/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}