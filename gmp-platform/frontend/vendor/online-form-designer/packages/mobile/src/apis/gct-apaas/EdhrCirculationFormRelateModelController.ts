import request from '@mobile/utils/request';
import type { EdhrCirculationFormModelMetaRequest, ResponseEntitystring, ResponseEntityModelMetaDTO, ResponseEntityEdhrCirculationFormModelMetaResponse, ResponseEntityListEdhrCirculationFormModelMetaResponse, ResponseEntityPageBaseEdhrCirculationFormModelMetaResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postEdhrCirculationFormRelateModel } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export async function postEdhrCirculationFormRelateModel(data: EdhrCirculationFormModelMetaRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEdhrCirculationFormRelateModel } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface deleteEdhrCirculationFormRelateModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrCirculationFormRelateModel(params: deleteEdhrCirculationFormRelateModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据模型key查询模型和字段详情
 * import { getEdhrCirculationFormRelateModelDetail } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelDetailQueryInterface {
  modelKey: string; // 模型key
  types?: string; // 需要去除的类型type，多个按','分割
}
export async function getEdhrCirculationFormRelateModelDetail(params: getEdhrCirculationFormRelateModelDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/detail`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getEdhrCirculationFormRelateModelInfo } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelInfoQueryInterface {
  id: string; // id
}
export async function getEdhrCirculationFormRelateModelInfo(params: getEdhrCirculationFormRelateModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrCirculationFormModelMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEdhrCirculationFormRelateModelList } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export async function getEdhrCirculationFormRelateModelList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrCirculationFormModelMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEdhrCirculationFormRelateModelPageList } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getEdhrCirculationFormRelateModelPageList(params: getEdhrCirculationFormRelateModelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrCirculationFormModelMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putEdhrCirculationFormRelateModelById } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface putEdhrCirculationFormRelateModelByIdPathInterface {
  id: string; // id
}
export async function putEdhrCirculationFormRelateModelById(path: putEdhrCirculationFormRelateModelByIdPathInterface, data: EdhrCirculationFormModelMetaRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}