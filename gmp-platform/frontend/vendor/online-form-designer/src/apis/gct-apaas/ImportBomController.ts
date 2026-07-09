import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 导入 bom
 * import { postBomImport } from "/@/apis/gct-apaas/ImportBomController"
 */
export async function postBomImport(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/bom/import`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}