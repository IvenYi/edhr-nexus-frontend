import request from '@mobile/utils/request';
import type { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, TenantUserSearchRequest, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO, UserAndOrgRequest, ResponseEntity } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppUser } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface postAppUserQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppUser(data: UserSaveRequest, params: postAppUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppUser } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface deleteAppUserQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function deleteAppUser(data: TenantUserRemoveRequest, params: deleteAppUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user`,
      method: 'delete',
      params,
      data,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 禁用
 * import { putAppUserDisable } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserDisableQueryInterface {
  ids: string; // ids
}
export async function putAppUserDisable(params: putAppUserDisableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/disable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putAppUserEnable } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserEnableQueryInterface {
  ids: string; // ids
}
export async function putAppUserEnable(params: putAppUserEnableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/enable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppUserInfoById } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface getAppUserInfoByIdPathInterface {
  id: string; // id
}
export async function getAppUserInfoById(path: getAppUserInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAppUserPageList } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserPageList(data: TenantUserSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 移除
 * import { postAppUserRemove } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserRemove(data: TenantUserRemoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置密码
 * import { postAppUserResetDefaultPwd } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserResetDefaultPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/reset/default/pwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postAppUserResetDefaultSignPwd } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export async function postAppUserResetDefaultSignPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/reset/default/signPwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存多用户
 * import { postAppUserSaveList } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface postAppUserSaveListQueryInterface {
  defaultOrgId?: string; // defaultOrgId
  tenantId: string; // tenantId
}
export async function postAppUserSaveList(data: UserAndOrgRequest[], params: postAppUserSaveListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/save-list`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppUserById } from "/@/apis/gct-platform/ExternalAppUserController"
 */
export interface putAppUserByIdPathInterface {
  id: string; // id
}
export async function putAppUserById(path: putAppUserByIdPathInterface, data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}