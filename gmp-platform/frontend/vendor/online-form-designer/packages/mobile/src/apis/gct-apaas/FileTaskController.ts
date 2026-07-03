import request from '@mobile/utils/request';
import type { ResponseEntitystring, FileTaskStatus, FileTaskDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 立即开启文件转换任务
 * import { getFileTaskStart } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function getFileTaskStart(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-task/start`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 更新文件转换状态
 * import { postFileTaskStatus } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function postFileTaskStatus(data: FileTaskStatus, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-task/status`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 新增生成PDF任务
 * import { postFileTaskSubmit } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function postFileTaskSubmit(data: FileTaskDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/file-task/submit`,
      method: 'post',
      data,
      ...config,
    },
  );
}