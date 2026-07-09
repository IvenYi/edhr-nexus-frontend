import request from '@mobile/utils/request';
import type { TraceMainlineExtRequest, ResponseEntitystring, ResponseEntityTraceMainlineExtResponse, ResponseEntityListTraceMainlineExtResponse, ResponseEntityPageBaseTraceMainlineExtResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTraceMainlineExt } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export async function postTraceMainlineExt(data: TraceMainlineExtRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTraceMainlineExt } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface deleteTraceMainlineExtQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceMainlineExt(params: deleteTraceMainlineExtQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getTraceMainlineExtInfo } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface getTraceMainlineExtInfoQueryInterface {
  id: string; // id
}
export async function getTraceMainlineExtInfo(params: getTraceMainlineExtInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTraceMainlineExtResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTraceMainlineExtList } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export async function getTraceMainlineExtList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListTraceMainlineExtResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTraceMainlineExtPageList } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface getTraceMainlineExtPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTraceMainlineExtPageList(params: getTraceMainlineExtPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTraceMainlineExtResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTraceMainlineExtById } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface putTraceMainlineExtByIdPathInterface {
  id: string; // id
}
export async function putTraceMainlineExtById(path: putTraceMainlineExtByIdPathInterface, data: TraceMainlineExtRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-mainline-ext/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}