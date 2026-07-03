import { defHttp } from '@/utils/http/axios';
import { DataTraceRequest, ResponseEntitystring, ResponseEntityDataTraceResponse, ResponseEntityListDataTraceResponse, ResponseEntityListUserInfo, ResponseEntityPageBaseDataTraceResponse } from './model/index';

/**
 * 保存
 * import { postDataTrace } from "/@/apis/gct-platform/DataTraceController"
 */
export async function postDataTrace(data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-trace`,
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
 * import { deleteDataTrace } from "/@/apis/gct-platform/DataTraceController"
 */
export interface deleteDataTraceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataTrace(params: deleteDataTraceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/data-trace`,
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
 * import { postDataTraceExport } from "/@/apis/gct-platform/DataTraceController"
 */
export async function postDataTraceExport(data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-trace/export`,
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
 * import { getDataTraceInfo } from "/@/apis/gct-platform/DataTraceController"
 */
export interface getDataTraceInfoQueryInterface {
  id: string; // id
}
export async function getDataTraceInfo(params: getDataTraceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDataTraceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-trace/info`,
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
 * import { getDataTraceList } from "/@/apis/gct-platform/DataTraceController"
 */
export async function getDataTraceList(config = {}): Promise<ResponseEntityListDataTraceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-trace/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getDataTraceOperators } from "/@/apis/gct-platform/DataTraceController"
 */
export async function getDataTraceOperators(config = {}): Promise<ResponseEntityListUserInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-trace/operators`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postDataTracePageList } from "/@/apis/gct-platform/DataTraceController"
 */
export async function postDataTracePageList(data: DataTraceRequest, config = {}): Promise<ResponseEntityPageBaseDataTraceResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-trace/page/list`,
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
 * import { putDataTraceById } from "/@/apis/gct-platform/DataTraceController"
 */
export interface putDataTraceByIdPathInterface {
  id: string; // id
}
export async function putDataTraceById(path: putDataTraceByIdPathInterface, data: DataTraceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/data-trace/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}