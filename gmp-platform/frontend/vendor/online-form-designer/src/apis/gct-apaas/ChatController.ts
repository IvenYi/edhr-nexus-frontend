import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

/**
 * 导入excel
 * import { postChatImportExcel } from "/@/apis/gct-apaas/ChatController"
 */
export interface postChatImportExcelQueryInterface {
  message: string; // message
  modelKey: string; // modelKey
}
export async function postChatImportExcel(data: any, params: postChatImportExcelQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/chat/importExcel`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}