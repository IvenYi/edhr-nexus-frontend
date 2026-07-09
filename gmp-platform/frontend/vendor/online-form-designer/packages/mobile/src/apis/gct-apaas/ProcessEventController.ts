import request from '@mobile/utils/request';
import type { ProcessEventRequest, ResponseEntitystring, ResponseEntityProcessEventResponse, ResponseEntityListProcessEventResponse, ResponseEntityPageBaseProcessEventResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessEvent } from "/@/apis/gct-apaas/ProcessEventController"
 */
export async function postProcessEvent(data: ProcessEventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessEvent } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface deleteProcessEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessEvent(params: deleteProcessEventQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessEventInfo } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface getProcessEventInfoQueryInterface {
  id: string; // id
}
export async function getProcessEventInfo(params: getProcessEventInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessEventList } from "/@/apis/gct-apaas/ProcessEventController"
 */
export async function getProcessEventList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessEventPageList } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface getProcessEventPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessEventPageList(params: getProcessEventPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessEventById } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface putProcessEventByIdPathInterface {
  id: string; // id
}
export async function putProcessEventById(path: putProcessEventByIdPathInterface, data: ProcessEventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-event/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}