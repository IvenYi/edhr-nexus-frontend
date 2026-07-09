import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityTenant, ResponseEntityTenantResponse, ResponseEntityListTenantResponse, TenantDomainRequest, ResponseEntityUserOfTenantDTO, TenantRequest } from './model/index';

/**
 * 锁定租户
 * import { putTenantDisableById } from "/@/apis/gct-platform/TenantController"
 */
export interface putTenantDisableByIdPathInterface {
  id: string; // id
}
export async function putTenantDisableById(path: putTenantDisableByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/disable/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 解锁租户
 * import { putTenantEnableById } from "/@/apis/gct-platform/TenantController"
 */
export interface putTenantEnableByIdPathInterface {
  id: string; // id
}
export async function putTenantEnableById(path: putTenantEnableByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/enable/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appId获取租户id
 * import { getTenantGetTenantIdByAppId } from "/@/apis/gct-platform/TenantController"
 */
export interface getTenantGetTenantIdByAppIdQueryInterface {
  appId: string; // 应用id
}
export async function getTenantGetTenantIdByAppId(params: getTenantGetTenantIdByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/getTenantIdByAppId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据域名获取租户信息
 * import { getTenantGetTencentByDomain } from "/@/apis/gct-platform/TenantController"
 */
export interface getTenantGetTencentByDomainQueryInterface {
  domain?: string; // domain
}
export async function getTenantGetTencentByDomain(params: getTenantGetTencentByDomainQueryInterface = {}, config = {}): Promise<ResponseEntityTenant['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/getTencentByDomain`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据域名或端口获取租户信息
 * import { getTenantInfoByPortOrDomain } from "/@/apis/gct-platform/TenantController"
 */
export interface getTenantInfoByPortOrDomainQueryInterface {
  domain?: string; // domain
  port?: string; // port
}
export async function getTenantInfoByPortOrDomain(params: getTenantInfoByPortOrDomainQueryInterface = {}, config = {}): Promise<ResponseEntityTenant['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/info/byPortOrDomain`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTenantInfoById } from "/@/apis/gct-platform/TenantController"
 */
export interface getTenantInfoByIdPathInterface {
  id: string; // id
}
export async function getTenantInfoById(path: getTenantInfoByIdPathInterface, config = {}): Promise<ResponseEntityTenantResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTenantList } from "/@/apis/gct-platform/TenantController"
 */
export interface getTenantListQueryInterface {
  enabled?: number; // 状态，0：禁用；1：启用；不传：不限制状态
  endTime?: string; // 结束时间
  name?: string; // 租户名称
  startTime?: string; // 开始时间
}
export async function getTenantList(params: getTenantListQueryInterface = {}, config = {}): Promise<ResponseEntityListTenantResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改租户域名
 * import { putTenantUpdateDomainById } from "/@/apis/gct-platform/TenantController"
 */
export interface putTenantUpdateDomainByIdPathInterface {
  id: string; // id
}
export async function putTenantUpdateDomainById(path: putTenantUpdateDomainByIdPathInterface, data: TenantDomainRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/updateDomain/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取用户信息
 * import { getTenantUserInfo } from "/@/apis/gct-platform/TenantController"
 */
export async function getTenantUserInfo(config = {}): Promise<ResponseEntityUserOfTenantDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/user/info`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTenantById } from "/@/apis/gct-platform/TenantController"
 */
export interface putTenantByIdPathInterface {
  id: string; // id
}
export async function putTenantById(path: putTenantByIdPathInterface, data: TenantRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}