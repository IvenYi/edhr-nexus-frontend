import request from '@mobile/utils/request';
import type { ModelRequest, ResponseEntitystring, ResponseEntityModelResponse, ResponseEntityListModelResponse, ResponseEntityPageBaseModelResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postModel } from "/@/apis/gct-platform/ModelController"
 */
export async function postModel(data: ModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteModel } from "/@/apis/gct-platform/ModelController"
 */
export interface deleteModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModel(params: deleteModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getModelInfo } from "/@/apis/gct-platform/ModelController"
 */
export interface getModelInfoQueryInterface {
  id: string; // id
}
export async function getModelInfo(params: getModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelList } from "/@/apis/gct-platform/ModelController"
 */
export async function getModelList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelPageList } from "/@/apis/gct-platform/ModelController"
 */
export interface getModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelPageList(params: getModelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseModelResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/model/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putModelById } from "/@/apis/gct-platform/ModelController"
 */
export interface putModelByIdPathInterface {
  id: string; // id
}
export async function putModelById(path: putModelByIdPathInterface, data: ModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/model/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}