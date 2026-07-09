import { defHttp } from '@/utils/http/axios';
import { BiShareRequest, ResponseEntitystring, ResponseEntityBiShareResponse, ResponseEntityListBiShareResponse, ResponseEntityPageBaseBiShareResponse } from './model/index';

/**
 * 保存
 * import { postBiShare } from "/@/apis/gct-platform/BiShareController"
 */
export async function postBiShare(data: BiShareRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/bi-share`,
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
 * import { deleteBiShare } from "/@/apis/gct-platform/BiShareController"
 */
export interface deleteBiShareQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBiShare(params: deleteBiShareQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/bi-share`,
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
 * import { getBiShareInfo } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiShareInfoQueryInterface {
  id?: string; // id
  shareId?: string; // shareId
}
export async function getBiShareInfo(params: getBiShareInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBiShareResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-share/info`,
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
 * import { getBiShareList } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiShareListQueryInterface {
  projectId?: string; // projectId
}
export async function getBiShareList(params: getBiShareListQueryInterface = {}, config = {}): Promise<ResponseEntityListBiShareResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-share/list`,
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
 * import { getBiSharePageList } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiSharePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBiSharePageList(params: getBiSharePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseBiShareResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-share/page/list`,
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
 * import { putBiShareById } from "/@/apis/gct-platform/BiShareController"
 */
export interface putBiShareByIdPathInterface {
  id: string; // id
}
export async function putBiShareById(path: putBiShareByIdPathInterface, data: BiShareRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/bi-share/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}