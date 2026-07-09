import request from '@mobile/utils/request';
import type { EdhrItemRequest, ResponseEntitystring, ResponseEntityEdhrItemResponse, ResponseEntityListEdhrItemResponse, ResponseEntityPageBaseEdhrItemResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建sheet保存
 * import { postEdhrItem } from "/@/apis/gct-apaas/EdhrItemController"
 */
export async function postEdhrItem(data: EdhrItemRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-item`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除sheet
 * import { deleteEdhrItem } from "/@/apis/gct-apaas/EdhrItemController"
 */
export interface deleteEdhrItemQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrItem(params: deleteEdhrItemQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-item`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getEdhrItemInfo } from "/@/apis/gct-apaas/EdhrItemController"
 */
export interface getEdhrItemInfoQueryInterface {
  id: string; // id
}
export async function getEdhrItemInfo(params: getEdhrItemInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrItemResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-item/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEdhrItemList } from "/@/apis/gct-apaas/EdhrItemController"
 */
export async function getEdhrItemList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrItemResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-item/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEdhrItemPageList } from "/@/apis/gct-apaas/EdhrItemController"
 */
export interface getEdhrItemPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getEdhrItemPageList(params: getEdhrItemPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrItemResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-item/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}