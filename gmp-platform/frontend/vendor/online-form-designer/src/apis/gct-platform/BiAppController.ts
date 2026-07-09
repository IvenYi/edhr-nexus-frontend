import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * 导出
 * import { getBiAppExportByAppidByTenantId } from "/@/apis/gct-platform/BiAppController"
 */
export interface getBiAppExportByAppidByTenantIdPathInterface {
  appid: string; // app id
  tenantId: string; // tenantId
}
export async function getBiAppExportByAppidByTenantId(path: getBiAppExportByAppidByTenantIdPathInterface, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/api/bi-app/export/${path?.appid}/${path?.tenantId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}