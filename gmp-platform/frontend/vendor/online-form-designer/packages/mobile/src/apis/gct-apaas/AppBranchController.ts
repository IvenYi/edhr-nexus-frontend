import request from '@mobile/utils/request';
import type { AppBranchRequest, ResponseEntitystring, ResponseEntityAppBranchResponse, ResponseEntityListAppBranchResponse, ResponseEntityPageBaseAppBranchResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppBranch } from "/@/apis/gct-apaas/AppBranchController"
 */
export async function postAppBranch(data: AppBranchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppBranch } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface deleteAppBranchQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppBranch(params: deleteAppBranchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAppBranchInfo } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface getAppBranchInfoQueryInterface {
  id: string; // id
}
export async function getAppBranchInfo(params: getAppBranchInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppBranchList } from "/@/apis/gct-apaas/AppBranchController"
 */
export async function getAppBranchList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppBranchPageList } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface getAppBranchPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppBranchPageList(params: getAppBranchPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppBranchById } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface putAppBranchByIdPathInterface {
  id: string; // id
}
export async function putAppBranchById(path: putAppBranchByIdPathInterface, data: AppBranchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-branch/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}