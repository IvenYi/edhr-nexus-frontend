import { defHttp } from '@/utils/http/axios';
import { AppGrantedUserRequest, ResponseEntitystring, AppGrantedUserBatchRequest, ResponseEntityListUserResponse, ResponseEntityAppGrantedStatisticDTO, ResponseEntityPageBaseUserResponse } from './model/index';

/**
 * 保存
 * import { postAppGrantedUserExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface postAppGrantedUserExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppGrantedUserExternal(data: AppGrantedUserRequest, params: postAppGrantedUserExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app-granted-user`,
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
 * 批量保存
 * import { postAppGrantedUserBatchExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface postAppGrantedUserBatchExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppGrantedUserBatchExternal(data: AppGrantedUserBatchRequest, params: postAppGrantedUserBatchExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app-granted-user/batch`,
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
 * 查询应用下人员席位：由deleted控制是否查询处被移出席位的人员
 * import { getAppGrantedUserFindAllByDeletedExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserFindAllByDeletedExternalQueryInterface {
  appId: string; // appId
  deleted?: number; // deleted
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserFindAllByDeletedExternal(params: getAppGrantedUserFindAllByDeletedExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/findAllByDeleted`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用授权统计信息
 * import { getAppGrantedUserGrantedStatisticExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserGrantedStatisticExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppGrantedUserGrantedStatisticExternal(params: getAppGrantedUserGrantedStatisticExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAppGrantedStatisticDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/grantedStatistic`,
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
 * import { getAppGrantedUserListExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserListExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserListExternal(params: getAppGrantedUserListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppGrantedUserPageListExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserPageListExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  fullname?: string; // fullname
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
  searchTag: number; // searchTag
  tenantId: string; // tenantId
  username?: string; // username
}
export async function getAppGrantedUserPageListExternal(params: getAppGrantedUserPageListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 席位移除和转移
 * import { getAppGrantedUserRemoveAndTransferExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserRemoveAndTransferExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  sUserId: string; // sUserId
  tUserId: string; // tUserId
}
export async function getAppGrantedUserRemoveAndTransferExternal(params: getAppGrantedUserRemoveAndTransferExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/removeAndTransfer`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 未授权用户列表
 * import { getAppGrantedUserUngrantedListExternal } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserUngrantedListExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserUngrantedListExternal(params: getAppGrantedUserUngrantedListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app-granted-user/ungranted/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}