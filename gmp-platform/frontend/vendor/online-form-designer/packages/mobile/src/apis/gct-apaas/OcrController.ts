import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 转发所有POST请求
 * import { postOcr** } from "/@/apis/gct-apaas/OcrController"
 */
export async function postOcr**(config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/ocr/**`,
      method: 'post',
      ...config,
    },
  );
}