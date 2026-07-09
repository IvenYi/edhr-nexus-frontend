import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * docx转json
 * import { postOfficeDocxJson } from "/@/apis/gct-apaas/OfficeController"
 */
export async function postOfficeDocxJson(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/office/docx-json`,
      method: 'post',
      data,
      ...config,
    },
  );
}