import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityListEdhrInstanceSearchHistoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteEdhrInstanceSearchHistory } from "/@/apis/gct-apaas/EdhrInstanceSearchHistoryController"
 */
export interface deleteEdhrInstanceSearchHistoryQueryInterface {
  id: string; // id
}
export async function deleteEdhrInstanceSearchHistory(params: deleteEdhrInstanceSearchHistoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-search-history`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 列表
 * import { getEdhrInstanceSearchHistoryList } from "/@/apis/gct-apaas/EdhrInstanceSearchHistoryController"
 */
export interface getEdhrInstanceSearchHistoryListQueryInterface {
  materialNo?: string; // 物料号
}
export async function getEdhrInstanceSearchHistoryList(params: getEdhrInstanceSearchHistoryListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrInstanceSearchHistoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-search-history/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}