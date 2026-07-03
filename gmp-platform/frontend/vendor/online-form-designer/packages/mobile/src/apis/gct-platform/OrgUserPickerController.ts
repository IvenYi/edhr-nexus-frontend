import request from '@mobile/utils/request';
import type { ResponseEntityListPickerUserDTO, ResponseEntityListPickerOrgDTO, ResponseEntityPageBasePickerUserDTO, AppOrgUserPageRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 后台查询指定id的用户
 * import { getOrgUserPickerManagementUserListByIds } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerManagementUserListByIdsQueryInterface {
  ids?: array; // ids
}
export async function getOrgUserPickerManagementUserListByIds(params: getOrgUserPickerManagementUserListByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/org-user-picker/management/user/listByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 租户后台查询所有组织
 * import { getOrgUserPickerTenantManagementOrgList } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function getOrgUserPickerTenantManagementOrgList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/org/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 租户后台分页查询指定部门下的用户
 * import { getOrgUserPickerTenantManagementOrgUserPageList } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerTenantManagementOrgUserPageListQueryInterface {
  keyword?: string; // 关键字
  orgId?: string; // 部门id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getOrgUserPickerTenantManagementOrgUserPageList(params: getOrgUserPickerTenantManagementOrgUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/org/user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 租户后台查询指定id的用户
 * import { getOrgUserPickerTenantManagementUserListByIds } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerTenantManagementUserListByIdsQueryInterface {
  ids?: array; // ids
}
export async function getOrgUserPickerTenantManagementUserListByIds(params: getOrgUserPickerTenantManagementUserListByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/user/listByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织
 * import { getOrgUserPickerAppGetCanBeUsedOrg } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetCanBeUsedOrgQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetCanBeUsedOrg(params: getOrgUserPickerAppGetCanBeUsedOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getCanBeUsedOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织下的用户
 * import { postOrgUserPickerAppGetCanBeUsedOrgUser } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function postOrgUserPickerAppGetCanBeUsedOrgUser(data: AppOrgUserPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getCanBeUsedOrgUser`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织
 * import { getOrgUserPickerAppGetVisibleOrg } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetVisibleOrgQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetVisibleOrg(params: getOrgUserPickerAppGetVisibleOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织下的人员
 * import { postOrgUserPickerAppGetVisibleOrgUser } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function postOrgUserPickerAppGetVisibleOrgUser(data: AppOrgUserPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleOrgUser`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取应用可见用户
 * import { getOrgUserPickerAppGetVisibleUser } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetVisibleUserQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetVisibleUser(params: getOrgUserPickerAppGetVisibleUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 应用获取指定用户
 * import { getOrgUserPickerAppListUserByIds } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppListUserByIdsQueryInterface {
  ids: array; // ids
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppListUserByIds(params: getOrgUserPickerAppListUserByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org-user-picker/app/listUserByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}