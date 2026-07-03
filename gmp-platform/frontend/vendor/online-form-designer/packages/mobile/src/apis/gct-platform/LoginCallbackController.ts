import request from '@mobile/utils/request';
import type { RedirectView } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 重定向到微软登录页
 * import { getCallbackLogin } from "/@/apis/gct-platform/LoginCallbackController"
 */
export async function getCallbackLogin(config:AxiosRequestConfig = {}): Promise<RedirectView['data']> {
  return request(
    {
      url: `/gct-platform/external/api/callback/login`,
      method: 'get',
      ...config,
    },
  );
}