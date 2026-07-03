import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 解压出pdf
 * import { postMedproFileUnzip } from "/@/apis/gct-apaas/FileController"
 */
export interface postMedproFileUnzipQueryInterface {
  url: string; // url
}
export async function postMedproFileUnzip(params: postMedproFileUnzipQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medpro/file/unzip`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}