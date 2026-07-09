import { defHttp } from '@/utils/http/axios';
import { FileTaskRequest, ResponseEntitystring, FileTaskBatchDownloadReq, ResponseEntityFileTaskResponse, ResponseEntityListFileTaskResponse, ResponseEntityPageBaseFileTaskResponse } from './model/index';

/**
 * 保存
 * import { postFileTask } from "/@/apis/gct-platform/FileTaskController"
 */
export async function postFileTask(data: FileTaskRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file-task`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteFileTask(params: deleteFileTaskQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/file-task`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 批量下载
 * import { postFileTaskBatchDownload } from "/@/apis/gct-platform/FileTaskController"
 */
export async function postFileTaskBatchDownload(data: FileTaskBatchDownloadReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file-task/batch/download`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getFileTaskInfo(params: getFileTaskInfoQueryInterface = {}, config = {}): Promise<ResponseEntityFileTaskResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/file-task/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getFileTaskList(params: getFileTaskListQueryInterface = {}, config = {}): Promise<ResponseEntityListFileTaskResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/file-task/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteFileTaskObject(params: deleteFileTaskObjectQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/file-task/object`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getFileTaskPageList(params: getFileTaskPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFileTaskResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/file-task/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putFileTaskById(path: putFileTaskByIdPathInterface, data: FileTaskRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/file-task/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}