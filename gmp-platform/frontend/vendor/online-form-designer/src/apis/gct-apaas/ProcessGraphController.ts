import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListProcessGraphResponse } from './model/index';

/**
 * 流程图节点详情
 * import { getProcessGraphGraphInfo } from "/@/apis/gct-apaas/ProcessGraphController"
 */
export interface getProcessGraphGraphInfoQueryInterface {
  procInstanceId: string; // procInstanceId
}
export async function getProcessGraphGraphInfo(params: getProcessGraphGraphInfoQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessGraphResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-graph/graphInfo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}