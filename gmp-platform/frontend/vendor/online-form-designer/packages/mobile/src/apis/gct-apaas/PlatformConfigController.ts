import request from '@mobile/utils/request';
import type { SysConfigRequest, ResponseEntitystring, ResponseEntitySysConfigResponse, PlatformBaseConfig, OrgConfig, SecurityConfig } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 应用全局配置设置 保存/更新
 * import { postPlatAppGlobal } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatAppGlobal(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/plat/app/global`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfo } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function getPlatAppGlobalInfo(config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/plat/app/global/info`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBase } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatBase(data: PlatformBaseConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/plat/base`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 组织设置 保存/更新
 * import { postPlatOrg } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatOrg(data: OrgConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/plat/org`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 安全设置 保存/更新
 * import { postPlatSecurity } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatSecurity(data: SecurityConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/plat/security`,
      method: 'post',
      data,
      ...config,
    },
  );
}