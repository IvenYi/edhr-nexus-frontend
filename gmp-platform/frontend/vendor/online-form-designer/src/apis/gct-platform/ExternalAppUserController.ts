import { defHttp } from '@/utils/http/axios';
import { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, TenantUserSearchRequest, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO, UserAndOrgRequest, ResponseEntity } from './model/index';

/**
 * 保存
 * import { postAppUserExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface postAppUserExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppUserExternal(data: UserSaveRequest, params: postAppUserExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user`,
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
 * 删除
 * import { deleteAppUserExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface deleteAppUserExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function deleteAppUserExternal(data: TenantUserRemoveRequest, params: deleteAppUserExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/external/api/app/user`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 禁用
 * import { putAppUserDisableExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserDisableExternalQueryInterface {
  ids: string; // ids
}
export async function putAppUserDisableExternal(params: putAppUserDisableExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/app/user/disable`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putAppUserEnableExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserEnableExternalQueryInterface {
  ids: string; // ids
}
export async function putAppUserEnableExternal(params: putAppUserEnableExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/app/user/enable`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppUserInfoByIdExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface getAppUserInfoByIdExternalPathInterface {
  id: string; // id
}
export async function getAppUserInfoByIdExternal(path: getAppUserInfoByIdExternalPathInterface, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/user/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAppUserPageListExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserPageListExternal(data: TenantUserSearchRequest, config = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除
 * import { postAppUserRemoveExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserRemoveExternal(data: TenantUserRemoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置密码
 * import { postAppUserResetDefaultPwdExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserResetDefaultPwdExternal(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user/reset/default/pwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postAppUserResetDefaultSignPwdExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserResetDefaultSignPwdExternal(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user/reset/default/signPwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存多用户
 * import { postAppUserSaveListExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface postAppUserSaveListExternalQueryInterface {
  defaultOrgId?: string; // defaultOrgId
  tenantId: string; // tenantId
}
export async function postAppUserSaveListExternal(data: UserAndOrgRequest[], params: postAppUserSaveListExternalQueryInterface = {}, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/user/save-list`,
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
 * 修改
 * import { putAppUserByIdExternal } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserByIdExternalPathInterface {
  id: string; // id
}
export async function putAppUserByIdExternal(path: putAppUserByIdExternalPathInterface, data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/app/user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}