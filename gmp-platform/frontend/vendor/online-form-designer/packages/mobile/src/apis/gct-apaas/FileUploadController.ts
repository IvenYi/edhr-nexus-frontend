import request from '@mobile/utils/request';
import type { ResponseEntityExcelValidateResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * excel上传解析
 * import { postSsUploadExcel } from "/@/apis/gct-apaas/FileUploadController"
 */
export interface postSsUploadExcelQueryInterface {
  headerRowIndex?: number; // headerRowIndex
  saveAttachment?: boolean; // saveAttachment
  startRowIndex?: number; // startRowIndex
}
export async function postSsUploadExcel(data: undefined, params: postSsUploadExcelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/ss/upload/excel`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * zip上传解析
 * import { postSsUploadZip } from "/@/apis/gct-apaas/FileUploadController"
 */
export async function postSsUploadZip(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityExcelValidateResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/ss/upload/zip`,
      method: 'post',
      data,
      ...config,
    },
  );
}