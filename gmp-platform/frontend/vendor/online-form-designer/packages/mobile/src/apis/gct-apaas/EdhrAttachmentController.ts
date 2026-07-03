import request from '@mobile/utils/request';
import type { ResponseEntityListOnlineFormInstance } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取Edhr附录接口
 * import { getMedproEdhrAttachmentGetEdhrAttachment } from "/@/apis/gct-apaas/EdhrAttachmentController"
 */
export interface getMedproEdhrAttachmentGetEdhrAttachmentQueryInterface {
  materialNo: string; // materialNo
}
export async function getMedproEdhrAttachmentGetEdhrAttachment(params: getMedproEdhrAttachmentGetEdhrAttachmentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormInstance['data']> {
  return request(
    {
      url: `/gct-apaas/api/medpro/edhrAttachment/getEdhrAttachment`,
      method: 'get',
      params,
      ...config,
    },
  );
}