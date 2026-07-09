import request from '@mobile/utils/request';
import type { OnlineUserSummaryRequest, ResponseEntitystring, ResponseEntityOnlineUserSummaryResponse, ResponseEntityListOnlineUserSummaryResponse, ResponseEntityPageBaseOnlineUserSummaryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOnlineUserSummary } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export async function postOnlineUserSummary(data: OnlineUserSummaryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary`,
      method: 'post',
      data,
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
export async function deleteOnlineUserSummary(params: deleteOnlineUserSummaryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary`,
      method: 'delete',
      params,
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
export async function getOnlineUserSummaryInfo(params: getOnlineUserSummaryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineUserSummaryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOnlineUserSummaryList } from "/@/apis/gct-apaas/OnlineUserSummaryController"
 */
export async function getOnlineUserSummaryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineUserSummaryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary/list`,
      method: 'get',
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
export async function getOnlineUserSummaryPageList(params: getOnlineUserSummaryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOnlineUserSummaryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary/page/list`,
      method: 'get',
      params,
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
export async function putOnlineUserSummaryById(path: putOnlineUserSummaryByIdPathInterface, data: OnlineUserSummaryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-user-summary/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}