import { defHttp } from '@/utils/http/axios';
import { UserGroupRequest, ResponseEntitystring, UserGroupDragRequest, ResponseEntityUserGroupResponse, ResponseEntityListUserGroupResponse, ResponseEntityListstring } from './model/index';

/**
 * 保存
 * import { postUserGroup } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function postUserGroup(data: UserGroupRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/user-group`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteUserGroup(params: deleteUserGroupQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/user-group`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 拖拽
 * import { postUserGroupDrag } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function postUserGroupDrag(data: UserGroupDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/user-group/drag`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getUserGroupInfo(params: getUserGroupInfoQueryInterface = {}, config = {}): Promise<ResponseEntityUserGroupResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/user-group/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserGroupList } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function getUserGroupList(config = {}): Promise<ResponseEntityListUserGroupResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/user-group/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getUserGroupSearch(params: getUserGroupSearchQueryInterface = {}, config = {}): Promise<ResponseEntityListUserGroupResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/user-group/search`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取用户权限点
 * import { getUserGroupUserRolePermissionList } from "/@/apis/gct-apaas/UserGroupController"
 */
export async function getUserGroupUserRolePermissionList(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/user-group/user/role/permission/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putUserGroupById(path: putUserGroupByIdPathInterface, data: UserGroupRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/user-group/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}