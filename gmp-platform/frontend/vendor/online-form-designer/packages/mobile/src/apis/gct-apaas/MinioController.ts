import request from '@mobile/utils/request';
import type { ResponseEntityListstring, ResponseEntityint, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * PDF文件转图片返回BASE64编码
 * import { postFilePdfEncode } from "/@/apis/gct-apaas/MinioController"
 */
export interface postFilePdfEncodeQueryInterface {
  dpi?: string; // dpi(越高图片越清晰，转换越慢)
  url: string; // pdf相对地址
}
export async function postFilePdfEncode(params: postFilePdfEncodeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file/pdf/encode`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * PDF文件转图片返回BASE64编码
 * import { postFilePdfPage } from "/@/apis/gct-apaas/MinioController"
 */
export interface postFilePdfPageQueryInterface {
  url: string; // pdf相对地址
}
export async function postFilePdfPage(params: postFilePdfPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityint['data']> {
  return request(
    {
      url: `/gct-apaas/api/file/pdf/page`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postFileUploadImage } from "/@/apis/gct-apaas/MinioController"
 */
export interface postFileUploadImageQueryInterface {
  bucket: string; // 桶枚举值,(IMAGE 图片桶,ICON 图标桶)
}
export async function postFileUploadImage(data: undefined, params: postFileUploadImageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file/upload/image`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}