import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityTenant, ResponseEntityTenantResponse, ResponseEntityListTenantResponse, TenantDomainRequest, ResponseEntityUserOfTenantDTO, TenantRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 锁定租户
 * import { putTenantDisableById } from "/@/apis/gct-platform/TenantController"
 */
export interface putTenantDisableByIdPathInterface {
  id: string; // id
}
export async function putTenantDisableById(path: putTenantDisableByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/disable/${path?.id}`,
      method: 'put',
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
export async function putTenantEnableById(path: putTenantEnableByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/enable/${path?.id}`,
      method: 'put',
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
export async function getTenantGetTenantIdByAppId(params: getTenantGetTenantIdByAppIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/getTenantIdByAppId`,
      method: 'get',
      params,
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
export async function getTenantGetTencentByDomain(params: getTenantGetTencentByDomainQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTenant['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/getTencentByDomain`,
      method: 'get',
      params,
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
export async function getTenantInfoByPortOrDomain(params: getTenantInfoByPortOrDomainQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTenant['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/info/byPortOrDomain`,
      method: 'get',
      params,
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
export async function getTenantInfoById(path: getTenantInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityTenantResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/info/${path?.id}`,
      method: 'get',
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
export async function getTenantList(params: getTenantListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTenantResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/list`,
      method: 'get',
      params,
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
export async function putTenantUpdateDomainById(path: putTenantUpdateDomainByIdPathInterface, data: TenantDomainRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/updateDomain/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 获取用户信息
 * import { getTenantUserInfo } from "/@/apis/gct-platform/TenantController"
 */
export async function getTenantUserInfo(config:AxiosRequestConfig = {}): Promise<ResponseEntityUserOfTenantDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/user/info`,
      method: 'get',
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
export async function putTenantById(path: putTenantByIdPathInterface, data: TenantRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}