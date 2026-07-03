import request from '@mobile/utils/request';
import type { UserInfoLogRequest, ResponseEntitystring, ResponseEntityUserInfoLogResponse, ResponseEntityListUserInfoLogResponse, ResponseEntityPageBaseUserInfoLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postUserInfoLog } from "/@/apis/gct-platform/UserInfoLogController"
 */
export async function postUserInfoLog(data: UserInfoLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteUserInfoLog } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface deleteUserInfoLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserInfoLog(params: deleteUserInfoLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getUserInfoLogInfo } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface getUserInfoLogInfoQueryInterface {
  id: string; // id
}
export async function getUserInfoLogInfo(params: getUserInfoLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserInfoLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserInfoLogList } from "/@/apis/gct-platform/UserInfoLogController"
 */
export async function getUserInfoLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserInfoLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getUserInfoLogPageList } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface getUserInfoLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  userId?: string; // 用户id
}
export async function getUserInfoLogPageList(params: getUserInfoLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserInfoLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putUserInfoLogById } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface putUserInfoLogByIdPathInterface {
  id: string; // id
}
export async function putUserInfoLogById(path: putUserInfoLogByIdPathInterface, data: UserInfoLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user-info-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}