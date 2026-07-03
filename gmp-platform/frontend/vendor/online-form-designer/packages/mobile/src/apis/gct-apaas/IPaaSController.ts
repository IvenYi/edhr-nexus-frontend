import request from '@mobile/utils/request';
import type { WebhookRequest, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 调用webhook
 * import { postIpaasWebhook } from "/@/apis/gct-apaas/IPaaSController"
 */
export async function postIpaasWebhook(data: WebhookRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/ipaas/webhook`,
      method: 'post',
      data,
      ...config,
    },
  );
}