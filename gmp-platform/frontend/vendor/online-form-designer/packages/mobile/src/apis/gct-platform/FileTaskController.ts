import request from '@mobile/utils/request';
import type { FileTaskRequest, ResponseEntitystring, FileTaskBatchDownloadReq, ResponseEntityFileTaskResponse, ResponseEntityListFileTaskResponse, ResponseEntityPageBaseFileTaskResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postFileTask } from "/@/apis/gct-platform/FileTaskController"
 */
export async function postFileTask(data: FileTaskRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteFileTask } from "/@/apis/gct-platform/FileTaskController"
 */
export interface deleteFileTaskQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFileTask(params: deleteFileTaskQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 批量下载
 * import { postFileTaskBatchDownload } from "/@/apis/gct-platform/FileTaskController"
 */
export async function postFileTaskBatchDownload(data: FileTaskBatchDownloadReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/file-task/batch/download`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getFileTaskInfo } from "/@/apis/gct-platform/FileTaskController"
 */
export interface getFileTaskInfoQueryInterface {
  id: string; // id
}
export async function getFileTaskInfo(params: getFileTaskInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityFileTaskResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getFileTaskList } from "/@/apis/gct-platform/FileTaskController"
 */
export interface getFileTaskListQueryInterface {
  formTaskName?: string; // 单据任务名称
  materialNo?: string; // 批次号
  name?: string; // 文件名称
  relationType?: string; // 文件类型(类型(EDHR/FORM))
  status?: string; // 文件状态(文件生成状态: WAITING/PROCESSING/TIMEOUT/SUCCEED/FAIL)
}
export async function getFileTaskList(params: getFileTaskListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFileTaskResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除数据及minio中的对象
 * import { deleteFileTaskObject } from "/@/apis/gct-platform/FileTaskController"
 */
export interface deleteFileTaskObjectQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFileTaskObject(params: deleteFileTaskObjectQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task/object`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 分页列表
 * import { getFileTaskPageList } from "/@/apis/gct-platform/FileTaskController"
 */
export interface getFileTaskPageListQueryInterface {
  formTaskName?: string; // 单据任务名称
  materialNo?: string; // 批次号
  my?: boolean; // 我的
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  relationType?: string; // 文件类型(类型(EDHR/FORM))
  status?: string; // 文件状态(文件生成状态: WAITING/PROCESSING/TIMEOUT/SUCCEED/FAIL)
}
export async function getFileTaskPageList(params: getFileTaskPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseFileTaskResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putFileTaskById } from "/@/apis/gct-platform/FileTaskController"
 */
export interface putFileTaskByIdPathInterface {
  id: string; // id
}
export async function putFileTaskById(path: putFileTaskByIdPathInterface, data: FileTaskRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file-task/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}