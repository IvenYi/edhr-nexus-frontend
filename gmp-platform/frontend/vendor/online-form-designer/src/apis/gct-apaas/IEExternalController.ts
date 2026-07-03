import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 下载错误报告
 * import { getIeDataReportExternal } from "/@/apis/gct-apaas/IEExternalController"
 */
export interface getIeDataReportExternalQueryInterface {
  fileId: string; // 文件id
}
export async function getIeDataReportExternal(params: getIeDataReportExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/ie/data/report`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}