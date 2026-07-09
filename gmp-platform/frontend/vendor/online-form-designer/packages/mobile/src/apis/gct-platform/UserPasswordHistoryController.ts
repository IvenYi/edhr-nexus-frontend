import request from '@mobile/utils/request';
import type { UserPasswordHistoryRequest, ResponseEntitystring, ResponseEntityUserPasswordHistoryResponse, ResponseEntityListUserPasswordHistoryResponse, ResponseEntityPageBaseUserPasswordHistoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postUserPasswordHistory } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export async function postUserPasswordHistory(data: UserPasswordHistoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteUserPasswordHistory } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export interface deleteUserPasswordHistoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserPasswordHistory(params: deleteUserPasswordHistoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getUserPasswordHistoryInfo } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export interface getUserPasswordHistoryInfoQueryInterface {
  id: string; // id
}
export async function getUserPasswordHistoryInfo(params: getUserPasswordHistoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserPasswordHistoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserPasswordHistoryList } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export async function getUserPasswordHistoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserPasswordHistoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getUserPasswordHistoryPageList } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export interface getUserPasswordHistoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getUserPasswordHistoryPageList(params: getUserPasswordHistoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserPasswordHistoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putUserPasswordHistoryById } from "/@/apis/gct-platform/UserPasswordHistoryController"
 */
export interface putUserPasswordHistoryByIdPathInterface {
  id: string; // id
}
export async function putUserPasswordHistoryById(path: putUserPasswordHistoryByIdPathInterface, data: UserPasswordHistoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-password-history/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}