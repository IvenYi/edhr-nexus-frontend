import request from '@mobile/utils/request';
import type { UserLoginLogPageRequest, ResponseEntityPageBaseUserLoginLogDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 用户登录日志分页查询
 * import { postLoginLogUserLoginLogPage } from "/@/apis/gct-platform/ExternaLoginLogController"
 */
export async function postLoginLogUserLoginLogPage(data: UserLoginLogPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserLoginLogDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/login-log/userLoginLogPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}