import request from '@mobile/utils/request';
import type { ResponseEntityAppEffectiveLicense, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取应用有效授权
 * import { getLicenseGetAppEffectiveLicense } from "/@/apis/gct-platform/ExternalLicenseController"
 */
export interface getLicenseGetAppEffectiveLicenseQueryInterface {
  appId: string; // 应用id
  env: string; // 环境
}
export async function getLicenseGetAppEffectiveLicense(params: getLicenseGetAppEffectiveLicenseQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppEffectiveLicense['data']> {
  return request(
    {
      url: `/gct-platform/external/api/license/getAppEffectiveLicense`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 判断对应模块是否已进行授权
 * import { getLicenseModuleAuth } from "/@/apis/gct-platform/ExternalLicenseController"
 */
export interface getLicenseModuleAuthQueryInterface {
  module?: string; // 授权模块
}
export async function getLicenseModuleAuth(params: getLicenseModuleAuthQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/external/api/license/moduleAuth`,
      method: 'get',
      params,
      ...config,
    },
  );
}