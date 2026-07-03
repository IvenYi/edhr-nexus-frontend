import request from '@mobile/utils/request';
import type { OpenapiRequest, ResponseEntitystring, ResponseEntityApiInfo, ResponseEntityListApiInfo, ResponseEntityOpenapiResponse, ResponseEntityListOpenapiResponse, ResponseEntityPageBaseOpenapiResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOpenapi } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function postOpenapi(data: OpenapiRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOpenapi } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface deleteOpenapiQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOpenapi(params: deleteOpenapiQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 单个api详情
 * import { getOpenapiGetApiInfo } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiGetApiInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiGetApiInfo(params: getOpenapiGetApiInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityApiInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/getApiInfo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 所有api详情
 * import { getOpenapiGetApiInfos } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function getOpenapiGetApiInfos(config:AxiosRequestConfig = {}): Promise<ResponseEntityListApiInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/getApiInfos`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getOpenapiInfo } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiInfo(params: getOpenapiInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOpenapiResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOpenapiList } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function getOpenapiList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOpenapiResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOpenapiPageList } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiPageListQueryInterface {
  key?: string; // key
  modelKey?: string; // modelKey
  name?: string; // name
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
}
export async function getOpenapiPageList(params: getOpenapiPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOpenapiResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putOpenapiById } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface putOpenapiByIdPathInterface {
  id: string; // id
}
export async function putOpenapiById(path: putOpenapiByIdPathInterface, data: OpenapiRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/openapi/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}