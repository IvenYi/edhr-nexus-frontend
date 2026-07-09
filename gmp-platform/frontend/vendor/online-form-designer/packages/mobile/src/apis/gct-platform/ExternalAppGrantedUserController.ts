import request from '@mobile/utils/request';
import type { AppGrantedUserRequest, ResponseEntitystring, AppGrantedUserBatchRequest, ResponseEntityListUserResponse, ResponseEntityAppGrantedStatisticDTO, ResponseEntityPageBaseUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppGrantedUser } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface postAppGrantedUserQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppGrantedUser(data: AppGrantedUserRequest, params: postAppGrantedUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppGrantedUserBatch } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface postAppGrantedUserBatchQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppGrantedUserBatch(data: AppGrantedUserBatchRequest, params: postAppGrantedUserBatchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/batch`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 查询应用下人员席位：由deleted控制是否查询处被移出席位的人员
 * import { getAppGrantedUserFindAllByDeleted } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserFindAllByDeletedQueryInterface {
  appId: string; // appId
  deleted?: number; // deleted
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserFindAllByDeleted(params: getAppGrantedUserFindAllByDeletedQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/findAllByDeleted`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用授权统计信息
 * import { getAppGrantedUserGrantedStatistic } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserGrantedStatisticQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppGrantedUserGrantedStatistic(params: getAppGrantedUserGrantedStatisticQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppGrantedStatisticDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/grantedStatistic`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppGrantedUserList } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserListQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserList(params: getAppGrantedUserListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppGrantedUserPageList } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserPageListQueryInterface {
  appId: string; // appId
  env: string; // env
  fullname?: string; // fullname
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
  searchTag: number; // searchTag
  tenantId: string; // tenantId
  username?: string; // username
}
export async function getAppGrantedUserPageList(params: getAppGrantedUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 席位移除和转移
 * import { getAppGrantedUserRemoveAndTransfer } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserRemoveAndTransferQueryInterface {
  appId: string; // appId
  env: string; // env
  sUserId: string; // sUserId
  tUserId: string; // tUserId
}
export async function getAppGrantedUserRemoveAndTransfer(params: getAppGrantedUserRemoveAndTransferQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/removeAndTransfer`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 未授权用户列表
 * import { getAppGrantedUserUngrantedList } from "/@/apis/gct-platform/ExternalAppGrantedUserController"
 */
export interface getAppGrantedUserUngrantedListQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getAppGrantedUserUngrantedList(params: getAppGrantedUserUngrantedListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app-granted-user/ungranted/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}