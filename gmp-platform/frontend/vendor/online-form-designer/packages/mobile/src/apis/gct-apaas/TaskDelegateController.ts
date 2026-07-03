import request from '@mobile/utils/request';
import type { TaskDelegateRequest, ResponseEntitystring, ResponseEntityTaskDelegateResponse, ResponseEntityListTaskDelegateResponse, ResponseEntityPageBaseTaskDelegateResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTaskDelegate } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export async function postTaskDelegate(data: TaskDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTaskDelegate } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export interface deleteTaskDelegateQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskDelegate(params: deleteTaskDelegateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTaskDelegateInfo } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export interface getTaskDelegateInfoQueryInterface {
  id: string; // id
}
export async function getTaskDelegateInfo(params: getTaskDelegateInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTaskDelegateList } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export interface getTaskDelegateListQueryInterface {
  valid?: boolean; // valid
}
export async function getTaskDelegateList(params: getTaskDelegateListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTaskDelegatePageList } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export interface getTaskDelegatePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  valid?: boolean; // valid
}
export async function getTaskDelegatePageList(params: getTaskDelegatePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTaskDelegateById } from "/@/apis/gct-apaas/TaskDelegateController"
 */
export interface putTaskDelegateByIdPathInterface {
  id: string; // id
}
export async function putTaskDelegateById(path: putTaskDelegateByIdPathInterface, data: TaskDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/task-delegate/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}