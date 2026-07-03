import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, LicenseAuthRequest, ResponseEntityboolean, ResponseEntityListClientsDto, ResponseEntityAuthBasicInfo, ResponseEntityAppEffectiveLicense, ResponseEntityListLicenseExpireMsg, ResponseEntityListLicenseLimitResponse, ResponseEntityPageBaseAcLicenseResponse } from './model/index';

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
export async function getLicenseActivate(params: getLicenseActivateQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/activate`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postLicenseActivates(data: LicenseAuthRequest[], params: postLicenseActivatesQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/license/activates`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postLicenseActivatesOffline(data: any, params: postLicenseActivatesOfflineQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/license/activatesOffline`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 证书校验，用于平台登录前判断是否在有效期
 * import { getLicenseCheckLicense } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseCheckLicense(config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/checkLicense`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseClients(params: getLicenseClientsQueryInterface = {}, config = {}): Promise<ResponseEntityListClientsDto['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/clients`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseGetAppBasicInfo(params: getLicenseGetAppBasicInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAuthBasicInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/getAppBasicInfo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseGetAppEffectiveLicense(params: getLicenseGetAppEffectiveLicenseQueryInterface = {}, config = {}): Promise<ResponseEntityAppEffectiveLicense['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/getAppEffectiveLicense`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseGetExpireMsg(params: getLicenseGetExpireMsgQueryInterface = {}, config = {}): Promise<ResponseEntityListLicenseExpireMsg['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/getExpireMsg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseGetUsers(params: getLicenseGetUsersQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/getUsers`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseInfo(params: getLicenseInfoQueryInterface = {}, config = {}): Promise<ResponseEntityListLicenseLimitResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseModuleAuth(params: getLicenseModuleAuthQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/moduleAuth`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicensePageList(params: getLicensePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAcLicenseResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseShareTag(params: getLicenseShareTagQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/shareTag`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseSourceTag(params: getLicenseSourceTagQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/sourceTag`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLicenseUnbind(params: getLicenseUnbindQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/unbind`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 执行shell脚本并清空授权
 * import { getLicenseUninstall } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseUninstall(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/uninstall`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 环境校验
 * import { getLicenseVerify } from "/@/apis/gct-platform/LicenseController"
 */
export async function getLicenseVerify(config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/license/verify`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}