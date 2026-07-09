import request from '@mobile/utils/request';
import type { ResponseEntityEdhrSummaryTraceEntity, ResponseEntityListEdhrLogEntity } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * dhr操作日志列表详情
 * import { getDhrLogFindByTraceId } from "/@/apis/gct-apaas/EdhrLogController"
 */
export interface getDhrLogFindByTraceIdQueryInterface {
  modelKey: string; // modelKey
  traceId: string; // traceId
}
export async function getDhrLogFindByTraceId(params: getDhrLogFindByTraceIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrSummaryTraceEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/log/findByTraceId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * dhr操作日志列表
 * import { getDhrLogListByIsntanceId } from "/@/apis/gct-apaas/EdhrLogController"
 */
export interface getDhrLogListByIsntanceIdPathInterface {
  isntanceId: string; // dhr实例id
}
export async function getDhrLogListByIsntanceId(path: getDhrLogListByIsntanceIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrLogEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/dhr/log/list/${path?.isntanceId}`,
      method: 'get',
      ...config,
    },
  );
}