import { defHttp } from '@/utils/http/axios';
import { DataTraceRequest, ResponseEntitystring, ResponseEntityDataTraceResponse, ResponseEntityListDataTraceResponse, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseDataTraceResponse } from './model/index';

/**
 * 保存
 * import { postDataTrace } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTrace(data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-trace`,
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
 * import { deleteDataTrace } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface deleteDataTraceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataTrace(params: deleteDataTraceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/data-trace`,
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
 * 导出
 * import { postDataTraceExport } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTraceExport(data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-trace/export`,
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
 * import { getDataTraceInfo } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface getDataTraceInfoQueryInterface {
  id: string; // id
}
export async function getDataTraceInfo(params: getDataTraceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDataTraceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-trace/info`,
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
 * import { getDataTraceList } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function getDataTraceList(config = {}): Promise<ResponseEntityListDataTraceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-trace/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getDataTraceOperators } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function getDataTraceOperators(config = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-trace/operators`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postDataTracePageList } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTracePageList(data: DataTraceRequest, config = {}): Promise<ResponseEntityPageBaseDataTraceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-trace/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDataTraceById } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface putDataTraceByIdPathInterface {
  id: string; // id
}
export async function putDataTraceById(path: putDataTraceByIdPathInterface, data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/data-trace/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}