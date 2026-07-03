import request from '@mobile/utils/request';
import type { SystemVarRequest, ResponseEntitystring, ResponseEntityListMapstringstring, ResponseEntitySystemVarResponse, ResponseEntityListSystemVarResponse, ResponseEntityPageBaseSystemVarResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSystemVar } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function postSystemVar(data: SystemVarRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteSystemVar } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface deleteSystemVarQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSystemVar(params: deleteSystemVarQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据当前环境获取多个变量的值
 * import { getSystemVarGetSystemVarByKeys } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarGetSystemVarByKeysQueryInterface {
  keys: string; // 要查询的key，多个按','分割
}
export async function getSystemVarGetSystemVarByKeys(params: getSystemVarGetSystemVarByKeysQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/getSystemVarByKeys`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据当前环境获取多个变量的值（包含内置）
 * import { getSystemVarGetVarByKeys } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarGetVarByKeysQueryInterface {
  keys: string; // 要查询的key，多个按','分割
}
export async function getSystemVarGetVarByKeys(params: getSystemVarGetVarByKeysQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/getVarByKeys`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getSystemVarInfo } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarInfoQueryInterface {
  id: string; // id
}
export async function getSystemVarInfo(params: getSystemVarInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySystemVarResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSystemVarList } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function getSystemVarList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSystemVarResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表(缓存)
 * import { getSystemVarListSystemVarCache } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function getSystemVarListSystemVarCache(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSystemVarResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/listSystemVarCache`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSystemVarPageList } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarPageListQueryInterface {
  description?: string; // 备注信息
  endTime?: string; // 结束时间
  key?: string; // key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getSystemVarPageList(params: getSystemVarPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSystemVarResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putSystemVarById } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface putSystemVarByIdPathInterface {
  id: string; // id
}
export async function putSystemVarById(path: putSystemVarByIdPathInterface, data: SystemVarRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/system-var/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}