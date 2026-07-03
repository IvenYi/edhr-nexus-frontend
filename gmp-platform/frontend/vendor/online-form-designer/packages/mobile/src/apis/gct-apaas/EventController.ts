import request from '@mobile/utils/request';
import type { EventRequest, ResponseEntitystring, ResponseEntityEventResponse, ResponseEntityListEventResponse, ResponseEntityPageBaseEventResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postEvent } from "/@/apis/gct-apaas/EventController"
 */
export async function postEvent(data: EventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/event`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEvent } from "/@/apis/gct-apaas/EventController"
 */
export interface deleteEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEvent(params: deleteEventQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/event`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getEventInfo } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventInfoQueryInterface {
  id: string; // id
}
export async function getEventInfo(params: getEventInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEventList } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventListQueryInterface {
  type?: string; // type
}
export async function getEventList(params: getEventListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEventPageList } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  searchKey?: string; // searchKey
}
export async function getEventPageList(params: getEventPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putEventById } from "/@/apis/gct-apaas/EventController"
 */
export interface putEventByIdPathInterface {
  id: string; // id
}
export async function putEventById(path: putEventByIdPathInterface, data: EventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/event/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}