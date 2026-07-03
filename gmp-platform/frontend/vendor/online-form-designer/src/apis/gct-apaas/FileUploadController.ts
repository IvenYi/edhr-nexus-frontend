import { defHttp } from '@/utils/http/axios';
import { ResponseEntityExcelValidateResponse } from './model/index';

/**
 * excel上传解析
 * import { postSsUploadExcel } from "/@/apis/gct-apaas/FileUploadController"
 */
export interface postSsUploadExcelQueryInterface {
  headerRowIndex?: number; // headerRowIndex
  saveAttachment?: boolean; // saveAttachment
  startRowIndex?: number; // startRowIndex
}
export async function postSsUploadExcel(data: any, params: postSsUploadExcelQueryInterface = {}, config = {}): Promise<object['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/ss/upload/excel`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * zip上传解析
 * import { postSsUploadZip } from "/@/apis/gct-apaas/FileUploadController"
 */
export async function postSsUploadZip(data: any, config = {}): Promise<ResponseEntityExcelValidateResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/ss/upload/zip`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}