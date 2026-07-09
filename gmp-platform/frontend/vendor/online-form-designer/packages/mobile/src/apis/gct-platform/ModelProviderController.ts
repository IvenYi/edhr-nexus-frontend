import request from '@mobile/utils/request';
import type { ModelProviderRequest, ResponseEntitystring, ResponseEntityModelProviderResponse, ResponseEntityListModelProviderResponse, ResponseEntityPageBaseModelProviderResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postModelProvider } from "/@/apis/gct-platform/ModelProviderController"
 */
export async function postModelProvider(data: ModelProviderRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteModelProvider } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface deleteModelProviderQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelProvider(params: deleteModelProviderQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getModelProviderInfo } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface getModelProviderInfoQueryInterface {
  id: string; // id
}
export async function getModelProviderInfo(params: getModelProviderInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelProviderResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelProviderList } from "/@/apis/gct-platform/ModelProviderController"
 */
export async function getModelProviderList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelProviderResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelProviderPageList } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface getModelProviderPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelProviderPageList(params: getModelProviderPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseModelProviderResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putModelProviderById } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface putModelProviderByIdPathInterface {
  id: string; // id
}
export async function putModelProviderById(path: putModelProviderByIdPathInterface, data: ModelProviderRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model-provider/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}