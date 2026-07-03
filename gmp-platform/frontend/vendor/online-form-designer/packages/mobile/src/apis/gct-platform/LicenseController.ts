import request from '@mobile/utils/request';
import type { ResponseEntitystring, LicenseAuthRequest, ResponseEntityboolean, ResponseEntityListClientsDto, ResponseEntityAuthBasicInfo, ResponseEntityAppEffectiveLicense, ResponseEntityListLicenseExpireMsg, ResponseEntityListLicenseLimitResponse, ResponseEntityPageBaseAcLicenseResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 平台和应用激活
 * import { getLicenseActivate } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseActivateQueryInterface {
  appId?: string; // 应用id
  authorizationCode: string; // 激活码
  increment?: boolean; // 增量激活
  suiteKey?: string; // 应用Key
  version?: string; // 平台版本
}
export async function getLicenseActivate(params: getLicenseActivateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/license/activate`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 平台和应用激活
 * import { postLicenseActivates } from "/@/apis/gct-platform/LicenseController"
 */
export interface postLicenseActivatesQueryInterface {
  increment?: boolean; // 增量激活
}
export async function postLicenseActivates(data: LicenseAuthRequest[], params: postLicenseActivatesQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/license/activates`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 平台和应用激活
 * import { postLicenseActivatesOffline } from "/@/apis/gct-platform/LicenseController"
 */
export interface postLicenseActivatesOfflineQueryInterface {
  appId?: string; // 应用id
  productType: string; // 应用Key
}
export async function postLicenseActivatesOffline(params: postLicenseActivatesOfflineQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/license/activatesOffline`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 证书校验，用于平台登录前判断是否在有效期
 * import { getLicenseCheckLicense } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseCheckLicense(config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/checkLicense`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取在线客户端
 * import { getLicenseClients } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseClientsQueryInterface {
  appId: string; // appId
}
export async function getLicenseClients(params: getLicenseClientsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListClientsDto['data']> {
  return request(
    {
      url: `/gct-platform/api/license/clients`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 离线授权获取二维码信息
 * import { getLicenseGetAppBasicInfo } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseGetAppBasicInfoQueryInterface {
  appId?: string; // 应用id
}
export async function getLicenseGetAppBasicInfo(params: getLicenseGetAppBasicInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAuthBasicInfo['data']> {
  return request(
    {
      url: `/gct-platform/api/license/getAppBasicInfo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用有效授权
 * import { getLicenseGetAppEffectiveLicense } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseGetAppEffectiveLicenseQueryInterface {
  appId: string; // 应用id
  env: string; // 环境
}
export async function getLicenseGetAppEffectiveLicense(params: getLicenseGetAppEffectiveLicenseQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppEffectiveLicense['data']> {
  return request(
    {
      url: `/gct-platform/api/license/getAppEffectiveLicense`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取过期提醒
 * import { getLicenseGetExpireMsg } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseGetExpireMsgQueryInterface {
  appId?: string; // 应用id
  env?: string; // 授权环境
}
export async function getLicenseGetExpireMsg(params: getLicenseGetExpireMsgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListLicenseExpireMsg['data']> {
  return request(
    {
      url: `/gct-platform/api/license/getExpireMsg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 判断是否满足用户数授权条件
 * import { getLicenseGetUsers } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseGetUsersQueryInterface {
  appId?: string; // 应用id
  clientId: string; // 客户端id
  env?: string; // 环境
}
export async function getLicenseGetUsers(params: getLicenseGetUsersQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/getUsers`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 平台应用，授权详情
 * import { getLicenseInfo } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseInfoQueryInterface {
  licenseId: string; // licenseId授权信息id
}
export async function getLicenseInfo(params: getLicenseInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListLicenseLimitResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/license/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 判断对应模块是否已进行授权
 * import { getLicenseModuleAuth } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseModuleAuthQueryInterface {
  module?: string; // 授权模块
}
export async function getLicenseModuleAuth(params: getLicenseModuleAuthQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/moduleAuth`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 平台/应用，授权列表
 * import { getLicensePageList } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicensePageListQueryInterface {
  appId?: string; // 应用id
  env?: string; // 授权环境
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  productType?: string; // 产品类型
}
export async function getLicensePageList(params: getLicensePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAcLicenseResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/license/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 判断是否为被共享应用
 * import { getLicenseShareTag } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseShareTagQueryInterface {
  appId?: string; // 应用id
}
export async function getLicenseShareTag(params: getLicenseShareTagQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/shareTag`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 判断是否为共享应用
 * import { getLicenseSourceTag } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseSourceTagQueryInterface {
  appId?: string; // 应用id
}
export async function getLicenseSourceTag(params: getLicenseSourceTagQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/sourceTag`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 授权解绑
 * import { getLicenseUnbind } from "/@/apis/gct-platform/LicenseController"
 */
export interface getLicenseUnbindQueryInterface {
  appId?: string; // appId
  env?: string; // 授权环境
  licenseId: string; // licenseId授权信息id
}
export async function getLicenseUnbind(params: getLicenseUnbindQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/unbind`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 执行shell脚本并清空授权
 * import { getLicenseUninstall } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseUninstall(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/license/uninstall`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 环境校验
 * import { getLicenseVerify } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseVerify(config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/license/verify`,
      method: 'get',
      ...config,
    },
  );
}