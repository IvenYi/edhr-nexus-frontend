import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * BI中附件上传
 * import { postBiFileUpload } from "/@/apis/gct-platform/PnFileUploadController"
 */
export interface postBiFileUploadQueryInterface {
  appId: string; // appId
  projectId: string; // projectId
}
export async function postBiFileUpload(data: undefined, params: postBiFileUploadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-file/upload`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}