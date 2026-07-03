import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityboolean, AppSettingRequest, ResponseEntityAppSettingDtoResponse, AppSettingDtoRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteAppSetting } from "/@/apis/gct-platform/AppSettingController"
 */
export interface deleteAppSettingQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppSetting(params: deleteAppSettingQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting`,
      method: 'delete',
      params,
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
export async function getAppSettingCheckAppUserAdmin(params: getAppSettingCheckAppUserAdminQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/checkAppUserAdmin`,
      method: 'get',
      params,
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
export async function getAppSettingCheckAppUserVisibility(params: getAppSettingCheckAppUserVisibilityQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/checkAppUserVisibility`,
      method: 'get',
      params,
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
export async function deleteAppSettingDeveloperDelete(params: deleteAppSettingDeveloperDeleteQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/developer/delete`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppSettingDeveloperSaveSettingBatch } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingDeveloperSaveSettingBatch(data: AppSettingRequest[], config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/developer/saveSettingBatch`,
      method: 'post',
      data,
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
export async function getAppSettingInfoByAppId(params: getAppSettingInfoByAppIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppSettingDtoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/infoByAppId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postAppSettingSaveSetting } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingSaveSetting(data: AppSettingDtoRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/saveSetting`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppSettingSaveSettingBatch } from "/@/apis/gct-platform/AppSettingController"
 */
export async function postAppSettingSaveSettingBatch(data: AppSettingRequest[], config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-setting/saveSettingBatch`,
      method: 'post',
      data,
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
export async function getAppSettingInfoByAppId(params: getAppSettingInfoByAppIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppSettingDtoResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-setting/infoByAppId`,
      method: 'get',
      params,
      ...config,
    },
  );
}