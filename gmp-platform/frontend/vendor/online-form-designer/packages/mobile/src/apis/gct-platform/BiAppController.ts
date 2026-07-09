import request from '@mobile/utils/request';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导出
 * import { getBiAppExportByAppidByTenantId } from "/@/apis/gct-platform/BiAppController"
 */
export interface getBiAppExportByAppidByTenantIdPathInterface {
  appid: string; // app id
  tenantId: string; // tenantId
}
export async function getBiAppExportByAppidByTenantId(path: getBiAppExportByAppidByTenantIdPathInterface, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/bi-app/export/${path?.appid}/${path?.tenantId}`,
      method: 'get',
      ...config,
    },
  );
}