import request from '@mobile/utils/request';
import type { TraceLogRequest, ResponseEntitystring, ResponseEntityTraceLogResponse, ResponseEntityListTraceLogResponse, ResponseEntityPageBaseTraceLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTraceLog } from "/@/apis/gct-apaas/TraceLogController"
 */
export async function postTraceLog(data: TraceLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTraceLog } from "/@/apis/gct-apaas/TraceLogController"
 */
export interface deleteTraceLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceLog(params: deleteTraceLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据traceId查询字段变更记录
 * import { getTraceLogFindByTraceId } from "/@/apis/gct-apaas/TraceLogController"
 */
export interface getTraceLogFindByTraceIdQueryInterface {
  modelKey: string; // modelKey
  traceId: string; // traceId
}
export async function getTraceLogFindByTraceId(params: getTraceLogFindByTraceIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTraceLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log/findByTraceId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTraceLogInfo } from "/@/apis/gct-apaas/TraceLogController"
 */
export interface getTraceLogInfoQueryInterface {
  id: string; // id
}
export async function getTraceLogInfo(params: getTraceLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTraceLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTraceLogList } from "/@/apis/gct-apaas/TraceLogController"
 */
export async function getTraceLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListTraceLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTraceLogPageList } from "/@/apis/gct-apaas/TraceLogController"
 */
export interface getTraceLogPageListQueryInterface {
  endTime?: string; // 结束时间
  id?: string; // 主键id
  masterOperationType?: string; // 操作类型
  modelKey?: string; // 模型key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getTraceLogPageList(params: getTraceLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTraceLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTraceLogById } from "/@/apis/gct-apaas/TraceLogController"
 */
export interface putTraceLogByIdPathInterface {
  id: string; // id
}
export async function putTraceLogById(path: putTraceLogByIdPathInterface, data: TraceLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}