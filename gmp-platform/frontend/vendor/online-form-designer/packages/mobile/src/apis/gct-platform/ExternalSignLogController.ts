import request from '@mobile/utils/request';
import type { SignLogRequest, ResponseEntityListUserInfo, ResponseEntityPageBaseSignLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 操作人
 * import { postSignLogOperators } from "/@/apis/gct-platform/ExternalSignLogController"
 */
export async function postSignLogOperators(data: SignLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserInfo['data']> {
  return request(
    {
      url: `/gct-platform/external/api/signLog/operators`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 列表
 * import { postSignLogPageList } from "/@/apis/gct-platform/ExternalSignLogController"
 */
export async function postSignLogPageList(data: SignLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSignLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/signLog/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}