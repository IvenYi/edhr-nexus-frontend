import request from '@mobile/utils/request';
import type { OnlineFormBizRequest, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 业务服务汇总-支持SQL视图模型、自定义模型、基础模型、视图模型
 * import { postOnlineFormBizBizServiceSummary } from "/@/apis/gct-apaas/OnlineFormBizController"
 */
export async function postOnlineFormBizBizServiceSummary(data: OnlineFormBizRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/biz/bizServiceSummary`,
      method: 'post',
      data,
      ...config,
    },
  );
}