import { defHttp } from '@/utils/http/axios';
import { FilePreviewDTO, ResponseEntityListMapstringobject, ResponseEntitystring, ResponseEntityobject } from './model/index';

/**
 * 数据预览
 * import { postFileDataPreview } from "/@/apis/gct-platform/FileUploadController"
 */
export async function postFileDataPreview(data: FilePreviewDTO, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file/data-preview`,
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
 * import { postFileUploadCommon } from "/@/apis/gct-platform/FileUploadController"
 */
export interface postFileUploadCommonQueryInterface {
  appId?: string; // appId
}
export async function postFileUploadCommon(data: any, params: postFileUploadCommonQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file/upload-common`,
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
 * 文件上传minio用作数据集
 * import { postFileUploadDataset } from "/@/apis/gct-platform/FileUploadController"
 */
export async function postFileUploadDataset(data: any, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file/upload-dataset`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}