import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

/**
 * post通用接口
 * import { postSqlViewBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/SqlViewModelBsServiceController"
 */
export interface postSqlViewBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postSqlViewBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postSqlViewBizServiceByModelKeyByBsKey(path: postSqlViewBizServiceByModelKeyByBsKeyPathInterface, data: any, params: postSqlViewBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sql-view/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}