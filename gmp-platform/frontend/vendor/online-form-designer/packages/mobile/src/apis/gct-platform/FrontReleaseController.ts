import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 清空缓存
 * import { getFrontReleaseCleanCache } from "/@/apis/gct-platform/FrontReleaseController"
 */
export async function getFrontReleaseCleanCache(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/front-release/cleanCache`,
      method: 'get',
      ...config,
    },
  );
}