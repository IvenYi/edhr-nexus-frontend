import { defHttp } from '@/utils/http/axios';
import { BasicConfigRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntityBasicConfigResponse } from './model/index';

/**
 * 基础配置保存/修改
 * import { postBasicConfig } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfig(data: BasicConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/basic-config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 是否启用ai知识库
 * import { getBasicConfigAiRagEnabled } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function getBasicConfigAiRagEnabled(config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/basic-config/aiRagEnabled`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 主题等配置查询
 * import { getBasicConfigDetail } from "/@/apis/gct-apaas/BasicConfigController"
 */
export interface getBasicConfigDetailQueryInterface {
  configEnum: string; // 配置枚举(THEME_CFG/主题设置)
}
export async function getBasicConfigDetail(params: getBasicConfigDetailQueryInterface = {}, config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/basic-config/detail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 全局设置 保存/更新
 * import { postBasicConfigGlobal } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfigGlobal(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/basic-config/global`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 基础配置信息
 * import { getBasicConfigInfo } from "/@/apis/gct-apaas/BasicConfigController"
 */
export interface getBasicConfigInfoQueryInterface {
  pageType: string; // pageType
}
export async function getBasicConfigInfo(params: getBasicConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBasicConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/basic-config/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 主题设置 保存/更新
 * import { postBasicConfigTheme } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfigTheme(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/basic-config/theme`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBasicConfigByKey } from "/@/apis/gct-apaas/BasicConfigController"
 */
export interface putBasicConfigByKeyPathInterface {
  key: string; // key
}
export async function putBasicConfigByKey(path: putBasicConfigByKeyPathInterface, data: BasicConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/basic-config/${path?.key}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}