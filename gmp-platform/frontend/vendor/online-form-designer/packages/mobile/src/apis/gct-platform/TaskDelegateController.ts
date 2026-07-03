import request from '@mobile/utils/request';
import type { TaskDelegateRequest, ResponseEntitystring, ResponseEntityTaskDelegateResponse, ResponseEntityListTaskDelegateResponse, ResponseEntityPageBaseTaskDelegateResponse, ResponseEntityListAppProcess } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTaskDelegate } from "/@/apis/gct-platform/TaskDelegateController"
 */
export async function postTaskDelegate(data: TaskDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTaskDelegate } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface deleteTaskDelegateQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskDelegate(params: deleteTaskDelegateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 取消
 * import { postTaskDelegateCancelById } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface postTaskDelegateCancelByIdPathInterface {
  id: string; // id
}
export async function postTaskDelegateCancelById(path: postTaskDelegateCancelByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/cancel/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTaskDelegateInfo } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface getTaskDelegateInfoQueryInterface {
  id: string; // id
}
export async function getTaskDelegateInfo(params: getTaskDelegateInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTaskDelegateList } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface getTaskDelegateListQueryInterface {
  valid?: boolean; // valid
}
export async function getTaskDelegateList(params: getTaskDelegateListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTaskDelegatePageList } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface getTaskDelegatePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  valid?: boolean; // valid
}
export async function getTaskDelegatePageList(params: getTaskDelegatePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTaskDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getTaskDelegateProcess } from "/@/apis/gct-platform/TaskDelegateController"
 */
export async function getTaskDelegateProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/process`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTaskDelegateById } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface putTaskDelegateByIdPathInterface {
  id: string; // id
}
export async function putTaskDelegateById(path: putTaskDelegateByIdPathInterface, data: TaskDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-delegate/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}