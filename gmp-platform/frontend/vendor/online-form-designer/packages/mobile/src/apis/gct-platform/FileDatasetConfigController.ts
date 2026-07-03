import request from '@mobile/utils/request';
import type { BiFileDatasetConfigRequest, ResponseEntitystring, ResponseEntityBiFileDatasetConfigResponse, ResponseEntityListBiFileDatasetConfigResponse, ResponseEntityPageBaseBiFileDatasetConfigResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postBiFileDatasetConfig } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export async function postBiFileDatasetConfig(data: BiFileDatasetConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteBiFileDatasetConfig } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export interface deleteBiFileDatasetConfigQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBiFileDatasetConfig(params: deleteBiFileDatasetConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getBiFileDatasetConfigInfo } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export interface getBiFileDatasetConfigInfoQueryInterface {
  datasetId?: string; // datasetId
  datasetKey?: string; // datasetKey
}
export async function getBiFileDatasetConfigInfo(params: getBiFileDatasetConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBiFileDatasetConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getBiFileDatasetConfigList } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export async function getBiFileDatasetConfigList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListBiFileDatasetConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据数据集id获取列表
 * import { getBiFileDatasetConfigListDatasetid } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export interface getBiFileDatasetConfigListDatasetidQueryInterface {
  datasetId?: string; // datasetId
}
export async function getBiFileDatasetConfigListDatasetid(params: getBiFileDatasetConfigListDatasetidQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListBiFileDatasetConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config/list-datasetid`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getBiFileDatasetConfigPageList } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export interface getBiFileDatasetConfigPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBiFileDatasetConfigPageList(params: getBiFileDatasetConfigPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseBiFileDatasetConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBiFileDatasetConfigById } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export interface putBiFileDatasetConfigByIdPathInterface {
  id: string; // id
}
export async function putBiFileDatasetConfigById(path: putBiFileDatasetConfigByIdPathInterface, data: BiFileDatasetConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file-dataset-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}