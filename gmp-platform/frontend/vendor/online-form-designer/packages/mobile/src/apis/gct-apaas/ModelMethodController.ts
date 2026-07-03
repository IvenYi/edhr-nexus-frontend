import request from '@mobile/utils/request';
import type { ModelMethodRequest, ResponseEntitystring, ResponseEntityListModelMethodResponse, ResponseEntityModelMethodResponse, ResponseEntityPageBaseModelMethodResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postModelMethod } from "/@/apis/gct-apaas/ModelMethodController"
 */
export async function postModelMethod(data: ModelMethodRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteModelMethod } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface deleteModelMethodQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelMethod(params: deleteModelMethodQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 数据模型方法列表
 * import { getModelMethodDataModelList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodDataModelListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getModelMethodDataModelList(params: getModelMethodDataModelListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/data-model/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getModelMethodInfo } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodInfoQueryInterface {
  id: string; // id
}
export async function getModelMethodInfo(params: getModelMethodInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelMethodList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodListQueryInterface {
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
}
export async function getModelMethodList(params: getModelMethodListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelMethodPageList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelMethodPageList(params: getModelMethodPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 视图模型方法列表
 * import { getModelMethodViewModelList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodViewModelListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getModelMethodViewModelList(params: getModelMethodViewModelListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/view-model/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putModelMethodById } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface putModelMethodByIdPathInterface {
  id: string; // id
}
export async function putModelMethodById(path: putModelMethodByIdPathInterface, data: ModelMethodRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-method/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}