import request from '@mobile/utils/request';
import type { AppGrantedUserRequest, ResponseEntitystring, AppGrantedUserBatchRequest, ResponseEntityAppGrantedStatisticDTO, ResponseEntityListUserResponse, ResponseEntityPageBaseUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppGrantedUser } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export async function postAppGrantedUser(data: AppGrantedUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppGrantedUserBatch } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export async function postAppGrantedUserBatch(data: AppGrantedUserBatchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/batch`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取应用授权统计信息
 * import { getAppGrantedUserGrantedStatistic } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export interface getAppGrantedUserGrantedStatisticQueryInterface {
  appId?: string; // 应用id（可以不传）
}
export async function getAppGrantedUserGrantedStatistic(params: getAppGrantedUserGrantedStatisticQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppGrantedStatisticDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/grantedStatistic`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppGrantedUserList } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export interface getAppGrantedUserListQueryInterface {
  appId?: string; // 应用id（可以不传）
}
export async function getAppGrantedUserList(params: getAppGrantedUserListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppGrantedUserPageList } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export interface getAppGrantedUserPageListQueryInterface {
  appId?: string; // 应用id（可以不传）
  fullname?: string; // 姓名
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  username?: string; // 用户名
}
export async function getAppGrantedUserPageList(params: getAppGrantedUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 席位移除和转移
 * import { getAppGrantedUserRemoveAndTransfer } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export interface getAppGrantedUserRemoveAndTransferQueryInterface {
  appId?: string; // 应用id（可以不传）
  sUserId: string; // 源用户id
  tUserId: string; // 目标用户id
}
export async function getAppGrantedUserRemoveAndTransfer(params: getAppGrantedUserRemoveAndTransferQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/removeAndTransfer`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 未授权用户列表
 * import { getAppGrantedUserUngrantedList } from "/@/apis/gct-platform/AppGrantedUserController"
 */
export interface getAppGrantedUserUngrantedListQueryInterface {
  appId?: string; // 应用id（可以不传）
}
export async function getAppGrantedUserUngrantedList(params: getAppGrantedUserUngrantedListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-granted-user/ungranted/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}