import request from '@mobile/utils/request';
import type { ResponseEntityListPickerOrgDTO, AppOrgUserPageRequest, ResponseEntityPageBasePickerUserDTO, ResponseEntityListPickerUserDTO, UserDetailRequest, ResponseEntitystring, ResponseEntityPageBaseUserResponse, ResponseEntityListUserResponse, ResponseEntityMapstringint } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取应用可见组织
 * import { getSeatAppGetVisibleOrg } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatAppGetVisibleOrg(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/app/getVisibleOrg`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可见组织下的人员
 * import { postSeatAppGetVisibleOrgUser } from "/@/apis/gct-platform/SeatController"
 */
export async function postSeatAppGetVisibleOrgUser(data: AppOrgUserPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/app/getVisibleOrgUser`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取应用可见用户
 * import { getSeatAppGetVisibleUser } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatAppGetVisibleUser(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/app/getVisibleUser`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 用户授权
 * import { postSeatAuth } from "/@/apis/gct-platform/SeatController"
 */
export async function postSeatAuth(data: UserDetailRequest[], config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/auth`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 已授权用户列表
 * import { getSeatListAuthed } from "/@/apis/gct-platform/SeatController"
 */
export interface getSeatListAuthedQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  tenantId?: string; // 租户id
  type?: string; // 类型：平台-platform；套件
  username?: string; // 用户名或账号
}
export async function getSeatListAuthed(params: getSeatListAuthedQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/listAuthed`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询未经授权的用户列表
 * import { getSeatListNotAuth } from "/@/apis/gct-platform/SeatController"
 */
export interface getSeatListNotAuthQueryInterface {
  tenantId?: string; // 租户
  type?: string; // 类型：平台-platform；套件
  username?: string; // 用户名或账号
}
export async function getSeatListNotAuth(params: getSeatListNotAuthQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/listNotAuth`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移除已授权用户
 * import { postSeatRemoveAuth } from "/@/apis/gct-platform/SeatController"
 */
export interface postSeatRemoveAuthQueryInterface {
  type?: string; // 类型：平台-platform；套件
}
export async function postSeatRemoveAuth(data: undefined[], params: postSeatRemoveAuthQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/removeAuth`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 席位总数/剩余可用信息
 * import { getSeatTotalinfos } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatTotalinfos(config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringint['data']> {
  return request(
    {
      url: `/gct-platform/api/seat/totalinfos`,
      method: 'get',
      ...config,
    },
  );
}