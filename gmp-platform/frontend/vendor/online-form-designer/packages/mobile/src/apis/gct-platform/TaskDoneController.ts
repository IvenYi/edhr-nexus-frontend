import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityTaskDoneResponse, ResponseEntityPageBaseTaskDoneResponse, ResponseEntityListAppProcess } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteTaskDone } from "/@/apis/gct-platform/TaskDoneController"
 */
export interface deleteTaskDoneQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskDone(params: deleteTaskDoneQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-done`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTaskDoneInfo } from "/@/apis/gct-platform/TaskDoneController"
 */
export interface getTaskDoneInfoQueryInterface {
  id: string; // id
}
export async function getTaskDoneInfo(params: getTaskDoneInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskDoneResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-done/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTaskDonePageList } from "/@/apis/gct-platform/TaskDoneController"
 */
export interface getTaskDonePageListQueryInterface {
  finished?: boolean; // 已完成
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
}
export async function getTaskDonePageList(params: getTaskDonePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTaskDoneResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-done/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getTaskDoneProcess } from "/@/apis/gct-platform/TaskDoneController"
 */
export async function getTaskDoneProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/task-done/process`,
      method: 'get',
      ...config,
    },
  );
}