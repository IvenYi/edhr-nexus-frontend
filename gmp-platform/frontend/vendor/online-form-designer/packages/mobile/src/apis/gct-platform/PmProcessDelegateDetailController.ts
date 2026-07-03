import request from '@mobile/utils/request';
import type { PmProcessDelegateDetailRequest, ResponseEntitystring, ResponseEntityPmProcessDelegateDetailResponse, ResponseEntityListPmProcessDelegateDetailResponse, ResponseEntityPageBasePmProcessDelegateDetailResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmProcessDelegateDetail } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export async function postPmProcessDelegateDetail(data: PmProcessDelegateDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmProcessDelegateDetail } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface deletePmProcessDelegateDetailQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDelegateDetail(params: deletePmProcessDelegateDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPmProcessDelegateDetailInfo } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface getPmProcessDelegateDetailInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDelegateDetailInfo(params: getPmProcessDelegateDetailInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessDelegateDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmProcessDelegateDetailList } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export async function getPmProcessDelegateDetailList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPmProcessDelegateDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessDelegateDetailPageList } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface getPmProcessDelegateDetailPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPmProcessDelegateDetailPageList(params: getPmProcessDelegateDetailPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessDelegateDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmProcessDelegateDetailById } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface putPmProcessDelegateDetailByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDelegateDetailById(path: putPmProcessDelegateDetailByIdPathInterface, data: PmProcessDelegateDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}