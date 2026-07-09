import { defHttp } from '@/utils/http/axios';
import { PmTaskDoneRequest, ResponseEntitystring, ResponseEntityPmTaskDoneResponse, ResponseEntityListPmTaskDoneResponse, ResponseEntityPageBasePmTaskDoneResponse, ResponseEntityListAppProcess, ResponseEntityTaskDoneResponse, ResponseEntityPageBaseTaskDoneResponse } from './model/index';

/**
 * 保存
 * import { postPmTaskDone } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function postPmTaskDone(data: PmTaskDoneRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pm-task-done`,
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
 * import { deletePmTaskDone } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface deletePmTaskDoneQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmTaskDone(params: deletePmTaskDoneQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pm-task-done`,
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
 * import { getPmTaskDoneInfo } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface getPmTaskDoneInfoQueryInterface {
  id: string; // id
}
export async function getPmTaskDoneInfo(params: getPmTaskDoneInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-done/info`,
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
 * import { getPmTaskDoneList } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function getPmTaskDoneList(config = {}): Promise<ResponseEntityListPmTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-done/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmTaskDonePageList } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface getPmTaskDonePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
  status?: string; // 状态
}
export async function getPmTaskDonePageList(params: getPmTaskDonePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-done/page/list`,
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
 * import { getPmTaskDoneProcess } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function getPmTaskDoneProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-task-done/process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmTaskDoneById } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface putPmTaskDoneByIdPathInterface {
  id: string; // id
}
export async function putPmTaskDoneById(path: putPmTaskDoneByIdPathInterface, data: PmTaskDoneRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pm-task-done/${path?.id}`,
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
 * import { deleteTaskDone } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface deleteTaskDoneQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTaskDone(params: deleteTaskDoneQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/task-done`,
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
 * import { getTaskDoneInfo } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface getTaskDoneInfoQueryInterface {
  id: string; // id
}
export async function getTaskDoneInfo(params: getTaskDoneInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-done/info`,
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
 * import { getTaskDonePageList } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export interface getTaskDonePageListQueryInterface {
  finished?: boolean; // 已完成
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
}
export async function getTaskDonePageList(params: getTaskDonePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTaskDoneResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-done/page/list`,
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
 * import { getTaskDoneProcess } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function getTaskDoneProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/task-done/process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}