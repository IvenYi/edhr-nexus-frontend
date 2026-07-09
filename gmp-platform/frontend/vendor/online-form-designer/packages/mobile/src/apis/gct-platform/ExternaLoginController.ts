import request from '@mobile/utils/request';

import type { AxiosRequestConfig } from 'axios';

/**
 * 泛微OA认证地址
 * import { getLoginSsoOauth2Authorize } from "/@/apis/gct-platform/ExternaLoginController"
 */
export interface getLoginSsoOauth2AuthorizeQueryInterface {
  code?: string; // 授权码
}
export async function getLoginSsoOauth2Authorize(params: getLoginSsoOauth2AuthorizeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/login/sso/oauth2/authorize`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 调试用重定向地址
 * import { getLoginSsoOauth2Debug } from "/@/apis/gct-platform/ExternaLoginController"
 */
export async function getLoginSsoOauth2Debug(config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/login/sso/oauth2/debug`,
      method: 'get',
      ...config,
    },
  );
}