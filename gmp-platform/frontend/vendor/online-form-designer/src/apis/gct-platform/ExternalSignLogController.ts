import { defHttp } from '@/utils/http/axios';
import { SignLogRequest, ResponseEntityListUserInfo, ResponseEntityPageBaseSignLogResponse } from './model/index';

/**
 * 操作人
 * import { postSignLogOperatorsExternal } from "/@/apis/gct-platform/ExternalSignLogController"
 */
export async function postSignLogOperatorsExternal(data: SignLogRequest, config = {}): Promise<ResponseEntityListUserInfo['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/signLog/operators`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { postSignLogPageListExternal } from "/@/apis/gct-platform/ExternalSignLogController"
 */
export async function postSignLogPageListExternal(data: SignLogRequest, config = {}): Promise<ResponseEntityPageBaseSignLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/signLog/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}