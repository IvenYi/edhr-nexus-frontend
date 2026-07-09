import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityOpenapiKeyGrantResponse, ResponseEntityListOpenapiKeyGrantResponse, ResponseEntityListOpenapiAggregateByModelTreeResponse, ResponseEntityListOpenapiAggregateResponse, ResponseEntityPageBaseOpenapiKeyGrantResponse, OpenapiAuthorizationSetRequest } from './model/index';

/**
 * 新建保存
 * import { postOpenapiKeyGrant } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function postOpenapiKeyGrant(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/openapi-key-grant`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOpenapiKeyGrant } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface deleteOpenapiKeyGrantQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOpenapiKeyGrant(params: deleteOpenapiKeyGrantQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/openapi-key-grant`,
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
 * 授权信息详情
 * import { getOpenapiKeyGrantInfo } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantInfoQueryInterface {
  id: string; // id
}
export async function getOpenapiKeyGrantInfo(params: getOpenapiKeyGrantInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOpenapiKeyGrantResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/openapi-key-grant/info`,
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
 * import { getOpenapiKeyGrantList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function getOpenapiKeyGrantList(config = {}): Promise<ResponseEntityListOpenapiKeyGrantResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/openapi-key-grant/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 已开放api列表
 * import { getOpenapiKeyGrantOpenapiList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantOpenapiListQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
}
export async function getOpenapiKeyGrantOpenapiList(params: getOpenapiKeyGrantOpenapiListQueryInterface = {}, config = {}): Promise<ResponseEntityListOpenapiAggregateByModelTreeResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/openapi-key-grant/openapi/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 已开放租户api列表
 * import { getOpenapiKeyGrantOpenapiTenantList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export async function getOpenapiKeyGrantOpenapiTenantList(config = {}): Promise<ResponseEntityListOpenapiAggregateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/openapi-key-grant/openapi/tenantList`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOpenapiKeyGrantPageList } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface getOpenapiKeyGrantPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOpenapiKeyGrantPageList(params: getOpenapiKeyGrantPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOpenapiKeyGrantResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/openapi-key-grant/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 授权接口修改
 * import { putOpenapiKeyGrantById } from "/@/apis/gct-platform/OpenapiKeyGrantController"
 */
export interface putOpenapiKeyGrantByIdPathInterface {
  id: string; // id
}
export async function putOpenapiKeyGrantById(path: putOpenapiKeyGrantByIdPathInterface, data: OpenapiAuthorizationSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/openapi-key-grant/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}