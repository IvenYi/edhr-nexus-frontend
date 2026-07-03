import request from '@mobile/utils/request';
import type { PluginVersionRequest, ResponseEntitystring, ResponseEntityPluginVersionResponse, ResponseEntityListPluginVersionResponse, ResponseEntityPageBasePluginVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPluginVersion } from "/@/apis/gct-platform/PluginVersionController"
 */
export async function postPluginVersion(data: PluginVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除版本
 * import { deletePluginVersion } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface deletePluginVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePluginVersion(params: deletePluginVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPluginVersionInfo } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface getPluginVersionInfoQueryInterface {
  id: string; // id
}
export async function getPluginVersionInfo(params: getPluginVersionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPluginVersionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { postPluginVersionList } from "/@/apis/gct-platform/PluginVersionController"
 */
export async function postPluginVersionList(data: PluginVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPluginVersionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPluginVersionPageList } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface getPluginVersionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPluginVersionPageList(params: getPluginVersionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePluginVersionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPluginVersionById } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface putPluginVersionByIdPathInterface {
  id: string; // id
}
export async function putPluginVersionById(path: putPluginVersionByIdPathInterface, data: PluginVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plugin-version/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}