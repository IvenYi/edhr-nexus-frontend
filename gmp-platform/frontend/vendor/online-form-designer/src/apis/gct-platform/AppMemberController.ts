import { defHttp } from '@/utils/http/axios';
import { AppMemberRequest, ResponseEntitystring, ResponseEntityAppMemberResponse, ResponseEntityListAppMemberResponse, ResponseEntityPageBaseAppMemberResponse } from './model/index';

/**
 * 保存
 * import { postAppMember } from "/@/apis/gct-platform/AppMemberController"
 */
export async function postAppMember(data: AppMemberRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app-member`,
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
 * import { deleteAppMember } from "/@/apis/gct-platform/AppMemberController"
 */
export interface deleteAppMemberQueryInterface {
  id: string; // 删除的id
}
export async function deleteAppMember(params: deleteAppMemberQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/app-member`,
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
 * 详情
 * import { getAppMemberInfo } from "/@/apis/gct-platform/AppMemberController"
 */
export interface getAppMemberInfoQueryInterface {
  id: string; // id
}
export async function getAppMemberInfo(params: getAppMemberInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAppMemberResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-member/info`,
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
 * import { getAppMemberList } from "/@/apis/gct-platform/AppMemberController"
 */
export interface getAppMemberListQueryInterface {
  appId: string; // appId
  appMemberRole?: string; // appMemberRole
  fullname?: string; // fullname
}
export async function getAppMemberList(params: getAppMemberListQueryInterface = {}, config = {}): Promise<ResponseEntityListAppMemberResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-member/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppMemberPageList } from "/@/apis/gct-platform/AppMemberController"
 */
export interface getAppMemberPageListQueryInterface {
  fullname?: string; // fullname
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppMemberPageList(params: getAppMemberPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppMemberResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app-member/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移交
 * import { putAppMemberTransferByIdByTargetUserId } from "/@/apis/gct-platform/AppMemberController"
 */
export interface putAppMemberTransferByIdByTargetUserIdPathInterface {
  id: string; // id
  targetUserId: string; // targetUserId
}
export async function putAppMemberTransferByIdByTargetUserId(path: putAppMemberTransferByIdByTargetUserIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app-member/transfer/${path?.id}/${path?.targetUserId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改角色
 * import { putAppMemberByIdByRole } from "/@/apis/gct-platform/AppMemberController"
 */
export interface putAppMemberByIdByRolePathInterface {
  id: string; // id
  role: string; // role
}
export async function putAppMemberByIdByRole(path: putAppMemberByIdByRolePathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app-member/${path?.id}/${path?.role}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}