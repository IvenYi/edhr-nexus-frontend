import { defHttp } from '@/utils/http/axios';
import { TraceMainlineExtRequest, ResponseEntitystring, ResponseEntityTraceMainlineExtResponse, ResponseEntityListTraceMainlineExtResponse, ResponseEntityPageBaseTraceMainlineExtResponse } from './model/index';

/**
 * 保存
 * import { postTraceMainlineExt } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export async function postTraceMainlineExt(data: TraceMainlineExtRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/trace-mainline-ext`,
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
 * import { deleteTraceMainlineExt } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface deleteTraceMainlineExtQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceMainlineExt(params: deleteTraceMainlineExtQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/trace-mainline-ext`,
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
 * import { getTraceMainlineExtInfo } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface getTraceMainlineExtInfoQueryInterface {
  id: string; // id
}
export async function getTraceMainlineExtInfo(params: getTraceMainlineExtInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTraceMainlineExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline-ext/info`,
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
 * import { getTraceMainlineExtList } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export async function getTraceMainlineExtList(config = {}): Promise<ResponseEntityListTraceMainlineExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline-ext/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getTraceMainlineExtPageList(params: getTraceMainlineExtPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTraceMainlineExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-mainline-ext/page/list`,
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
 * import { putTraceMainlineExtById } from "/@/apis/gct-apaas/TraceMainlineExtController"
 */
export interface putTraceMainlineExtByIdPathInterface {
  id: string; // id
}
export async function putTraceMainlineExtById(path: putTraceMainlineExtByIdPathInterface, data: TraceMainlineExtRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/trace-mainline-ext/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}