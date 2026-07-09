import { defHttp } from '@/utils/http/axios';
import { RedirectView, ResponseEntityThirdPartyLoginConfig } from './model/index';

/**
 * 重定向到微软登录页
 * import { getCallbackLoginExternal } from "/@/apis/gct-platform/LoginSettingController"
 */
export async function getCallbackLoginExternal(config = {}): Promise<RedirectView['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/callback/login`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重定向到微软登录页
 * import { getLoginSettingGetExternal } from "/@/apis/gct-platform/LoginSettingController"
 */
export interface getLoginSettingGetExternalQueryInterface {
  code: string; // code
}
export async function getLoginSettingGetExternal(params: getLoginSettingGetExternalQueryInterface = {}, config = {}): Promise<ResponseEntityThirdPartyLoginConfig['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/login/setting/get`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}