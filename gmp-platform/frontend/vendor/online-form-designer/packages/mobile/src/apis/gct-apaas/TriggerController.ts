import request from '@mobile/utils/request';
import type { TriggerRequest, ResponseEntitystring, ResponseEntityTriggerResponse, ResponseEntityListTriggerResponse, ResponseEntityPageBaseTriggerResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 触发器保存
 * import { postTrigger } from "/@/apis/gct-apaas/TriggerController"
 */
export async function postTrigger(data: TriggerRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTrigger } from "/@/apis/gct-apaas/TriggerController"
 */
export interface deleteTriggerQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTrigger(params: deleteTriggerQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTriggerInfo } from "/@/apis/gct-apaas/TriggerController"
 */
export interface getTriggerInfoQueryInterface {
  id: string; // id
}
export async function getTriggerInfo(params: getTriggerInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTriggerResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 触发器列表
 * import { getTriggerList } from "/@/apis/gct-apaas/TriggerController"
 */
export interface getTriggerListQueryInterface {
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
}
export async function getTriggerList(params: getTriggerListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTriggerResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 触发器分页列表
 * import { getTriggerPageList } from "/@/apis/gct-apaas/TriggerController"
 */
export interface getTriggerPageListQueryInterface {
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTriggerPageList(params: getTriggerPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTriggerResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 触发器修改
 * import { putTriggerById } from "/@/apis/gct-apaas/TriggerController"
 */
export interface putTriggerByIdPathInterface {
  id: string; // id
}
export async function putTriggerById(path: putTriggerByIdPathInterface, data: TriggerRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trigger/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}