import { defHttp } from '@/utils/http/axios';
import { OnlineUserSummaryRequest, ResponseEntitystring, ResponseEntityOnlineUserSummaryResponse, ResponseEntityListOnlineUserSummaryResponse, ResponseEntityPageBaseOnlineUserSummaryResponse } from './model/index';

/**
 * 保存
 * import { postOnlineUserSummary } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export async function postOnlineUserSummary(data: OnlineUserSummaryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-user-summary`,
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
 * import { deleteOnlineUserSummary } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export interface deleteOnlineUserSummaryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOnlineUserSummary(params: deleteOnlineUserSummaryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-user-summary`,
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
 * import { getOnlineUserSummaryInfo } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export interface getOnlineUserSummaryInfoQueryInterface {
  id: string; // id
}
export async function getOnlineUserSummaryInfo(params: getOnlineUserSummaryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineUserSummaryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-user-summary/info`,
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
 * import { getOnlineUserSummaryList } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export async function getOnlineUserSummaryList(config = {}): Promise<ResponseEntityListOnlineUserSummaryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-user-summary/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOnlineUserSummaryPageList } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export interface getOnlineUserSummaryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOnlineUserSummaryPageList(params: getOnlineUserSummaryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineUserSummaryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-user-summary/page/list`,
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
 * import { putOnlineUserSummaryById } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export interface putOnlineUserSummaryByIdPathInterface {
  id: string; // id
}
export async function putOnlineUserSummaryById(path: putOnlineUserSummaryByIdPathInterface, data: OnlineUserSummaryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-user-summary/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}