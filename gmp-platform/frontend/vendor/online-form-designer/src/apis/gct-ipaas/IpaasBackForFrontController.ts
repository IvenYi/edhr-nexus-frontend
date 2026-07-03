import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * 获取连接流信息
 * import { getBffFlowByFuuid } from "/@/apis/gct-ipaas/IpaasBackForFrontController"
 */
export interface getBffFlowByFuuidPathInterface {
  fuuid: string; // ...
}
export async function getBffFlowByFuuid(path: getBffFlowByFuuidPathInterface, config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/bff/flow/${path?.fuuid}`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}