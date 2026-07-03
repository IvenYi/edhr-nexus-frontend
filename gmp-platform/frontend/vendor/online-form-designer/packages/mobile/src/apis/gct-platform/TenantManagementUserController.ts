import request from '@mobile/utils/request';
import type { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTenantManagementUser } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUser(data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTenantManagementUser } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function deleteTenantManagementUser(data: TenantUserRemoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user`,
      method: 'delete',
      data,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 禁用
 * import { putTenantManagementUserDisable } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserDisableQueryInterface {
  ids: string; // ids
}
export async function putTenantManagementUserDisable(params: putTenantManagementUserDisableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/disable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putTenantManagementUserEnable } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserEnableQueryInterface {
  ids: string; // ids
}
export async function putTenantManagementUserEnable(params: putTenantManagementUserEnableQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/enable`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTenantManagementUserInfoById } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface getTenantManagementUserInfoByIdPathInterface {
  id: string; // id
}
export async function getTenantManagementUserInfoById(path: getTenantManagementUserInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTenantManagementUserPageList } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface getTenantManagementUserPageListQueryInterface {
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
export async function getTenantManagementUserPageList(params: getTenantManagementUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移除
 * import { postTenantManagementUserRemove } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserRemove(data: TenantUserRemoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置登录密码
 * import { postTenantManagementUserResetDefaultPwd } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserResetDefaultPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/reset/default/pwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postTenantManagementUserResetDefaultSignPwd } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserResetDefaultSignPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/reset/default/signPwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTenantManagementUserById } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserByIdPathInterface {
  id: string; // id
}
export async function putTenantManagementUserById(path: putTenantManagementUserByIdPathInterface, data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}