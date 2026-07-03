import request from '@mobile/utils/request';
import type { AppVersionRequest, ResponseEntitystring, ResponseEntityAppVersionResponse, ResponseEntityListAppVersionResponse, ResponseEntityPageBaseAppVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppVersion } from "/@/apis/gct-apaas/AppVersionController"
 */
export async function postAppVersion(data: AppVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppVersion } from "/@/apis/gct-apaas/AppVersionController"
 */
export interface deleteAppVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppVersion(params: deleteAppVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAppVersionInfo } from "/@/apis/gct-apaas/AppVersionController"
 */
export interface getAppVersionInfoQueryInterface {
  id: string; // id
}
export async function getAppVersionInfo(params: getAppVersionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppVersionList } from "/@/apis/gct-apaas/AppVersionController"
 */
export async function getAppVersionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppVersionPageList } from "/@/apis/gct-apaas/AppVersionController"
 */
export interface getAppVersionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppVersionPageList(params: getAppVersionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppVersionById } from "/@/apis/gct-apaas/AppVersionController"
 */
export interface putAppVersionByIdPathInterface {
  id: string; // id
}
export async function putAppVersionById(path: putAppVersionByIdPathInterface, data: AppVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-version/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}