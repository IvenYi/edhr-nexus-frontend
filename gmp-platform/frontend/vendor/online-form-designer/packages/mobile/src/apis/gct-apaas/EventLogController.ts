import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityEventLogResponse, ResponseEntityListEventLogResponse, ResponseEntityPageBaseEventLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteEventLog } from "/@/apis/gct-apaas/EventLogController"
 */
export interface deleteEventLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEventLog(params: deleteEventLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/event-log`,
      method: 'delete',
      params,
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
export async function getEventLogInfo(params: getEventLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEventLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEventLogList } from "/@/apis/gct-apaas/EventLogController"
 */
export async function getEventLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListEventLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event-log/list`,
      method: 'get',
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
export async function getEventLogPageList(params: getEventLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEventLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/event-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}