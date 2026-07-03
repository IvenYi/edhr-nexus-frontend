import request from '@mobile/utils/request';
import type { Base64UploadPlatFormRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * base64文件上传minio
 * import { postMinioFileBase64Upload } from "/@/apis/gct-platform/FileController"
 */
export async function postMinioFileBase64Upload(data: Base64UploadPlatFormRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/minio-file/base64Upload`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * minIO获取文件公用接口
 * import { getMinioFileDownload } from "/@/apis/gct-platform/FileController"
 */
export interface getMinioFileDownloadQueryInterface {
  fileUrl: string; // fileUrl
}
export async function getMinioFileDownload(params: getMinioFileDownloadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/minio-file/download`,
      method: 'get',
      params,
      ...config,
    },
  );
}