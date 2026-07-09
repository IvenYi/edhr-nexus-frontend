import { defHttp } from '@/utils/http/axios';
import { OpenapiRequest, ResponseEntitystring, ResponseEntityApiInfo, ResponseEntityListApiInfo, ResponseEntityOpenapiResponse, ResponseEntityListOpenapiResponse, ResponseEntityPageBaseOpenapiResponse } from './model/index';

/**
 * 保存
 * import { postOpenapi } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function postOpenapi(data: OpenapiRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/openapi`,
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
 * import { deleteOpenapi } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface deleteOpenapiQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOpenapi(params: deleteOpenapiQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/openapi`,
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
 * 单个api详情
 * import { getOpenapiGetApiInfo } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiGetApiInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiGetApiInfo(params: getOpenapiGetApiInfoQueryInterface = {}, config = {}): Promise<ResponseEntityApiInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/openapi/getApiInfo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 所有api详情
 * import { getOpenapiGetApiInfos } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function getOpenapiGetApiInfos(config = {}): Promise<ResponseEntityListApiInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/openapi/getApiInfos`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getOpenapiInfo } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiInfo(params: getOpenapiInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOpenapiResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/openapi/info`,
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
 * import { getOpenapiList } from "/@/apis/gct-apaas/OpenapiController"
 */
export async function getOpenapiList(config = {}): Promise<ResponseEntityListOpenapiResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/openapi/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOpenapiPageList } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface getOpenapiPageListQueryInterface {
  key?: string; // key
  modelKey?: string; // modelKey
  name?: string; // name
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
}
export async function getOpenapiPageList(params: getOpenapiPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOpenapiResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/openapi/page/list`,
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
 * import { putOpenapiById } from "/@/apis/gct-apaas/OpenapiController"
 */
export interface putOpenapiByIdPathInterface {
  id: string; // id
}
export async function putOpenapiById(path: putOpenapiByIdPathInterface, data: OpenapiRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/openapi/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}