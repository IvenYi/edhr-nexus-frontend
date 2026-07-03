import { defHttp } from '@/utils/http/axios';
import { SysConfigRequest, ResponseEntitystring, ResponseEntitySysConfigResponse, PlatformBaseConfig, OrgConfig, SecurityConfig } from './model/index';

/**
 * 应用全局配置设置 保存/更新
 * import { postPlatAppGlobal } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatAppGlobal(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/plat/app/global`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfo } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function getPlatAppGlobalInfo(config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/plat/app/global/info`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBase } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatBase(data: PlatformBaseConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/plat/base`,
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
 * import { postPlatOrg } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatOrg(data: OrgConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/plat/org`,
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
 * import { postPlatSecurity } from "/@/apis/gct-apaas/PlatformConfigController"
 */
export async function postPlatSecurity(data: SecurityConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/plat/security`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}