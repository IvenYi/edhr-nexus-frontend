import { defHttp } from '@/utils/http/axios';
import { ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntitystring, PlatformBaseConfig, OrgConfig, SecurityConfig } from './model/index';

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfoByAppIdExternal } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export interface getPlatAppGlobalInfoByAppIdExternalPathInterface {
  appId: string; // appId
}
export async function getPlatAppGlobalInfoByAppIdExternal(path: getPlatAppGlobalInfoByAppIdExternalPathInterface, config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/plat/app/global/info/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 应用全局配置设置 保存/更新
 * import { postPlatAppGlobalByAppIdExternal } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export interface postPlatAppGlobalByAppIdExternalPathInterface {
  appId: string; // appId
}
export async function postPlatAppGlobalByAppIdExternal(path: postPlatAppGlobalByAppIdExternalPathInterface, data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/plat/app/global/${path?.appId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBaseExternal } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatBaseExternal(data: PlatformBaseConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/plat/base`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织设置 保存/更新
 * import { postPlatOrgExternal } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatOrgExternal(data: OrgConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/plat/org`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 安全设置 保存/更新
 * import { postPlatSecurityExternal } from "/@/apis/gct-platform/ExternalPlatformConfigController"
 */
export async function postPlatSecurityExternal(data: SecurityConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/plat/security`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}