import request from '@mobile/utils/request';
import type { OfBaseSubmitRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 提交
 * import { postOnlineFormBaseSubmit } from "/@/apis/gct-apaas/OnlineFormBaseController"
 */
export async function postOnlineFormBaseSubmit(data: OfBaseSubmitRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/base/submit`,
      method: 'post',
      data,
      ...config,
    },
  );
}