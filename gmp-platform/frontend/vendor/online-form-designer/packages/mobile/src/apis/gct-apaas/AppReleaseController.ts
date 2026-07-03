import request from '@mobile/utils/request';
import type { ResponseEntityAppReleaseResponse, ResponseEntityListAppReleaseResponse, ResponseEntityPageBaseAppReleaseResponse, AppReleaseReleaseRequest, ResponseEntitystring, ResponseEntityListstring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 详情
 * import { getAppReleaseInfo } from "/@/apis/gct-apaas/AppReleaseController"
 */
export interface getAppReleaseInfoQueryInterface {
  id: string; // id
}
export async function getAppReleaseInfo(params: getAppReleaseInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppReleaseResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppReleaseList } from "/@/apis/gct-apaas/AppReleaseController"
 */
export async function getAppReleaseList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppReleaseResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppReleasePageList } from "/@/apis/gct-apaas/AppReleaseController"
 */
export interface getAppReleasePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppReleasePageList(params: getAppReleasePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppReleaseResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发布
 * import { postAppReleaseRelease } from "/@/apis/gct-apaas/AppReleaseController"
 */
export async function postAppReleaseRelease(data: AppReleaseReleaseRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release/release`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试h2
 * import { postAppReleaseTest } from "/@/apis/gct-apaas/AppReleaseController"
 */
export async function postAppReleaseTest(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release/test`,
      method: 'post',
      ...config,
    },
  );
}