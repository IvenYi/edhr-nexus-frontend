import { defHttp } from '@/utils/http/axios';
import { Base64UploadRequest, ResponseEntitystring, FileResource4Req, ResponseEntityListFileResourceResponse } from './model/index';

/**
 * base64文件上传minio
 * import { postFileResourceBase64Upload } from "/@/apis/gct-apaas/FileResourceController"
 */
export async function postFileResourceBase64Upload(data: Base64UploadRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file-resource/base64Upload`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量查询文件信息
 * import { postFileResourceList } from "/@/apis/gct-apaas/FileResourceController"
 */
export async function postFileResourceList(data: FileResource4Req, config = {}): Promise<ResponseEntityListFileResourceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file-resource/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postFileResourceUpload } from "/@/apis/gct-apaas/FileResourceController"
 */
export interface postFileResourceUploadQueryInterface {
  modelKey?: string; // 模型key
  type?: string; // 资源分类枚举 LABEL_IMAGE:标签图片/MODEL_EXCEL:模型导入模板
}
export async function postFileResourceUpload(data: any, params: postFileResourceUploadQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file-resource/upload`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}