import { defHttp } from '@/utils/http/axios';
import { TraceLogDetailsRequest, ResponseEntitystring, ResponseEntityPageBaseTraceLogDetailsResponse, ResponseEntityTraceLogDetailsResponse, ResponseEntityListMapstringobject, ResponseEntityListTraceLogDetailsResponse, ResponseEntityListUserBaseInfo } from './model/index';

/**
 * 保存
 * import { postTraceLogDetails } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export async function postTraceLogDetails(data: TraceLogDetailsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/trace-log-details`,
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
 * import { deleteTraceLogDetails } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface deleteTraceLogDetailsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceLogDetails(params: deleteTraceLogDetailsQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/trace-log-details`,
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
 * 应用模型数据追溯分页列表
 * import { postTraceLogDetailsAppDataTracePageList } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export async function postTraceLogDetailsAppDataTracePageList(data: TraceLogDetailsRequest, config = {}): Promise<ResponseEntityPageBaseTraceLogDetailsResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/trace-log-details/app-data-trace/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTraceLogDetailsInfo } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface getTraceLogDetailsInfoQueryInterface {
  id: string; // id
}
export async function getTraceLogDetailsInfo(params: getTraceLogDetailsInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTraceLogDetailsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情(树型)
 * import { getTraceLogDetailsInfoTree } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface getTraceLogDetailsInfoTreeQueryInterface {
  traceLogId: string; // traceLogId
}
export async function getTraceLogDetailsInfoTree(params: getTraceLogDetailsInfoTreeQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/infoTree`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情(树型,根据数据记录id查询)
 * import { getTraceLogDetailsInfoTreeById } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface getTraceLogDetailsInfoTreeByIdQueryInterface {
  id: string; // id
}
export async function getTraceLogDetailsInfoTreeById(params: getTraceLogDetailsInfoTreeByIdQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/infoTreeById`,
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
 * import { getTraceLogDetailsList } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export async function getTraceLogDetailsList(config = {}): Promise<ResponseEntityListTraceLogDetailsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 应用模型操作人
 * import { getTraceLogDetailsOperators } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export async function getTraceLogDetailsOperators(config = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/operators`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTraceLogDetailsPageList } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface getTraceLogDetailsPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTraceLogDetailsPageList(params: getTraceLogDetailsPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTraceLogDetailsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表(根据主键主键id查询)
 * import { getTraceLogDetailsPageListByRecodeId } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface getTraceLogDetailsPageListByRecodeIdQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  recodeId: string; // 数据主键id
}
export async function getTraceLogDetailsPageListByRecodeId(params: getTraceLogDetailsPageListByRecodeIdQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTraceLogDetailsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-log-details/page/listByRecodeId`,
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
 * import { putTraceLogDetailsById } from "/@/apis/gct-apaas/TraceLogDetailsController"
 */
export interface putTraceLogDetailsByIdPathInterface {
  id: string; // id
}
export async function putTraceLogDetailsById(path: putTraceLogDetailsByIdPathInterface, data: TraceLogDetailsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/trace-log-details/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}