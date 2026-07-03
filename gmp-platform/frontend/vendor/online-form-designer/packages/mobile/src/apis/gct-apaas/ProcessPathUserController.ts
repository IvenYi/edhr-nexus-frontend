import request from '@mobile/utils/request';
import type { ProcessPathUserRequest, ResponseEntitystring, ResponseEntityProcessPathUserResponse, ResponseEntityListProcessPathUserResponse, ResponseEntityPageBaseProcessPathUserResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessPathUser } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export async function postProcessPathUser(data: ProcessPathUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessPathUser } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface deleteProcessPathUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessPathUser(params: deleteProcessPathUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessPathUserInfo } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface getProcessPathUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessPathUserInfo(params: getProcessPathUserInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessPathUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessPathUserList } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export async function getProcessPathUserList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessPathUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessPathUserPageList } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface getProcessPathUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessPathUserPageList(params: getProcessPathUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessPathUserResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessPathUserById } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface putProcessPathUserByIdPathInterface {
  id: string; // id
}
export async function putProcessPathUserById(path: putProcessPathUserByIdPathInterface, data: ProcessPathUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-path-user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}