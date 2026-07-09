import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 解压出pdf
 * import { postMedproFileUnzip } from "/@/apis/gct-apaas/FileController"
 */
export interface postMedproFileUnzipQueryInterface {
  url: string; // url
}
export async function postMedproFileUnzip(params: postMedproFileUnzipQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/file/unzip`,
      method: 'post',
      params,
      ...config,
    },
  );
}