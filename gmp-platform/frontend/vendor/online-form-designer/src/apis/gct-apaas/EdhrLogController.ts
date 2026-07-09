import { defHttp } from '@/utils/http/axios';
import { ResponseEntityEdhrSummaryTraceEntity, ResponseEntityListEdhrLogEntity } from './model/index';

/**
 * dhr操作日志列表详情
 * import { getDhrLogFindByTraceId } from "/@/apis/gct-apaas/EdhrLogController"
 */
export interface getDhrLogFindByTraceIdQueryInterface {
  modelKey: string; // modelKey
  traceId: string; // traceId
}
export async function getDhrLogFindByTraceId(params: getDhrLogFindByTraceIdQueryInterface = {}, config = {}): Promise<ResponseEntityEdhrSummaryTraceEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/dhr/log/findByTraceId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDhrLogListByIsntanceId(path: getDhrLogListByIsntanceIdPathInterface, config = {}): Promise<ResponseEntityListEdhrLogEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/dhr/log/list/${path?.isntanceId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}