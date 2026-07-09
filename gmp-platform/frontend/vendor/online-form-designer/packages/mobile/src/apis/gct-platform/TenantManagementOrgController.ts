import request from '@mobile/utils/request';
import type { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, OrgMoveUserRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postTenantManagementOrg } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrg(data: OrgRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteTenantManagementOrg } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface deleteTenantManagementOrgQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTenantManagementOrg(params: deleteTenantManagementOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postTenantManagementOrgDrag } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgDrag(data: OrgDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTenantManagementOrgInfoById } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getTenantManagementOrgInfoById(path: getTenantManagementOrgInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTenantManagementOrgList } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function getTenantManagementOrgList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 转移并删除
 * import { postTenantManagementOrgTransferAndDelete } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgTransferAndDelete(data: OrgTransferAndDeleteRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/transferAndDelete`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 添加用户
 * import { postTenantManagementOrgUserAdd } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserAdd(data: OrgAddOrUpdateUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/add`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建并添加用户
 * import { postTenantManagementOrgUserCreateAndAdd } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserCreateAndAdd(data: OrgCreateAndAddUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/createAndAdd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询用户详情
 * import { getTenantManagementOrgUserInfo } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgUserInfoQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getTenantManagementOrgUserInfo(params: getTenantManagementOrgUserInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移动用户
 * import { postTenantManagementOrgUserMove } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserMove(data: OrgMoveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 组织用户分页查询
 * import { getTenantManagementOrgUserPageList } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgUserPageListQueryInterface {
  allUserOption?: number; // 是否显示下级
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  orgId: string; // 部门id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  source?: number; // 参数来源，0企业后台管理、1租户后台管理
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getTenantManagementOrgUserPageList(params: getTenantManagementOrgUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移除用户
 * import { postTenantManagementOrgUserRemove } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserRemove(data: OrgRemoveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 编辑用户
 * import { postTenantManagementOrgUserUpdate } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserUpdate(data: OrgAddOrUpdateUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/user/update`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTenantManagementOrgById } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface putTenantManagementOrgByIdPathInterface {
  id: string; // id
}
export async function putTenantManagementOrgById(path: putTenantManagementOrgByIdPathInterface, data: OrgRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/tenant/management/org/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}