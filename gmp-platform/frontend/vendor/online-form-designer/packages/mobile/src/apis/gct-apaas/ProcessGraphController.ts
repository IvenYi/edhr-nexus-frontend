import request from '@mobile/utils/request';
import type { ResponseEntityListProcessGraphResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 流程图节点详情
 * import { getProcessGraphGraphInfo } from "/@/apis/gct-apaas/ProcessGraphController"
 */
export interface getProcessGraphGraphInfoQueryInterface {
  procInstanceId: string; // procInstanceId
}
export async function getProcessGraphGraphInfo(params: getProcessGraphGraphInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessGraphResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-graph/graphInfo`,
      method: 'get',
      params,
      ...config,
    },
  );
}