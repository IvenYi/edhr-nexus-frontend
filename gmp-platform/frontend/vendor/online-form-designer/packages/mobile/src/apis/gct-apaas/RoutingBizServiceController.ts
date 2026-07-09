import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存或更新api接口
 * import { postBizServiceBusByModelKeySave } from "/@/apis/gct-apaas/RoutingBizServiceController"
 */
export interface postBizServiceBusByModelKeySavePathInterface {
  modelKey: string; // modelKey
}
export interface postBizServiceBusByModelKeySaveQueryInterface {
  requestParam: any; // requestParam
}
export async function postBizServiceBusByModelKeySave(path: postBizServiceBusByModelKeySavePathInterface, data: undefined, params: postBizServiceBusByModelKeySaveQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/bus/${path?.modelKey}/save`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}