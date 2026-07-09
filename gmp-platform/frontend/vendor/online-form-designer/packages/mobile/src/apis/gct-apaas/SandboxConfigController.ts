import request from '@mobile/utils/request';
import type { SandboxConfigRequest, ResponseEntitystring, ResponseEntitySandboxConfigResponse, ResponseEntityListSandboxConfigResponse, ResponseEntityPageBaseSandboxConfigResponse, PageSyncDTO, ScriptVersionSyncDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSandboxConfig } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfig(data: SandboxConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 移除沙箱
 * import { deleteSandboxConfig } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function deleteSandboxConfig(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config`,
      method: 'delete',
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
export async function getSandboxConfigInfo(params: getSandboxConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSandboxConfigList } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function getSandboxConfigList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSandboxConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/list`,
      method: 'get',
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
export async function getSandboxConfigPageList(params: getSandboxConfigPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSandboxConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 同步沙箱
 * import { postSandboxConfigSync } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSync(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/sync`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 同步页面设计到沙箱环境
 * import { postSandboxConfigSyncPage } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSyncPage(data: PageSyncDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/sync/page`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 同步脚本到沙箱环境
 * import { postSandboxConfigSyncScript } from "/@/apis/gct-apaas/SandboxConfigController"
 */
export async function postSandboxConfigSyncScript(data: ScriptVersionSyncDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/sync/script`,
      method: 'post',
      data,
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
export async function getSandboxConfigValidStatus(params: getSandboxConfigValidStatusQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/valid/status`,
      method: 'get',
      params,
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
export async function getSandboxConfigVisitCheck(params: getSandboxConfigVisitCheckQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySandboxConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/visit/check`,
      method: 'get',
      params,
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
export async function putSandboxConfigById(path: putSandboxConfigByIdPathInterface, data: SandboxConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sandbox-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}