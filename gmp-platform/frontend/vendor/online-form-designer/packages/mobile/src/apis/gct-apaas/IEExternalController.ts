import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 下载错误报告
 * import { getIeDataReport } from "/@/apis/gct-apaas/IEExternalController"
 */
export interface getIeDataReportQueryInterface {
  fileId: string; // 文件id
}
export async function getIeDataReport(params: getIeDataReportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/ie/data/report`,
      method: 'get',
      params,
      ...config,
    },
  );
}