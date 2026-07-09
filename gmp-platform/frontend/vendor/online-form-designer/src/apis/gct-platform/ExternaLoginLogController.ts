import { defHttp } from '@/utils/http/axios';
import { UserLoginLogPageRequest, ResponseEntityPageBaseUserLoginLogDTO } from './model/index';

/**
 * 用户登录日志分页查询
 * import { postLoginLogUserLoginLogPageExternal } from "/@/apis/gct-platform/ExternaLoginLogController"
 */
export async function postLoginLogUserLoginLogPageExternal(data: UserLoginLogPageRequest, config = {}): Promise<ResponseEntityPageBaseUserLoginLogDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/login-log/userLoginLogPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}