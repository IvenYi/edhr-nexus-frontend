import { defHttp } from '@/utils/http/axios';
import { SandboxConfigRequest, ResponseEntitystring, ResponseEntitySandboxConfigResponse, ResponseEntityListSandboxConfigResponse, ResponseEntityPageBaseSandboxConfigResponse, PageSyncDTO, ScriptVersionSyncDTO } from './model/index';

/**
 * 保存
 * import { postSandboxConfig } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfig(data: SandboxConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sandbox-config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除沙箱
 * import { deleteSandboxConfig } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function deleteSandboxConfig(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/sandbox-config`,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getSandboxConfigInfo } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export interface getSandboxConfigInfoQueryInterface {
  id: string; // id
}
export async function getSandboxConfigInfo(params: getSandboxConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sandbox-config/info`,
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
 * import { getSandboxConfigList } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function getSandboxConfigList(config = {}): Promise<ResponseEntityListSandboxConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sandbox-config/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSandboxConfigPageList } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export interface getSandboxConfigPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getSandboxConfigPageList(params: getSandboxConfigPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseSandboxConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sandbox-config/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步沙箱
 * import { postSandboxConfigSync } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSync(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sandbox-config/sync`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步页面设计到沙箱环境
 * import { postSandboxConfigSyncPage } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSyncPage(data: PageSyncDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sandbox-config/sync/page`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步脚本到沙箱环境
 * import { postSandboxConfigSyncScript } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSyncScript(data: ScriptVersionSyncDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sandbox-config/sync/script`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 校验沙箱环境状态
 * import { getSandboxConfigValidStatus } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export interface getSandboxConfigValidStatusQueryInterface {
  appId: string; // 应用ID
}
export async function getSandboxConfigValidStatus(params: getSandboxConfigValidStatusQueryInterface = {}, config = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sandbox-config/valid/status`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 校验沙箱环境状态
 * import { getSandboxConfigVisitCheck } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export interface getSandboxConfigVisitCheckQueryInterface {
  appId: string; // 应用ID
}
export async function getSandboxConfigVisitCheck(params: getSandboxConfigVisitCheckQueryInterface = {}, config = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sandbox-config/visit/check`,
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
 * import { putSandboxConfigById } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export interface putSandboxConfigByIdPathInterface {
  id: string; // id
}
export async function putSandboxConfigById(path: putSandboxConfigByIdPathInterface, data: SandboxConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/sandbox-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}