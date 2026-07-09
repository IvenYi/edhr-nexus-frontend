import { defHttp } from '@/utils/http/axios';
import { UserLoginLogPageRequest, ResponseEntityPageBaseUserLoginLogDTO } from './model/index';

/**
 * 用户登录日志分页查询
 * import { postLoginLogUserLoginLogPage } from "/@/apis/gct-apaas/LoginLogController"
 */
export async function postLoginLogUserLoginLogPage(data: UserLoginLogPageRequest, config = {}): Promise<ResponseEntityPageBaseUserLoginLogDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/login-log/userLoginLogPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}