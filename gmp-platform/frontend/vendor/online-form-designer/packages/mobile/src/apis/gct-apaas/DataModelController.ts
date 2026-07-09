import request from '@mobile/utils/request';
import type { DataModelRequest, ResponseEntitystring, ResponseEntityDataModelResponse, ResponseEntityListDataModelResponse, ResponseEntityPageBaseDataModelResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 数据模型保存
 * import { postDataModel } from "/@/apis/gct-apaas/DataModelController"
 */
export async function postDataModel(data: DataModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDataModel } from "/@/apis/gct-apaas/DataModelController"
 */
export interface deleteDataModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataModel(params: deleteDataModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDataModelInfo } from "/@/apis/gct-apaas/DataModelController"
 */
export interface getDataModelInfoQueryInterface {
  id: string; // id
}
export async function getDataModelInfo(params: getDataModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDataModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDataModelList } from "/@/apis/gct-apaas/DataModelController"
 */
export async function getDataModelList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDataModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDataModelPageList } from "/@/apis/gct-apaas/DataModelController"
 */
export interface getDataModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDataModelPageList(params: getDataModelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDataModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 数据模型修改
 * import { putDataModelById } from "/@/apis/gct-apaas/DataModelController"
 */
export interface putDataModelByIdPathInterface {
  id: string; // id
}
export async function putDataModelById(path: putDataModelByIdPathInterface, data: DataModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}