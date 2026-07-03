import { defHttp } from '@/utils/http/axios';
import { ResponseEntityAppEffectiveLicense, ResponseEntityboolean } from './model/index';

/**
 * 获取应用有效授权
 * import { getLicenseGetAppEffectiveLicenseExternal } from "/@/apis/gct-platform/ExternalLicenseController"
 */
export interface getLicenseGetAppEffectiveLicenseExternalQueryInterface {
  appId: string; // 应用id
  env: string; // 环境
}
export async function getLicenseGetAppEffectiveLicenseExternal(params: getLicenseGetAppEffectiveLicenseExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAppEffectiveLicense['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/license/getAppEffectiveLicense`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 判断对应模块是否已进行授权
 * import { getLicenseModuleAuthExternal } from "/@/apis/gct-platform/ExternalLicenseController"
 */
export interface getLicenseModuleAuthExternalQueryInterface {
  module?: string; // 授权模块
}
export async function getLicenseModuleAuthExternal(params: getLicenseModuleAuthExternalQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/license/moduleAuth`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}