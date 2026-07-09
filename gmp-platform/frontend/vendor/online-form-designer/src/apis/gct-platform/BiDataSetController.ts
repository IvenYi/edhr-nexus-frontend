import { defHttp } from '@/utils/http/axios';
import { BiDataSetRequest, ResponseEntitystring, ResponseEntityBiDataSetResponse, ResponseEntityListBiDataSetResponse, ResponseEntityPageBaseBiDataSetResponse, BiDataSetPreviewRequest, ResponseEntityBiDataSetPreviewResult } from './model/index';

/**
 * 保存
 * import { postBiDataSet } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function postBiDataSet(data: BiDataSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/bi-data-set`,
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
 * import { deleteBiDataSet } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface deleteBiDataSetQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBiDataSet(params: deleteBiDataSetQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/bi-data-set`,
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
 * import { getBiDataSetInfo } from "/@/apis/gct-platform/BiDataSetController"
 */
export interface getBiDataSetInfoQueryInterface {
  id: string; // id
}
export async function getBiDataSetInfo(params: getBiDataSetInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBiDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-data-set/info`,
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
 * import { getBiDataSetList } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function getBiDataSetList(config = {}): Promise<ResponseEntityListBiDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-data-set/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getBiDataSetPageList(params: getBiDataSetPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseBiDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-data-set/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 预览
 * import { postBiDataSetPreview } from "/@/apis/gct-platform/BiDataSetController"
 */
export async function postBiDataSetPreview(data: BiDataSetPreviewRequest, config = {}): Promise<ResponseEntityBiDataSetPreviewResult['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/bi-data-set/preview`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putBiDataSetById(path: putBiDataSetByIdPathInterface, data: BiDataSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/bi-data-set/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}