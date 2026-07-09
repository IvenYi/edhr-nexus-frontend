import request from '@mobile/utils/request';
import type { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppUser } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUser(data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppUser } from "/@/apis/gct-apaas/AppUserController"
 */
export async function deleteAppUser(data: TenantUserRemoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user`,
      method: 'delete',
      data,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 禁用
 * import { putAppUserDisable } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserDisableQueryInterface {
  ids: string; // ids
}
export async function putAppUserDisable(params: putAppUserDisableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/disable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putAppUserEnable } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserEnableQueryInterface {
  ids: string; // ids
}
export async function putAppUserEnable(params: putAppUserEnableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/enable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppUserInfoById } from "/@/apis/gct-apaas/AppUserController"
 */
export interface getAppUserInfoByIdPathInterface {
  id: string; // id
}
export async function getAppUserInfoById(path: getAppUserInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppUserPageList } from "/@/apis/gct-apaas/AppUserController"
 */
export interface getAppUserPageListQueryInterface {
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getAppUserPageList(params: getAppUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移除
 * import { postAppUserRemove } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserRemove(data: TenantUserRemoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置密码
 * import { postAppUserResetDefaultPwd } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserResetDefaultPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/reset/default/pwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postAppUserResetDefaultSignPwd } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserResetDefaultSignPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/reset/default/signPwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppUserById } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserByIdPathInterface {
  id: string; // id
}
export async function putAppUserById(path: putAppUserByIdPathInterface, data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}