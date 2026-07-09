import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * submit接口
 * import { postOnlineFormBizServiceByModelKeySubmit } from "/@/apis/gct-apaas/OnlineFormBsServiceController"
 */
export interface postOnlineFormBizServiceByModelKeySubmitPathInterface {
  modelKey: string; // modelKey
}
export interface postOnlineFormBizServiceByModelKeySubmitQueryInterface {
  eventKey?: string; // 表单提交绑定的事件KEY(非必填(没绑定事件不需要传)
  onlineFormInstanceId: string; // 在线表单实例ID
}
export async function postOnlineFormBizServiceByModelKeySubmit(path: postOnlineFormBizServiceByModelKeySubmitPathInterface, data: undefined, params: postOnlineFormBizServiceByModelKeySubmitQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/biz-service/${path?.modelKey}/submit`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}