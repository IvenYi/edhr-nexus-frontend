import request from '@mobile/utils/request';
import type { UserGroupRequest, ResponseEntitystring, UserGroupDragRequest, ResponseEntityUserGroupResponse, ResponseEntityListUserGroupResponse, ResponseEntityListstring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postUserGroup } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function postUserGroup(data: UserGroupRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteUserGroup } from "/@/apis/gct-apaas/UserGroupController"
 */
export interface deleteUserGroupQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserGroup(params: deleteUserGroupQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postUserGroupDrag } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function postUserGroupDrag(data: UserGroupDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getUserGroupInfo } from "/@/apis/gct-apaas/UserGroupController"
 */
export interface getUserGroupInfoQueryInterface {
  id: string; // id
}
export async function getUserGroupInfo(params: getUserGroupInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserGroupResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserGroupList } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function getUserGroupList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserGroupResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 搜索
 * import { getUserGroupSearch } from "/@/apis/gct-apaas/UserGroupController"
 */
export interface getUserGroupSearchQueryInterface {
  keyword: string; // 关键字
  type: string; // 搜索项类型：USER_GROUP/MEMBER/ROLE/MODEL
}
export async function getUserGroupSearch(params: getUserGroupSearchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserGroupResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/search`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取用户权限点
 * import { getUserGroupUserRolePermissionList } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function getUserGroupUserRolePermissionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/user/role/permission/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putUserGroupById } from "/@/apis/gct-apaas/UserGroupController"
 */
export interface putUserGroupByIdPathInterface {
  id: string; // id
}
export async function putUserGroupById(path: putUserGroupByIdPathInterface, data: UserGroupRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}