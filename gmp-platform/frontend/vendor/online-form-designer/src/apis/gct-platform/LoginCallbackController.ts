import { defHttp } from '@/utils/http/axios';
import { RedirectView } from './model/index';

/**
 * 重定向到微软登录页
 * import { getCallbackLoginExternal } from "/@/apis/gct-platform/LoginCallbackController"
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