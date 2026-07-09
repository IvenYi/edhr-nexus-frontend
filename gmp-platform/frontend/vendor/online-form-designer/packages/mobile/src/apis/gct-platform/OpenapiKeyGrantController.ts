import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityOpenapiKeyGrantResponse, ResponseEntityListOpenapiKeyGrantResponse, ResponseEntityListOpenapiAggregateByModelTreeResponse, ResponseEntityListOpenapiAggregateResponse, ResponseEntityPageBaseOpenapiKeyGrantResponse, OpenapiAuthorizationSetRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建保存
 * import { postOpenapiKeyGrant } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function postOpenapiKeyGrant(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOpenapiKeyGrant } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface deleteOpenapiKeyGrantQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOpenapiKeyGrant(params: deleteOpenapiKeyGrantQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 授权信息详情
 * import { getOpenapiKeyGrantInfo } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiKeyGrantInfo(params: getOpenapiKeyGrantInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOpenapiKeyGrantResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOpenapiKeyGrantList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function getOpenapiKeyGrantList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOpenapiKeyGrantResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 已开放api列表
 * import { getOpenapiKeyGrantOpenapiList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantOpenapiListQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
}
export async function getOpenapiKeyGrantOpenapiList(params: getOpenapiKeyGrantOpenapiListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOpenapiAggregateByModelTreeResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/openapi/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 已开放租户api列表
 * import { getOpenapiKeyGrantOpenapiTenantList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function getOpenapiKeyGrantOpenapiTenantList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOpenapiAggregateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/openapi/tenantList`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOpenapiKeyGrantPageList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOpenapiKeyGrantPageList(params: getOpenapiKeyGrantPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOpenapiKeyGrantResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 授权接口修改
 * import { putOpenapiKeyGrantById } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface putOpenapiKeyGrantByIdPathInterface {
  id: string; // id
}
export async function putOpenapiKeyGrantById(path: putOpenapiKeyGrantByIdPathInterface, data: OpenapiAuthorizationSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-key-grant/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}