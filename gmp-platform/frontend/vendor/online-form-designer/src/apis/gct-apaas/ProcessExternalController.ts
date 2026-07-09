import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListProcessDefinitionFeignResponse } from './model/index';

/**
 * 列出所有
 * import { getProcessListAllExternal } from "/@/apis/gct-apaas/ProcessExternalController"
 */
export async function getProcessListAllExternal(config = {}): Promise<ResponseEntityListProcessDefinitionFeignResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/process/list/all`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}