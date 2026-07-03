import request from '@mobile/utils/request';
import type { ScriptVersionRequest, ResponseEntitystring, ResponseEntityScriptVersionResponse, ResponseEntityListScriptVersionResponse, ResponseEntityPageBaseScriptVersionResponse, VersionActive } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postScriptVersion } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function postScriptVersion(data: ScriptVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteScriptVersion } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface deleteScriptVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteScriptVersion(params: deleteScriptVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getScriptVersionInfo } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface getScriptVersionInfoQueryInterface {
  id: string; // id
}
export async function getScriptVersionInfo(params: getScriptVersionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityScriptVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getScriptVersionList } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function getScriptVersionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListScriptVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getScriptVersionPageList } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface getScriptVersionPageListQueryInterface {
  active?: number; // 激活状态
  endTime?: string; // 结束时间
  id?: string; // 主键id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  scriptKey?: string; // 脚本Key
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  version?: string; // 版本
}
export async function getScriptVersionPageList(params: getScriptVersionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseScriptVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 激活指定版本
 * import { putScriptVersionSetVersionActive } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function putScriptVersionSetVersionActive(data: VersionActive, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version/setVersionActive`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putScriptVersionById } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface putScriptVersionByIdPathInterface {
  id: string; // id
}
export async function putScriptVersionById(path: putScriptVersionByIdPathInterface, data: ScriptVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}