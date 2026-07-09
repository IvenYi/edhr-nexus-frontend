import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 应用下所有子模型增加sortNum字段
 * import { postSubModelProcessAllSubModelDataClean } from "/@/apis/gct-apaas/SubModelProcessController"
 */
export async function postSubModelProcessAllSubModelDataClean(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sub-model-process/allSubModelDataClean`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}