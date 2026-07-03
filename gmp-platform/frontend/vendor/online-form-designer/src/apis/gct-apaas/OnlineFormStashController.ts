import { defHttp } from '@/utils/http/axios';
import { OnlineFormStashRequest, ResponseEntitystring } from './model/index';

/**
 * 部分提交（Medpro用）
 * import { postOnlineFormPartialSubmit } from "/@/apis/gct-apaas/OnlineFormStashController"
 */
export async function postOnlineFormPartialSubmit(data: OnlineFormStashRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/partialSubmit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 在线表单暂存api
 * import { postOnlineFormStash } from "/@/apis/gct-apaas/OnlineFormStashController"
 */
export async function postOnlineFormStash(data: OnlineFormStashRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/stash`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}