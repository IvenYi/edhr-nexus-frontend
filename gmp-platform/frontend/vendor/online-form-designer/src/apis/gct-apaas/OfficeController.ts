import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * docx转json
 * import { postOfficeDocxJson } from "/@/apis/gct-apaas/OfficeController"
 */
export async function postOfficeDocxJson(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/office/docx-json`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}