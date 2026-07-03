import { defHttp } from '@/utils/http/axios';
import { ProcessEventRequest, ResponseEntitystring, ResponseEntityProcessEventResponse, ResponseEntityListProcessEventResponse, ResponseEntityPageBaseProcessEventResponse } from './model/index';

/**
 * 保存
 * import { postProcessEvent } from "/@/apis/gct-apaas/ProcessEventController"
 */
export async function postProcessEvent(data: ProcessEventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-event`,
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
 * import { deleteProcessEvent } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface deleteProcessEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessEvent(params: deleteProcessEventQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-event`,
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
 * import { getProcessEventInfo } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface getProcessEventInfoQueryInterface {
  id: string; // id
}
export async function getProcessEventInfo(params: getProcessEventInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-event/info`,
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
 * import { getProcessEventList } from "/@/apis/gct-apaas/ProcessEventController"
 */
export async function getProcessEventList(config = {}): Promise<ResponseEntityListProcessEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-event/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessEventPageList(params: getProcessEventPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-event/page/list`,
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
 * import { putProcessEventById } from "/@/apis/gct-apaas/ProcessEventController"
 */
export interface putProcessEventByIdPathInterface {
  id: string; // id
}
export async function putProcessEventById(path: putProcessEventByIdPathInterface, data: ProcessEventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-event/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}