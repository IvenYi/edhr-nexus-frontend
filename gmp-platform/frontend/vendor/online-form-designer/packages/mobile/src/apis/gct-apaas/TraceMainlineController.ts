import request from '@mobile/utils/request';
import type { TraceMainlineRequest, ResponseEntitystring, ResponseEntityTraceMainlineResponse, ResponseEntityListTraceMainlineResponse, ResponseEntityPageBaseTraceMainlineResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTraceMainline } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export async function postTraceMainline(data: TraceMainlineRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTraceMainline } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface deleteTraceMainlineQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceMainline(params: deleteTraceMainlineQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTraceMainlineInfo } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface getTraceMainlineInfoQueryInterface {
  id: string; // id
}
export async function getTraceMainlineInfo(params: getTraceMainlineInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTraceMainlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTraceMainlineList } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export async function getTraceMainlineList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListTraceMainlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTraceMainlinePageList } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface getTraceMainlinePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTraceMainlinePageList(params: getTraceMainlinePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTraceMainlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTraceMainlineById } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface putTraceMainlineByIdPathInterface {
  id: string; // id
}
export async function putTraceMainlineById(path: putTraceMainlineByIdPathInterface, data: TraceMainlineRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}