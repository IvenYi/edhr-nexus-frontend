import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

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
export async function postSqlViewBizServiceByModelKeyByBsKey(path: postSqlViewBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: postSqlViewBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}