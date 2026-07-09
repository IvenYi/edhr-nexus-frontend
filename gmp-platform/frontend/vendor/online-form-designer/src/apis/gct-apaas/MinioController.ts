import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListstring, ResponseEntityint, ResponseEntitystring } from './model/index';

/**
 * PDF文件转图片返回BASE64编码
 * import { postFilePdfEncode } from "/@/apis/gct-apaas/MinioController"
 */
export interface postFilePdfEncodeQueryInterface {
  dpi?: string; // dpi(越高图片越清晰，转换越慢)
  url: string; // pdf相对地址
}
export async function postFilePdfEncode(params: postFilePdfEncodeQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file/pdf/encode`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postFilePdfPage(params: postFilePdfPageQueryInterface = {}, config = {}): Promise<ResponseEntityint['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file/pdf/page`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postFileUploadImage(data: any, params: postFileUploadImageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file/upload/image`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}