import request from '@mobile/utils/request';
import type { UserExtraRequest, ResponseEntitystring, ResponseEntityUserExtraResponse, ResponseEntityListUserExtraResponse, ResponseEntityPageBaseUserExtraResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postUserExtra } from "/@/apis/gct-platform/UserExtraController"
 */
export async function postUserExtra(data: UserExtraRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteUserExtra } from "/@/apis/gct-platform/UserExtraController"
 */
export interface deleteUserExtraQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserExtra(params: deleteUserExtraQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getUserExtraInfo } from "/@/apis/gct-platform/UserExtraController"
 */
export interface getUserExtraInfoQueryInterface {
  id: string; // id
}
export async function getUserExtraInfo(params: getUserExtraInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserExtraResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserExtraList } from "/@/apis/gct-platform/UserExtraController"
 */
export async function getUserExtraList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserExtraResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getUserExtraPageList } from "/@/apis/gct-platform/UserExtraController"
 */
export interface getUserExtraPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getUserExtraPageList(params: getUserExtraPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserExtraResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putUserExtraById } from "/@/apis/gct-platform/UserExtraController"
 */
export interface putUserExtraByIdPathInterface {
  id: string; // id
}
export async function putUserExtraById(path: putUserExtraByIdPathInterface, data: UserExtraRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-extra/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}