import request from '@mobile/utils/request';
import type { Base64UploadRequest, ResponseEntitystring, FileResource4Req, ResponseEntityListFileResourceResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * base64文件上传minio
 * import { postFileResourceBase64Upload } from "/@/apis/gct-apaas/FileResourceController"
 */
export async function postFileResourceBase64Upload(data: Base64UploadRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-resource/base64Upload`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 批量查询文件信息
 * import { postFileResourceList } from "/@/apis/gct-apaas/FileResourceController"
 */
export async function postFileResourceList(data: FileResource4Req, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFileResourceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-resource/list`,
      method: 'post',
      data,
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
export async function postFileResourceUpload(data: undefined, params: postFileResourceUploadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-resource/upload`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}