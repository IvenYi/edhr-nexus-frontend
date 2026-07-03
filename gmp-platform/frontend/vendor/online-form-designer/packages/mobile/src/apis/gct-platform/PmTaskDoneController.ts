import request from '@mobile/utils/request';
import type { PmTaskDoneRequest, ResponseEntitystring, ResponseEntityPmTaskDoneResponse, ResponseEntityListPmTaskDoneResponse, ResponseEntityPageBasePmTaskDoneResponse, ResponseEntityListAppProcess, ResponseEntityTaskDoneResponse, ResponseEntityPageBaseTaskDoneResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmTaskDone } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function postPmTaskDone(data: PmTaskDoneRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done`,
      method: 'post',
      data,
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
export async function deletePmTaskDone(params: deletePmTaskDoneQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done`,
      method: 'delete',
      params,
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
export async function getPmTaskDoneInfo(params: getPmTaskDoneInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmTaskDoneResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmTaskDoneList } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function getPmTaskDoneList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPmTaskDoneResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done/list`,
      method: 'get',
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
export async function getPmTaskDonePageList(params: getPmTaskDonePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmTaskDoneResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getPmTaskDoneProcess } from "/@/apis/gct-platform/PmTaskDoneController"
 */
export async function getPmTaskDoneProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done/process`,
      method: 'get',
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
export async function putPmTaskDoneById(path: putPmTaskDoneByIdPathInterface, data: PmTaskDoneRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-task-done/${path?.id}`,
      method: 'put',
      data,
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
 * import { getTaskDoneInfo } from "/@/apis/gct-platform/PmTaskDoneController"
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
 * import { getTaskDonePageList } from "/@/apis/gct-platform/PmTaskDoneController"
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
 * import { getTaskDoneProcess } from "/@/apis/gct-platform/PmTaskDoneController"
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