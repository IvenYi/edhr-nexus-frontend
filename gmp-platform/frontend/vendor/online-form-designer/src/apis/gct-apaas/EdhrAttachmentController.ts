import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListOnlineFormInstance } from './model/index';

/**
 * 获取Edhr附录接口
 * import { getMedproEdhrAttachmentGetEdhrAttachment } from "/@/apis/gct-apaas/EdhrAttachmentController"
 */
export interface getMedproEdhrAttachmentGetEdhrAttachmentQueryInterface {
  materialNo: string; // materialNo
}
export async function getMedproEdhrAttachmentGetEdhrAttachment(params: getMedproEdhrAttachmentGetEdhrAttachmentQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstance['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/medpro/edhrAttachment/getEdhrAttachment`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}