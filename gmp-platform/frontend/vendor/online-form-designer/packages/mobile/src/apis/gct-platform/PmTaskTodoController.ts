import request from '@mobile/utils/request';
import type { PmTaskTodoRequest, ResponseEntitystring, ResponseEntityPmTaskTodoResponse, ResponseEntityListPmTaskTodoResponse, ResponseEntityPageBasePmTaskTodoResponse, ResponseEntityListAppProcess, ResponseEntityTaskTodoResponse, ResponseEntityPageBaseTaskTodoResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmTaskTodo } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export async function postPmTaskTodo(data: PmTaskTodoRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmTaskTodo } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface deletePmTaskTodoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmTaskTodo(params: deletePmTaskTodoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPmTaskTodoInfo } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface getPmTaskTodoInfoQueryInterface {
  id: string; // id
}
export async function getPmTaskTodoInfo(params: getPmTaskTodoInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmTaskTodoList } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export async function getPmTaskTodoList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPmTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmTaskTodoPageList } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface getPmTaskTodoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
}
export async function getPmTaskTodoPageList(params: getPmTaskTodoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getPmTaskTodoProcess } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export async function getPmTaskTodoProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo/process`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmTaskTodoById } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface putPmTaskTodoByIdPathInterface {
  id: string; // id
}
export async function putPmTaskTodoById(path: putPmTaskTodoByIdPathInterface, data: PmTaskTodoRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-todo/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTaskTodo } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface deleteTaskTodoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskTodo(params: deleteTaskTodoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/task-todo`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTaskTodoInfo } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface getTaskTodoInfoQueryInterface {
  id: string; // id
}
export async function getTaskTodoInfo(params: getTaskTodoInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-todo/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTaskTodoPageList } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export interface getTaskTodoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
}
export async function getTaskTodoPageList(params: getTaskTodoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTaskTodoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/task-todo/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getTaskTodoProcess } from "/@/apis/gct-platform/PmTaskTodoController"
 */
export async function getTaskTodoProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/task-todo/process`,
      method: 'get',
      ...config,
    },
  );
}