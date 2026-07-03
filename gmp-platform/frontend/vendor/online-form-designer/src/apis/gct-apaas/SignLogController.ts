import { defHttp } from '@/utils/http/axios';
import { SignLogRequest, ResponseEntityListUserInfo, ResponseEntityPageBaseSignLogResponse } from './model/index';

/**
 * 操作人
 * import { postSignLogOperators } from "/@/apis/gct-apaas/SignLogController"
 */
export async function postSignLogOperators(data: SignLogRequest, config = {}): Promise<ResponseEntityListUserInfo['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sign-log/operators`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postSignLogPageList } from "/@/apis/gct-apaas/SignLogController"
 */
export async function postSignLogPageList(data: SignLogRequest, config = {}): Promise<ResponseEntityPageBaseSignLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sign-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}