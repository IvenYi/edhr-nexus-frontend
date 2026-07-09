import { defHttp } from '@/utils/http/axios';
import { BiFileDatasetConfigRequest, ResponseEntitystring, ResponseEntityBiFileDatasetConfigResponse, ResponseEntityListBiFileDatasetConfigResponse, ResponseEntityPageBaseBiFileDatasetConfigResponse } from './model/index';

/**
 * 保存
 * import { postBiFileDatasetConfig } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export async function postBiFileDatasetConfig(data: BiFileDatasetConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/bi-file-dataset-config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteBiFileDatasetConfig(params: deleteBiFileDatasetConfigQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/bi-file-dataset-config`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getBiFileDatasetConfigInfo(params: getBiFileDatasetConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBiFileDatasetConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-file-dataset-config/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getBiFileDatasetConfigList } from "/@/apis/gct-platform/FileDatasetConfigController"
 */
export async function getBiFileDatasetConfigList(config = {}): Promise<ResponseEntityListBiFileDatasetConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-file-dataset-config/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getBiFileDatasetConfigListDatasetid(params: getBiFileDatasetConfigListDatasetidQueryInterface = {}, config = {}): Promise<ResponseEntityListBiFileDatasetConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-file-dataset-config/list-datasetid`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getBiFileDatasetConfigPageList(params: getBiFileDatasetConfigPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseBiFileDatasetConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-file-dataset-config/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putBiFileDatasetConfigById(path: putBiFileDatasetConfigByIdPathInterface, data: BiFileDatasetConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/bi-file-dataset-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}