import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityEventLogResponse, ResponseEntityListEventLogResponse, ResponseEntityPageBaseEventLogResponse } from './model/index';

/**
 * 删除
 * import { deleteEventLog } from "/@/apis/gct-apaas/EventLogController"
 */
export interface deleteEventLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEventLog(params: deleteEventLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/event-log`,
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
 * import { getEventLogInfo } from "/@/apis/gct-apaas/EventLogController"
 */
export interface getEventLogInfoQueryInterface {
  id: string; // id
}
export async function getEventLogInfo(params: getEventLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityEventLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event-log/info`,
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
 * import { getEventLogList } from "/@/apis/gct-apaas/EventLogController"
 */
export async function getEventLogList(config = {}): Promise<ResponseEntityListEventLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEventLogPageList } from "/@/apis/gct-apaas/EventLogController"
 */
export interface getEventLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getEventLogPageList(params: getEventLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEventLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/event-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}