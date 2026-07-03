import { defHttp } from '@/utils/http/axios';
import { ResponseEntityAppEditStatusResponse } from './model/index';

/**
 * 查询应用草稿态标志
 * import { getAppStateDraft } from "/@/apis/gct-apaas/AppStateController"
 */
export async function getAppStateDraft(config = {}): Promise<ResponseEntityAppEditStatusResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-state/draft`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}