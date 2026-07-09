import request from '@mobile/utils/request';
import type { FilePreviewDTO, ResponseEntityListMapstringobject, ResponseEntitystring, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 数据预览
 * import { postFileDataPreview } from "/@/apis/gct-platform/FileUploadController"
 */
export async function postFileDataPreview(data: FilePreviewDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/api/file/data-preview`,
      method: 'post',
      data,
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
export async function postFileUploadCommon(data: undefined, params: postFileUploadCommonQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file/upload-common`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 文件上传minio用作数据集
 * import { postFileUploadDataset } from "/@/apis/gct-platform/FileUploadController"
 */
export async function postFileUploadDataset(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/file/upload-dataset`,
      method: 'post',
      data,
      ...config,
    },
  );
}