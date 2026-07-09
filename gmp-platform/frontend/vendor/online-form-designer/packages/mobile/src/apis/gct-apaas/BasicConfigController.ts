import request from '@mobile/utils/request';
import type { BasicConfigRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntityBasicConfigResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 基础配置保存/修改
 * import { postBasicConfig } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfig(data: BasicConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 是否启用ai知识库
 * import { getBasicConfigAiRagEnabled } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function getBasicConfigAiRagEnabled(config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/aiRagEnabled`,
      method: 'get',
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
export async function getBasicConfigDetail(params: getBasicConfigDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/detail`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 全局设置 保存/更新
 * import { postBasicConfigGlobal } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfigGlobal(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/global`,
      method: 'post',
      data,
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
export async function getBasicConfigInfo(params: getBasicConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBasicConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 主题设置 保存/更新
 * import { postBasicConfigTheme } from "/@/apis/gct-apaas/BasicConfigController"
 */
export async function postBasicConfigTheme(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/theme`,
      method: 'post',
      data,
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
export async function putBasicConfigByKey(path: putBasicConfigByKeyPathInterface, data: BasicConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/basic-config/${path?.key}`,
      method: 'put',
      data,
      ...config,
    },
  );
}