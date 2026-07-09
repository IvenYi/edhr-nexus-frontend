import request from '@mobile/utils/request';
import type { AppMemberRequest, ResponseEntitystring, ResponseEntityAppMemberResponse, ResponseEntityListAppMemberResponse, ResponseEntityPageBaseAppMemberResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppMember } from "/@/apis/gct-platform/AppMemberController"
 */
export async function postAppMember(data: AppMemberRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member`,
      method: 'post',
      data,
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
export async function deleteAppMember(params: deleteAppMemberQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member`,
      method: 'delete',
      params,
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
export async function getAppMemberInfo(params: getAppMemberInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppMemberResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member/info`,
      method: 'get',
      params,
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
export async function getAppMemberList(params: getAppMemberListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppMemberResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member/list`,
      method: 'get',
      params,
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
export async function getAppMemberPageList(params: getAppMemberPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppMemberResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member/page/list`,
      method: 'get',
      params,
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
export async function putAppMemberTransferByIdByTargetUserId(path: putAppMemberTransferByIdByTargetUserIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member/transfer/${path?.id}/${path?.targetUserId}`,
      method: 'put',
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
export async function putAppMemberByIdByRole(path: putAppMemberByIdByRolePathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/app-member/${path?.id}/${path?.role}`,
      method: 'put',
      ...config,
    },
  );
}