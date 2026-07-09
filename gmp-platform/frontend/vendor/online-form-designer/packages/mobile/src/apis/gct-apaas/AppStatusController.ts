import request from '@mobile/utils/request';
import type { ResponseEntityListMenuConfig, ResponseEntityPageBaseAppRelease, ResponseEntityAppRelease, ResponseEntityMapstringobject, ResponseEntitystring, AppDataRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 根据appid获取应用菜单
 * import { getAppGetAppMenu } from "/@/apis/gct-apaas/AppStatusController"
 */
export interface getAppGetAppMenuQueryInterface {
  appId: string; // appId
  menuType: string; // menuType
}
export async function getAppGetAppMenu(params: getAppGetAppMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMenuConfig['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getAppMenu`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid获取发布记录
 * import { getAppGetAppRelease } from "/@/apis/gct-apaas/AppStatusController"
 */
export interface getAppGetAppReleaseQueryInterface {
  appId: string; // appId
  pageIndex: number; // pageIndex
  pageSize: number; // pageSize
}
export async function getAppGetAppRelease(params: getAppGetAppReleaseQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppRelease['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getAppRelease`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid和发布记录主键获取发布记录详情
 * import { getAppGetAppReleaseDetail } from "/@/apis/gct-apaas/AppStatusController"
 */
export interface getAppGetAppReleaseDetailQueryInterface {
  appId: string; // appId
  releaseId: string; // releaseId
}
export async function getAppGetAppReleaseDetail(params: getAppGetAppReleaseDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppRelease['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getAppReleaseDetail`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用状态
 * import { getAppGetAppState } from "/@/apis/gct-apaas/AppStatusController"
 */
export interface getAppGetAppStateQueryInterface {
  appIds: string; // appIds
}
export async function getAppGetAppState(params: getAppGetAppStateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getAppState`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用发布的最新版本号
 * import { getAppGetCurrentProdAppVersionTag } from "/@/apis/gct-apaas/AppStatusController"
 */
export interface getAppGetCurrentProdAppVersionTagQueryInterface {
  appId: string; // appId
}
export async function getAppGetCurrentProdAppVersionTag(params: getAppGetCurrentProdAppVersionTagQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getCurrentProdAppVersionTag`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 更改平台app信息时同步更改应用内部的app配置信息
 * import { postAppUpdatePlatformAppSetting } from "/@/apis/gct-apaas/AppStatusController"
 */
export async function postAppUpdatePlatformAppSetting(data: AppDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/updatePlatformAppSetting`,
      method: 'post',
      data,
      ...config,
    },
  );
}