import request from '@mobile/utils/request';
import type { ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntitystring, PlatformBaseConfig, OrgConfig, SecurityConfig } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfoByAppId } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export interface getPlatAppGlobalInfoByAppIdPathInterface {
  appId: string; // appId
}
export async function getPlatAppGlobalInfoByAppId(path: getPlatAppGlobalInfoByAppIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/plat/app/global/info/${path?.appId}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 应用全局配置设置 保存/更新
 * import { postPlatAppGlobalByAppId } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export interface postPlatAppGlobalByAppIdPathInterface {
  appId: string; // appId
}
export async function postPlatAppGlobalByAppId(path: postPlatAppGlobalByAppIdPathInterface, data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/plat/app/global/${path?.appId}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBase } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatBase(data: PlatformBaseConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/plat/base`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 组织设置 保存/更新
 * import { postPlatOrg } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatOrg(data: OrgConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/plat/org`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 安全设置 保存/更新
 * import { postPlatSecurity } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatSecurity(data: SecurityConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/plat/security`,
      method: 'post',
      data,
      ...config,
    },
  );
}