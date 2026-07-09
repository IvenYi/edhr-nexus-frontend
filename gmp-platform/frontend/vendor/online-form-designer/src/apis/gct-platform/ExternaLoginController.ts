import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * 泛微OA认证地址
 * import { getLoginSsoOauth2AuthorizeExternal } from "/@/apis/gct-platform/ExternaLoginController"
 */
export interface getLoginSsoOauth2AuthorizeExternalQueryInterface {
  code?: string; // 授权码
}
export async function getLoginSsoOauth2AuthorizeExternal(params: getLoginSsoOauth2AuthorizeExternalQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/login/sso/oauth2/authorize`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 调试用重定向地址
 * import { getLoginSsoOauth2DebugExternal } from "/@/apis/gct-platform/ExternaLoginController"
 */
export async function getLoginSsoOauth2DebugExternal(config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/login/sso/oauth2/debug`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}