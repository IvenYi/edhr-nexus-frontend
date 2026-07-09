import request from '@mobile/utils/request';
import type { FileTaskStatus, ResponseEntitystring, FileTaskInfo } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 根据文件ID查询文件信息
 * import { postFileTaskList } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskList(data: undefined[], config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/file-task/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 更新文件转换状态
 * import { postFileTaskStatus } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskStatus(data: FileTaskStatus, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/file-task/status`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postFileTaskSubmit } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskSubmit(data: FileTaskInfo, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/file-task/submit`,
      method: 'post',
      data,
      ...config,
    },
  );
}