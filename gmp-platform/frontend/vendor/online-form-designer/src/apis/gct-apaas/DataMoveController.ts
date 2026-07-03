import { defHttp } from '@/utils/http/axios';
import { DatasourceMove, ResponseEntitystring } from './model/index';

/**
 * 数据迁移
 * import { postDatamoveExecuteExternal } from "/@/apis/gct-apaas/DataMoveController"
 */
export async function postDatamoveExecuteExternal(data: DatasourceMove, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/datamove/execute`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}