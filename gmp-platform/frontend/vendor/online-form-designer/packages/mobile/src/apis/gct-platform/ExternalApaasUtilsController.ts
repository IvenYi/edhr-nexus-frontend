import request from '@mobile/utils/request';
import type { ResponseEntityOrg, ResponseEntitystring, ResponseEntityListstring, ResponseEntityListPrintServiceTreeVO, ResponseEntitySearchAllOrgOrUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询用户的主部门
 * import { getApaasUtilsGetUserMasterOrg } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsGetUserMasterOrgQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsGetUserMasterOrg(params: getApaasUtilsGetUserMasterOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrg['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/getUserMasterOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询用户的主部门id
 * import { getApaasUtilsGetUserMasterOrgId } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsGetUserMasterOrgIdQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsGetUserMasterOrgId(params: getApaasUtilsGetUserMasterOrgIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/getUserMasterOrgId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出用户的所有部门id
 * import { getApaasUtilsListUserAllOrgId } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllOrgIdQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllOrgId(params: getApaasUtilsListUserAllOrgIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllOrgId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取用户所在的所有部门id，包括父部门
 * import { getApaasUtilsListUserAllOrgIdIncludeParent } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllOrgIdIncludeParentQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllOrgIdIncludeParent(params: getApaasUtilsListUserAllOrgIdIncludeParentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllOrgIdIncludeParent`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取用户所在的所有部门id，包括父部门
 * import { getApaasUtilsListUserAllPrincipalOrgId } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllPrincipalOrgIdQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllPrincipalOrgId(params: getApaasUtilsListUserAllPrincipalOrgIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllPrincipalOrgId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出用户的直属下级
 * import { getApaasUtilsListUserDirectSubordinate } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserDirectSubordinateQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserDirectSubordinate(params: getApaasUtilsListUserDirectSubordinateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserDirectSubordinate`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出传入部门下的所有用户
 * import { getApaasUtilsListUserIdUnderOrg } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderOrgQueryInterface {
  orgIds: array; // orgIds
}
export async function getApaasUtilsListUserIdUnderOrg(params: getApaasUtilsListUserIdUnderOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出用户所在部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserAllOrg } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserAllOrgQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserAllOrg(params: getApaasUtilsListUserIdUnderUserAllOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserAllOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出用户负责部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserAllPrincipalOrg } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserAllPrincipalOrgQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserAllPrincipalOrg(params: getApaasUtilsListUserIdUnderUserAllPrincipalOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserAllPrincipalOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列出用户主部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserMasterOrg } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserMasterOrgQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserMasterOrg(params: getApaasUtilsListUserIdUnderUserMasterOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserMasterOrg`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取打印机下拉集合 
 * import { getApaasUtilsPrintDropdownList } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export async function getApaasUtilsPrintDropdownList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintServiceTreeVO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/printDropdownList`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可见组织
 * import { getApaasUtilsSearchAllOrgOrUser } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsSearchAllOrgOrUserQueryInterface {
  keyword: string; // keyword
}
export async function getApaasUtilsSearchAllOrgOrUser(params: getApaasUtilsSearchAllOrgOrUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySearchAllOrgOrUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/apaas-utils/searchAllOrgOrUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}