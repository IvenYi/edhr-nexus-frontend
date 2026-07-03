import { defHttp } from '@/utils/http/axios';
import { TaskDelegateRequest, ResponseEntitystring, ResponseEntityTaskDelegateResponse, ResponseEntityListTaskDelegateResponse, ResponseEntityPageBaseTaskDelegateResponse, ResponseEntityListAppProcess } from './model/index';

/**
 * 保存
 * import { postTaskDelegate } from "/@/apis/gct-platform/TaskDelegateController"
 */
export async function postTaskDelegate(data: TaskDelegateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/task-delegate`,
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
 * import { deleteTaskDelegate } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface deleteTaskDelegateQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskDelegate(params: deleteTaskDelegateQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/task-delegate`,
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
 * 取消
 * import { postTaskDelegateCancelById } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface postTaskDelegateCancelByIdPathInterface {
  id: string; // id
}
export async function postTaskDelegateCancelById(path: postTaskDelegateCancelByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/task-delegate/cancel/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getTaskDelegateInfo(params: getTaskDelegateInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTaskDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-delegate/info`,
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
 * import { getTaskDelegateList } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface getTaskDelegateListQueryInterface {
  valid?: boolean; // valid
}
export async function getTaskDelegateList(params: getTaskDelegateListQueryInterface = {}, config = {}): Promise<ResponseEntityListTaskDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-delegate/list`,
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
 * import { getTaskDelegatePageList } from "/@/apis/gct-platform/TaskDelegateController"
 */
export interface getTaskDelegatePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  valid?: boolean; // valid
}
export async function getTaskDelegatePageList(params: getTaskDelegatePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTaskDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-delegate/page/list`,
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
 * import { getTaskDelegateProcess } from "/@/apis/gct-platform/TaskDelegateController"
 */
export async function getTaskDelegateProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-delegate/process`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putTaskDelegateById(path: putTaskDelegateByIdPathInterface, data: TaskDelegateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/task-delegate/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}