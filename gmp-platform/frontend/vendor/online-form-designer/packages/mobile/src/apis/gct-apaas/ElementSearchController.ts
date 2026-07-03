import request from '@mobile/utils/request';
import type { ResponseEntityListElementInfoResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 按key搜索
 * import { getEleSearchSearchByKey } from "/@/apis/gct-apaas/ElementSearchController"
 */
export interface getEleSearchSearchByKeyQueryInterface {
  key?: string; // 搜索关键词
}
export async function getEleSearchSearchByKey(params: getEleSearchSearchByKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListElementInfoResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/ele-search/searchByKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}