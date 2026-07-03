import { defHttp } from '@/utils/http/axios';
import { Base64UploadPlatFormRequest, ResponseEntitystring } from './model/index';

/**
 * base64文件上传minio
 * import { postMinioFileBase64Upload } from "/@/apis/gct-platform/FileController"
 */
export async function postMinioFileBase64Upload(data: Base64UploadPlatFormRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/minio-file/base64Upload`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getMinioFileDownload(params: getMinioFileDownloadQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/api/minio-file/download`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}