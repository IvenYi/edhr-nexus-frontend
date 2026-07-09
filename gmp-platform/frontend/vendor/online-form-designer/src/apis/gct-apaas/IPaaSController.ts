import { defHttp } from '@/utils/http/axios';
import { WebhookRequest, ResponseEntityobject } from './model/index';

/**
 * 调用webhook
 * import { postIpaasWebhook } from "/@/apis/gct-apaas/IPaaSController"
 */
export async function postIpaasWebhook(data: WebhookRequest, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/ipaas/webhook`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}