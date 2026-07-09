import request from '@mobile/utils/request';
import type { ResponseEntityListProcessDefinitionFeignResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 列出所有
 * import { getProcessListAll } from "/@/apis/gct-apaas/ProcessExternalController"
 */
export async function getProcessListAll(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionFeignResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/process/list/all`,
      method: 'get',
      ...config,
    },
  );
}