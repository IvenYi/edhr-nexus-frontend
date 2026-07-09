import request from '@mobile/utils/request';
import type { OnlineFormStashRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 部分提交（Medpro用）
 * import { postOnlineFormPartialSubmit } from "/@/apis/gct-apaas/OnlineFormStashController"
 */
export async function postOnlineFormPartialSubmit(data: OnlineFormStashRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/partialSubmit`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 在线表单暂存api
 * import { postOnlineFormStash } from "/@/apis/gct-apaas/OnlineFormStashController"
 */
export async function postOnlineFormStash(data: OnlineFormStashRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/stash`,
      method: 'post',
      data,
      ...config,
    },
  );
}