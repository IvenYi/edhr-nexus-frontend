import request from '@mobile/utils/request';
import type { AppGlobalSettingsRequest, ResponseEntitystring, ResponseEntityListAppGlobalSettingsResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppGlobalSettings } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export async function postAppGlobalSettings(data: AppGlobalSettingsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-global-settings`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppGlobalSettings } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface deleteAppGlobalSettingsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppGlobalSettings(params: deleteAppGlobalSettingsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-global-settings`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAppGlobalSettingsInfo } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface getAppGlobalSettingsInfoQueryInterface {
  fullInfo?: boolean; // 查询全量信息时传 true，否则只查询简要信息
  ids?: string; // 查询的id，多个按','分割
  keys?: string; // 查询的key，多个按','分割
}
export async function getAppGlobalSettingsInfo(params: getAppGlobalSettingsInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppGlobalSettingsResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-global-settings/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppGlobalSettingsList } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface getAppGlobalSettingsListQueryInterface {
  fullInfo?: boolean; // 查询全量信息时传 true，否则只查询简要信息
  type: string; // 类型
}
export async function getAppGlobalSettingsList(params: getAppGlobalSettingsListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppGlobalSettingsResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-global-settings/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppGlobalSettingsById } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface putAppGlobalSettingsByIdPathInterface {
  id: string; // id
}
export async function putAppGlobalSettingsById(path: putAppGlobalSettingsByIdPathInterface, data: AppGlobalSettingsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-global-settings/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}