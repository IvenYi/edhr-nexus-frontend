import { defHttp } from '@/utils/http/axios';
import { TraceMainlineRequest, ResponseEntitystring, ResponseEntityTraceMainlineResponse, ResponseEntityListTraceMainlineResponse, ResponseEntityPageBaseTraceMainlineResponse } from './model/index';

/**
 * 保存
 * import { postTraceMainline } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export async function postTraceMainline(data: TraceMainlineRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/trace-mainline`,
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
 * import { deleteTraceMainline } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface deleteTraceMainlineQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceMainline(params: deleteTraceMainlineQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/trace-mainline`,
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
 * import { getTraceMainlineInfo } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface getTraceMainlineInfoQueryInterface {
  id: string; // id
}
export async function getTraceMainlineInfo(params: getTraceMainlineInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTraceMainlineResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline/info`,
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
 * import { getTraceMainlineList } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export async function getTraceMainlineList(config = {}): Promise<ResponseEntityListTraceMainlineResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getTraceMainlinePageList(params: getTraceMainlinePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTraceMainlineResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline/page/list`,
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
 * import { putTraceMainlineById } from "/@/apis/gct-apaas/TraceMainlineController"
 */
export interface putTraceMainlineByIdPathInterface {
  id: string; // id
}
export async function putTraceMainlineById(path: putTraceMainlineByIdPathInterface, data: TraceMainlineRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/trace-mainline/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}