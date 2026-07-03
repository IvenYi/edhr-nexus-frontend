import request from '@mobile/utils/request';
import type { BiDataSetRequest, ResponseEntitystring, ResponseEntityBiDataSetResponse, ResponseEntityListBiDataSetResponse, ResponseEntityPageBaseBiDataSetResponse, BiDataSetPreviewRequest, ResponseEntityBiDataSetPreviewResult } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postBiDataSet } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function postBiDataSet(data: BiDataSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteBiDataSet } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface deleteBiDataSetQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBiDataSet(params: deleteBiDataSetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getBiDataSetInfo } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface getBiDataSetInfoQueryInterface {
  id: string; // id
}
export async function getBiDataSetInfo(params: getBiDataSetInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBiDataSetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getBiDataSetList } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function getBiDataSetList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListBiDataSetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getBiDataSetPageList } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface getBiDataSetPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBiDataSetPageList(params: getBiDataSetPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseBiDataSetResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 预览
 * import { postBiDataSetPreview } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function postBiDataSetPreview(data: BiDataSetPreviewRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityBiDataSetPreviewResult['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set/preview`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBiDataSetById } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface putBiDataSetByIdPathInterface {
  id: string; // id
}
export async function putBiDataSetById(path: putBiDataSetByIdPathInterface, data: BiDataSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-data-set/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}