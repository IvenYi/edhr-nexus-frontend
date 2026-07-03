import { defHttp } from '@/utils/http/axios';
import { AppGlobalSettingsRequest, ResponseEntitystring, ResponseEntityListAppGlobalSettingsResponse } from './model/index';

/**
 * 保存
 * import { postAppGlobalSettings } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export async function postAppGlobalSettings(data: AppGlobalSettingsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-global-settings`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteAppGlobalSettings(params: deleteAppGlobalSettingsQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/app-global-settings`,
      params,
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
 * import { getAppGlobalSettingsInfo } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface getAppGlobalSettingsInfoQueryInterface {
  fullInfo?: boolean; // 查询全量信息时传 true，否则只查询简要信息
  ids?: string; // 查询的id，多个按','分割
  keys?: string; // 查询的key，多个按','分割
}
export async function getAppGlobalSettingsInfo(params: getAppGlobalSettingsInfoQueryInterface = {}, config = {}): Promise<ResponseEntityListAppGlobalSettingsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-global-settings/info`,
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
 * import { getAppGlobalSettingsList } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface getAppGlobalSettingsListQueryInterface {
  fullInfo?: boolean; // 查询全量信息时传 true，否则只查询简要信息
  type: string; // 类型
}
export async function getAppGlobalSettingsList(params: getAppGlobalSettingsListQueryInterface = {}, config = {}): Promise<ResponseEntityListAppGlobalSettingsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-global-settings/list`,
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
 * import { putAppGlobalSettingsById } from "/@/apis/gct-apaas/AppGlobalSettingsController"
 */
export interface putAppGlobalSettingsByIdPathInterface {
  id: string; // id
}
export async function putAppGlobalSettingsById(path: putAppGlobalSettingsByIdPathInterface, data: AppGlobalSettingsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-global-settings/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}