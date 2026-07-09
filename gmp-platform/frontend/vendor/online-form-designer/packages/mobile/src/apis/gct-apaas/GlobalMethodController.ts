import request from '@mobile/utils/request';
import type { GlobalMethodRequest, ResponseEntitystring, ResponseEntityLocalDateTime, ResponseEntityGlobalMethodResponse, ResponseEntityListGlobalMethodResponse, ResponseEntityPageBaseGlobalMethodResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postGlobalMethod } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function postGlobalMethod(data: GlobalMethodRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteGlobalMethod } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface deleteGlobalMethodQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteGlobalMethod(params: deleteGlobalMethodQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取当前时间
 * import { getGlobalMethodCurrentTime } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function getGlobalMethodCurrentTime(config:AxiosRequestConfig = {}): Promise<ResponseEntityLocalDateTime['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method/currentTime`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getGlobalMethodInfo } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface getGlobalMethodInfoQueryInterface {
  id: string; // id
}
export async function getGlobalMethodInfo(params: getGlobalMethodInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityGlobalMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getGlobalMethodList } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function getGlobalMethodList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListGlobalMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getGlobalMethodPageList } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface getGlobalMethodPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getGlobalMethodPageList(params: getGlobalMethodPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseGlobalMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putGlobalMethodById } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface putGlobalMethodByIdPathInterface {
  id: string; // id
}
export async function putGlobalMethodById(path: putGlobalMethodByIdPathInterface, data: GlobalMethodRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/global-method/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}