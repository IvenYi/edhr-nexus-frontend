import request from '@mobile/utils/request';
import type { StashRequest, ResponseEntitystring, ResponseEntityStashResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postStash } from "/@/apis/gct-apaas/StashController"
 */
export async function postStash(data: StashRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/stash`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteStash } from "/@/apis/gct-apaas/StashController"
 */
export interface deleteStashQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteStash(params: deleteStashQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/stash`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据 clientKey 查找
 * import { getStashFindByClientKey } from "/@/apis/gct-apaas/StashController"
 */
export interface getStashFindByClientKeyQueryInterface {
  clientKey: string; // clientKey
}
export async function getStashFindByClientKey(params: getStashFindByClientKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityStashResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/stash/findByClientKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getStashInfo } from "/@/apis/gct-apaas/StashController"
 */
export interface getStashInfoQueryInterface {
  id: string; // id
}
export async function getStashInfo(params: getStashInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityStashResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/stash/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putStashById } from "/@/apis/gct-apaas/StashController"
 */
export interface putStashByIdPathInterface {
  id: string; // id
}
export async function putStashById(path: putStashByIdPathInterface, data: StashRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/stash/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}