import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListPickerUserDTO, ResponseEntityListPickerOrgDTO, ResponseEntityPageBasePickerUserDTO, AppOrgUserPageRequest } from './model/index';

/**
 * 后台查询指定id的用户
 * import { getOrgUserPickerManagementUserListByIds } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerManagementUserListByIdsQueryInterface {
  ids?: array; // ids
}
export async function getOrgUserPickerManagementUserListByIds(params: getOrgUserPickerManagementUserListByIdsQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org-user-picker/management/user/listByIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 租户后台查询所有组织
 * import { getOrgUserPickerTenantManagementOrgList } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function getOrgUserPickerTenantManagementOrgList(config = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/org/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getOrgUserPickerTenantManagementOrgUserPageList(params: getOrgUserPickerTenantManagementOrgUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/org/user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getOrgUserPickerTenantManagementUserListByIds(params: getOrgUserPickerTenantManagementUserListByIdsQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org-user-picker/tenant/management/user/listByIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织
 * import { getOrgUserPickerAppGetCanBeUsedOrgExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetCanBeUsedOrgExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetCanBeUsedOrgExternal(params: getOrgUserPickerAppGetCanBeUsedOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getCanBeUsedOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织下的用户
 * import { postOrgUserPickerAppGetCanBeUsedOrgUserExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function postOrgUserPickerAppGetCanBeUsedOrgUserExternal(data: AppOrgUserPageRequest, config = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getCanBeUsedOrgUser`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织
 * import { getOrgUserPickerAppGetVisibleOrgExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetVisibleOrgExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetVisibleOrgExternal(params: getOrgUserPickerAppGetVisibleOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleOrg`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织下的人员
 * import { postOrgUserPickerAppGetVisibleOrgUserExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export async function postOrgUserPickerAppGetVisibleOrgUserExternal(data: AppOrgUserPageRequest, config = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleOrgUser`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见用户
 * import { getOrgUserPickerAppGetVisibleUserExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppGetVisibleUserExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppGetVisibleUserExternal(params: getOrgUserPickerAppGetVisibleUserExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/org-user-picker/app/getVisibleUser`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 应用获取指定用户
 * import { getOrgUserPickerAppListUserByIdsExternal } from "/@/apis/gct-platform/OrgUserPickerController"
 */
export interface getOrgUserPickerAppListUserByIdsExternalQueryInterface {
  ids: array; // ids
  tenantId: string; // tenantId
}
export async function getOrgUserPickerAppListUserByIdsExternal(params: getOrgUserPickerAppListUserByIdsExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/org-user-picker/app/listUserByIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}