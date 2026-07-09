import request from '@mobile/utils/request';
import type { ProcessMessageUserRequest, ResponseEntitystring, ResponseEntityProcessMessageUserResponse, ResponseEntityListProcessMessageUserResponse, ResponseEntityPageBaseProcessMessageUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessMessageUser } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export async function postProcessMessageUser(data: ProcessMessageUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessMessageUser } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface deleteProcessMessageUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessMessageUser(params: deleteProcessMessageUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessMessageUserInfo } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface getProcessMessageUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessMessageUserInfo(params: getProcessMessageUserInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessMessageUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessMessageUserList } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export async function getProcessMessageUserList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessMessageUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessMessageUserPageList } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface getProcessMessageUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessMessageUserPageList(params: getProcessMessageUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessMessageUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessMessageUserById } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface putProcessMessageUserByIdPathInterface {
  id: string; // id
}
export async function putProcessMessageUserById(path: putProcessMessageUserByIdPathInterface, data: ProcessMessageUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-message-user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}