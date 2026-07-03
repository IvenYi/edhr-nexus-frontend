import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityboolean, AppSettingRequest, ResponseEntityAppSettingDtoResponse, AppSettingDtoRequest } from './model/index';

/**
 * 删除
 * import { deleteAppSetting } from "/@/apis/gct-platform/AppSettingController"
 */
export interface deleteAppSettingQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppSetting(params: deleteAppSettingQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/app-setting`,
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
 * 检查用户是否是应用管理员
 * import { getAppSettingCheckAppUserAdmin } from "/@/apis/gct-platform/AppSettingController"
 */
export interface getAppSettingCheckAppUserAdminQueryInterface {
  appEnv?: string; // appEnv
  appId: string; // appId
  userId: string; // userId
}
export async function getAppSettingCheckAppUserAdmin(params: getAppSettingCheckAppUserAdminQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-setting/checkAppUserAdmin`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 检查用户是否是属于应用可见范围内
 * import { getAppSettingCheckAppUserVisibility } from "/@/apis/gct-platform/AppSettingController"
 */
export interface getAppSettingCheckAppUserVisibilityQueryInterface {
  appEnv?: string; // appEnv
  appId: string; // appId
  userId: string; // userId
}
export async function getAppSettingCheckAppUserVisibility(params: getAppSettingCheckAppUserVisibilityQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-setting/checkAppUserVisibility`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppSettingDeveloperDelete } from "/@/apis/gct-platform/AppSettingController"
 */
export interface deleteAppSettingDeveloperDeleteQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppSettingDeveloperDelete(params: deleteAppSettingDeveloperDeleteQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/app-setting/developer/delete`,
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
 * 批量保存
 * import { postAppSettingDeveloperSaveSettingBatch } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingDeveloperSaveSettingBatch(data: AppSettingRequest[], config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app-setting/developer/saveSettingBatch`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppSettingInfoByAppId } from "/@/apis/gct-platform/AppSettingController"
 */
export interface getAppSettingInfoByAppIdQueryInterface {
  appEnv?: string; // appEnv
  appId: string; // appId
}
export async function getAppSettingInfoByAppId(params: getAppSettingInfoByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityAppSettingDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-setting/infoByAppId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postAppSettingSaveSetting } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingSaveSetting(data: AppSettingDtoRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app-setting/saveSetting`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppSettingSaveSettingBatch } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingSaveSettingBatch(data: AppSettingRequest[], config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app-setting/saveSettingBatch`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppSettingInfoByAppIdExternal } from "/@/apis/gct-platform/AppSettingController"
 */
export interface getAppSettingInfoByAppIdExternalQueryInterface {
  appEnv?: string; // appEnv
  appId: string; // appId
}
export async function getAppSettingInfoByAppIdExternal(params: getAppSettingInfoByAppIdExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAppSettingDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-setting/infoByAppId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}