import request from '@mobile/utils/request';
import type { ProcessApproveUserRequest, ResponseEntitystring, ResponseEntityProcessApproveUserResponse, ResponseEntityListProcessApproveUserResponse, ResponseEntityPageBaseProcessApproveUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessApproveUser } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export async function postProcessApproveUser(data: ProcessApproveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessApproveUser } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface deleteProcessApproveUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessApproveUser(params: deleteProcessApproveUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessApproveUserInfo } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface getProcessApproveUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessApproveUserInfo(params: getProcessApproveUserInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessApproveUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessApproveUserList } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export async function getProcessApproveUserList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessApproveUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessApproveUserPageList } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface getProcessApproveUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessApproveUserPageList(params: getProcessApproveUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessApproveUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessApproveUserById } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface putProcessApproveUserByIdPathInterface {
  id: string; // id
}
export async function putProcessApproveUserById(path: putProcessApproveUserByIdPathInterface, data: ProcessApproveUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approve-user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}