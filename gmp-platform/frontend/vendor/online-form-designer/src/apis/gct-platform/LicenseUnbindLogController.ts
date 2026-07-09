import { defHttp } from '@/utils/http/axios';
import { LicenseUnbindLogRequest, ResponseEntitystring } from './model/index';

/**
 * 保存
 * import { postLicenseUnbindLog } from "/@/apis/gct-platform/LicenseUnbindLogController"
 */
export async function postLicenseUnbindLog(data: LicenseUnbindLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/license-unbind-log`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}