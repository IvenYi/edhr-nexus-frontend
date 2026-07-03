import request from '@mobile/utils/request';
import type { SignHistoryRequest, ResponseEntitystring, ResponseEntitySignHistoryResponse, ResponseEntityListSignHistoryResponse, ResponseEntityPageBaseSignHistoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSignHistory } from "/@/apis/gct-apaas/SignHistoryController"
 */
export async function postSignHistory(data: SignHistoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history`,
      method: 'post',
      data,
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
export async function deleteSignHistory(params: deleteSignHistoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history`,
      method: 'delete',
      params,
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
export async function getSignHistoryInfo(params: getSignHistoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySignHistoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSignHistoryList } from "/@/apis/gct-apaas/SignHistoryController"
 */
export async function getSignHistoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSignHistoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history/list`,
      method: 'get',
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
export async function getSignHistoryPageList(params: getSignHistoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSignHistoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history/page/list`,
      method: 'get',
      params,
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
export async function putSignHistoryById(path: putSignHistoryByIdPathInterface, data: SignHistoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sign-history/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}