import request from '@mobile/utils/request';
import type { DashboardRequest, ResponseEntitystring, ResponseEntityDashboardResponse, ResponseEntityListDashboardResponse, DashboardSortRequest, ResponseEntityPageBaseDashboardResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDashboard } from "/@/apis/gct-apaas/DashboardController"
 */
export async function postDashboard(data: DashboardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDashboard } from "/@/apis/gct-apaas/DashboardController"
 */
export interface deleteDashboardQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDashboard(params: deleteDashboardQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDashboardInfo } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardInfoQueryInterface {
  id: string; // id
}
export async function getDashboardInfo(params: getDashboardInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDashboardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDashboardList } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardListQueryInterface {
  name?: string; // 名称
}
export async function getDashboardList(params: getDashboardListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDashboardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移动位置
 * import { postDashboardMove } from "/@/apis/gct-apaas/DashboardController"
 */
export async function postDashboardMove(data: DashboardSortRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard/move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDashboardPageList } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDashboardPageList(params: getDashboardPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDashboardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDashboardById } from "/@/apis/gct-apaas/DashboardController"
 */
export interface putDashboardByIdPathInterface {
  id: string; // id
}
export async function putDashboardById(path: putDashboardByIdPathInterface, data: DashboardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dashboard/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}