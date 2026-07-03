import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * BI中附件上传
 * import { postBiFileUpload } from "/@/apis/gct-platform/PnFileUploadController"
 */
export interface postBiFileUploadQueryInterface {
  appId: string; // appId
  projectId: string; // projectId
}
export async function postBiFileUpload(data: any, params: postBiFileUploadQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/bi-file/upload`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}