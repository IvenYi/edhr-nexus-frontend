import { defHttp } from '@/utils/http/axios';
import { EventRequest, ResponseEntitystring, ResponseEntityEventResponse, ResponseEntityListEventResponse, ResponseEntityPageBaseEventResponse } from './model/index';

/**
 * 保存
 * import { postEvent } from "/@/apis/gct-apaas/EventController"
 */
export async function postEvent(data: EventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/event`,
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
 * import { deleteEvent } from "/@/apis/gct-apaas/EventController"
 */
export interface deleteEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEvent(params: deleteEventQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/event`,
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
 * import { getEventInfo } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventInfoQueryInterface {
  id: string; // id
}
export async function getEventInfo(params: getEventInfoQueryInterface = {}, config = {}): Promise<ResponseEntityEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event/info`,
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
 * import { getEventList } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventListQueryInterface {
  type?: string; // type
}
export async function getEventList(params: getEventListQueryInterface = {}, config = {}): Promise<ResponseEntityListEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event/list`,
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
 * import { getEventPageList } from "/@/apis/gct-apaas/EventController"
 */
export interface getEventPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  searchKey?: string; // searchKey
}
export async function getEventPageList(params: getEventPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putEventById(path: putEventByIdPathInterface, data: EventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/event/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}