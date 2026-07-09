import { defHttp } from '@/utils/http/axios';
import { SignHistoryRequest, ResponseEntitystring, ResponseEntitySignHistoryResponse, ResponseEntityListSignHistoryResponse, ResponseEntityPageBaseSignHistoryResponse } from './model/index';

/**
 * 保存
 * import { postSignHistory } from "/@/apis/gct-apaas/SignHistoryController"
 */
export async function postSignHistory(data: SignHistoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sign-history`,
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
 * import { deleteSignHistory } from "/@/apis/gct-apaas/SignHistoryController"
 */
export interface deleteSignHistoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSignHistory(params: deleteSignHistoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/sign-history`,
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
 * import { getSignHistoryInfo } from "/@/apis/gct-apaas/SignHistoryController"
 */
export interface getSignHistoryInfoQueryInterface {
  id: string; // id
}
export async function getSignHistoryInfo(params: getSignHistoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySignHistoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sign-history/info`,
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
 * import { getSignHistoryList } from "/@/apis/gct-apaas/SignHistoryController"
 */
export async function getSignHistoryList(config = {}): Promise<ResponseEntityListSignHistoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sign-history/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSignHistoryPageList } from "/@/apis/gct-apaas/SignHistoryController"
 */
export interface getSignHistoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getSignHistoryPageList(params: getSignHistoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseSignHistoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sign-history/page/list`,
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
 * import { putSignHistoryById } from "/@/apis/gct-apaas/SignHistoryController"
 */
export interface putSignHistoryByIdPathInterface {
  id: string; // id
}
export async function putSignHistoryById(path: putSignHistoryByIdPathInterface, data: SignHistoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/sign-history/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}