import { defHttp } from '@/utils/http/axios';
import { ResponseEntityOrg, ResponseEntitystring, ResponseEntityListstring, ResponseEntityListPrintServiceTreeVO, ResponseEntitySearchAllOrgOrUserResponse } from './model/index';

/**
 * 查询用户的主部门
 * import { getApaasUtilsGetUserMasterOrgExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsGetUserMasterOrgExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsGetUserMasterOrgExternal(params: getApaasUtilsGetUserMasterOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityOrg['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/getUserMasterOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询用户的主部门id
 * import { getApaasUtilsGetUserMasterOrgIdExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsGetUserMasterOrgIdExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsGetUserMasterOrgIdExternal(params: getApaasUtilsGetUserMasterOrgIdExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/getUserMasterOrgId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出用户的所有部门id
 * import { getApaasUtilsListUserAllOrgIdExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllOrgIdExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllOrgIdExternal(params: getApaasUtilsListUserAllOrgIdExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllOrgId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取用户所在的所有部门id，包括父部门
 * import { getApaasUtilsListUserAllOrgIdIncludeParentExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllOrgIdIncludeParentExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllOrgIdIncludeParentExternal(params: getApaasUtilsListUserAllOrgIdIncludeParentExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllOrgIdIncludeParent`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取用户所在的所有部门id，包括父部门
 * import { getApaasUtilsListUserAllPrincipalOrgIdExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserAllPrincipalOrgIdExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserAllPrincipalOrgIdExternal(params: getApaasUtilsListUserAllPrincipalOrgIdExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserAllPrincipalOrgId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出用户的直属下级
 * import { getApaasUtilsListUserDirectSubordinateExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserDirectSubordinateExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserDirectSubordinateExternal(params: getApaasUtilsListUserDirectSubordinateExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserDirectSubordinate`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出传入部门下的所有用户
 * import { getApaasUtilsListUserIdUnderOrgExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderOrgExternalQueryInterface {
  orgIds: array; // orgIds
}
export async function getApaasUtilsListUserIdUnderOrgExternal(params: getApaasUtilsListUserIdUnderOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出用户所在部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserAllOrgExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserAllOrgExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserAllOrgExternal(params: getApaasUtilsListUserIdUnderUserAllOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserAllOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出用户负责部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserAllPrincipalOrgExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserAllPrincipalOrgExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserAllPrincipalOrgExternal(params: getApaasUtilsListUserIdUnderUserAllPrincipalOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserAllPrincipalOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列出用户主部门下的所有用户
 * import { getApaasUtilsListUserIdUnderUserMasterOrgExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsListUserIdUnderUserMasterOrgExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getApaasUtilsListUserIdUnderUserMasterOrgExternal(params: getApaasUtilsListUserIdUnderUserMasterOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/listUserIdUnderUserMasterOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取打印机下拉集合 
 * import { getApaasUtilsPrintDropdownListExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export async function getApaasUtilsPrintDropdownListExternal(config = {}): Promise<ResponseEntityListPrintServiceTreeVO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/printDropdownList`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织
 * import { getApaasUtilsSearchAllOrgOrUserExternal } from "/@/apis/gct-platform/ExternalApaasUtilsController"
 */
export interface getApaasUtilsSearchAllOrgOrUserExternalQueryInterface {
  keyword: string; // keyword
}
export async function getApaasUtilsSearchAllOrgOrUserExternal(params: getApaasUtilsSearchAllOrgOrUserExternalQueryInterface = {}, config = {}): Promise<ResponseEntitySearchAllOrgOrUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/apaas-utils/searchAllOrgOrUser`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}