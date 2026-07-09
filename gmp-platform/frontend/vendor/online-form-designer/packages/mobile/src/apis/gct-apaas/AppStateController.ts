import request from '@mobile/utils/request';
import type { ResponseEntityAppEditStatusResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询应用草稿态标志
 * import { getAppStateDraft } from "/@/apis/gct-apaas/AppStateController"
 */
export async function getAppStateDraft(config:AxiosRequestConfig = {}): Promise<ResponseEntityAppEditStatusResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-state/draft`,
      method: 'get',
      ...config,
    },
  );
}