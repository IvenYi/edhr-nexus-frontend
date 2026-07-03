import request from '@mobile/utils/request';
import type { LicenseUnbindLogRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postLicenseUnbindLog } from "/@/apis/gct-platform/LicenseUnbindLogController"
 */
export async function postLicenseUnbindLog(data: LicenseUnbindLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/license-unbind-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}