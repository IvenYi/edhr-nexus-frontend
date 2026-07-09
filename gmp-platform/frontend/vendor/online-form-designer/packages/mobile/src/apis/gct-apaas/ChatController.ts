import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导入excel
 * import { postChatImportExcel } from "/@/apis/gct-apaas/ChatController"
 */
export interface postChatImportExcelQueryInterface {
  message: string; // message
  modelKey: string; // modelKey
}
export async function postChatImportExcel(params: postChatImportExcelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/chat/importExcel`,
      method: 'post',
      params,
      ...config,
    },
  );
}