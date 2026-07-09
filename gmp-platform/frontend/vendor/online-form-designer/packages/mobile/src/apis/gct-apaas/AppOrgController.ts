import request from '@mobile/utils/request';
import type { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, OrgMoveUserRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppOrg } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrg(data: OrgRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppOrg } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface deleteAppOrgQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppOrg(params: deleteAppOrgQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postAppOrgDrag } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgDrag(data: OrgDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppOrgInfoById } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getAppOrgInfoById(path: getAppOrgInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppOrgList } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function getAppOrgList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 转移并删除
 * import { postAppOrgTransferAndDelete } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgTransferAndDelete(data: OrgTransferAndDeleteRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/transferAndDelete`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 添加用户
 * import { postAppOrgUserAdd } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserAdd(data: OrgAddOrUpdateUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/add`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建并添加用户
 * import { postAppOrgUserCreateAndAdd } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserCreateAndAdd(data: OrgCreateAndAddUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/createAndAdd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询用户详情
 * import { getAppOrgUserInfo } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgUserInfoQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getAppOrgUserInfo(params: getAppOrgUserInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移动用户
 * import { postAppOrgUserMove } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserMove(data: OrgMoveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 组织用户分页查询
 * import { getAppOrgUserPageList } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgUserPageListQueryInterface {
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
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getAppOrgUserPageList(params: getAppOrgUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移除用户
 * import { postAppOrgUserRemove } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserRemove(data: OrgRemoveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 编辑用户
 * import { postAppOrgUserUpdate } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserUpdate(data: OrgAddOrUpdateUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/user/update`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppOrgById } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface putAppOrgByIdPathInterface {
  id: string; // id
}
export async function putAppOrgById(path: putAppOrgByIdPathInterface, data: OrgRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-org/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}