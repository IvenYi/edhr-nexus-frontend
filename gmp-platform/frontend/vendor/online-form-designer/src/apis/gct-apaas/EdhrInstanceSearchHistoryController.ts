import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityListEdhrInstanceSearchHistoryResponse } from './model/index';

/**
 * 删除
 * import { deleteEdhrInstanceSearchHistory } from "/@/apis/gct-apaas/EdhrInstanceSearchHistoryController"
 */
export interface deleteEdhrInstanceSearchHistoryQueryInterface {
  id: string; // id
}
export async function deleteEdhrInstanceSearchHistory(params: deleteEdhrInstanceSearchHistoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-instance-search-history`,
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
 * 列表
 * import { getEdhrInstanceSearchHistoryList } from "/@/apis/gct-apaas/EdhrInstanceSearchHistoryController"
 */
export interface getEdhrInstanceSearchHistoryListQueryInterface {
  materialNo?: string; // 物料号
}
export async function getEdhrInstanceSearchHistoryList(params: getEdhrInstanceSearchHistoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListEdhrInstanceSearchHistoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-instance-search-history/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}