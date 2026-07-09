import { defHttp } from '@/utils/http/axios';
import { OfBaseSubmitRequest, ResponseEntitystring } from './model/index';

/**
 * 提交
 * import { postOnlineFormBaseSubmit } from "/@/apis/gct-apaas/OnlineFormBaseController"
 */
export async function postOnlineFormBaseSubmit(data: OfBaseSubmitRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/base/submit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}