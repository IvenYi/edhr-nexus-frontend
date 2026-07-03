import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListElementInfoResponse } from './model/index';

/**
 * 按key搜索
 * import { getEleSearchSearchByKey } from "/@/apis/gct-apaas/ElementSearchController"
 */
export interface getEleSearchSearchByKeyQueryInterface {
  key?: string; // 搜索关键词
}
export async function getEleSearchSearchByKey(params: getEleSearchSearchByKeyQueryInterface = {}, config = {}): Promise<ResponseEntityListElementInfoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/ele-search/searchByKey`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}