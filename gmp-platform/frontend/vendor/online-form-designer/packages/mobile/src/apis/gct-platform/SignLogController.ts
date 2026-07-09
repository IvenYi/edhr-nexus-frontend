import request from '@mobile/utils/request';
import type { SignLogRequestDTO, ResponseEntitystring, ResponseEntitySignLogResponse, ResponseEntityListSignLogResponse, SignLogRequest, ResponseEntityListUserInfo, ResponseEntityPageBaseSignLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSignLog } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLog(data: SignLogRequestDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteSignLog } from "/@/apis/gct-platform/SignLogController"
 */
export interface deleteSignLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSignLog(params: deleteSignLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getSignLogInfo } from "/@/apis/gct-platform/SignLogController"
 */
export interface getSignLogInfoQueryInterface {
  id: string; // id
}
export async function getSignLogInfo(params: getSignLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySignLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSignLogList } from "/@/apis/gct-platform/SignLogController"
 */
export async function getSignLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSignLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 操作人
 * import { postSignLogOperators } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLogOperators(data: SignLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserInfo['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log/operators`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postSignLogPageList } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLogPageList(data: SignLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSignLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putSignLogById } from "/@/apis/gct-platform/SignLogController"
 */
export interface putSignLogByIdPathInterface {
  id: string; // id
}
export async function putSignLogById(path: putSignLogByIdPathInterface, data: SignLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/sign-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}