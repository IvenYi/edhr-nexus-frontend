import request from '@mobile/utils/request';
import type { RedirectView, ResponseEntityThirdPartyLoginConfig } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 重定向到微软登录页
 * import { getCallbackLogin } from "/@/apis/gct-platform/LoginSettingController"
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

/**
 * 重定向到微软登录页
 * import { getLoginSettingGet } from "/@/apis/gct-platform/LoginSettingController"
 */
export interface getLoginSettingGetQueryInterface {
  code: string; // code
}
export async function getLoginSettingGet(params: getLoginSettingGetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityThirdPartyLoginConfig['data']> {
  return request(
    {
      url: `/gct-platform/external/api/login/setting/get`,
      method: 'get',
      params,
      ...config,
    },
  );
}