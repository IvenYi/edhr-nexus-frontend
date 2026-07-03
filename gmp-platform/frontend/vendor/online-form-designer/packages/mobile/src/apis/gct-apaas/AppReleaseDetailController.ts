import request from '@mobile/utils/request';
import type { AppReleaseDetailRequest, ResponseEntitystring, ResponseEntityAppReleaseDetailResponse, ResponseEntityListAppReleaseDetailResponse, ResponseEntityPageBaseAppReleaseDetailResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppReleaseDetail } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export async function postAppReleaseDetail(data: AppReleaseDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppReleaseDetail } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export interface deleteAppReleaseDetailQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppReleaseDetail(params: deleteAppReleaseDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAppReleaseDetailInfo } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export interface getAppReleaseDetailInfoQueryInterface {
  id: string; // id
}
export async function getAppReleaseDetailInfo(params: getAppReleaseDetailInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppReleaseDetailResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppReleaseDetailList } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export async function getAppReleaseDetailList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppReleaseDetailResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppReleaseDetailPageList } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export interface getAppReleaseDetailPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppReleaseDetailPageList(params: getAppReleaseDetailPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppReleaseDetailResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppReleaseDetailById } from "/@/apis/gct-apaas/AppReleaseDetailController"
 */
export interface putAppReleaseDetailByIdPathInterface {
  id: string; // id
}
export async function putAppReleaseDetailById(path: putAppReleaseDetailByIdPathInterface, data: AppReleaseDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-release-detail/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}