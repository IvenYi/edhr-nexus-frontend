import { defHttp } from '@/utils/http/axios';
import { PmTaskTodoRequest, ResponseEntitystring, ResponseEntityPmTaskTodoResponse, ResponseEntityListPmTaskTodoResponse, ResponseEntityPageBasePmTaskTodoResponse, ResponseEntityListAppProcess, ResponseEntityTaskTodoResponse, ResponseEntityPageBaseTaskTodoResponse } from './model/index';

/**
 * 保存
 * import { postPmTaskTodo } from "/@/apis/gct-platform/TaskTodoController"
 */
export async function postPmTaskTodo(data: PmTaskTodoRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pm-task-todo`,
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
 * import { deletePmTaskTodo } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface deletePmTaskTodoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmTaskTodo(params: deletePmTaskTodoQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pm-task-todo`,
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
 * 详情
 * import { getPmTaskTodoInfo } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface getPmTaskTodoInfoQueryInterface {
  id: string; // id
}
export async function getPmTaskTodoInfo(params: getPmTaskTodoInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-todo/info`,
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
 * import { getPmTaskTodoList } from "/@/apis/gct-platform/TaskTodoController"
 */
export async function getPmTaskTodoList(config = {}): Promise<ResponseEntityListPmTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-todo/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmTaskTodoPageList } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface getPmTaskTodoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
}
export async function getPmTaskTodoPageList(params: getPmTaskTodoPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-todo/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getPmTaskTodoProcess } from "/@/apis/gct-platform/TaskTodoController"
 */
export async function getPmTaskTodoProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-todo/process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmTaskTodoById } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface putPmTaskTodoByIdPathInterface {
  id: string; // id
}
export async function putPmTaskTodoById(path: putPmTaskTodoByIdPathInterface, data: PmTaskTodoRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pm-task-todo/${path?.id}`,
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
 * import { deleteTaskTodo } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface deleteTaskTodoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskTodo(params: deleteTaskTodoQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/task-todo`,
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
 * 详情
 * import { getTaskTodoInfo } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface getTaskTodoInfoQueryInterface {
  id: string; // id
}
export async function getTaskTodoInfo(params: getTaskTodoInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-todo/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTaskTodoPageList } from "/@/apis/gct-platform/TaskTodoController"
 */
export interface getTaskTodoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
}
export async function getTaskTodoPageList(params: getTaskTodoPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTaskTodoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-todo/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getTaskTodoProcess } from "/@/apis/gct-platform/TaskTodoController"
 */
export async function getTaskTodoProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-todo/process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}