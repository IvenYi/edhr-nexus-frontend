import request from '@mobile/utils/request';
import type { BiShareRequest, ResponseEntitystring, ResponseEntityBiShareResponse, ResponseEntityListBiShareResponse, ResponseEntityPageBaseBiShareResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postBiShare } from "/@/apis/gct-platform/BiShareController"
 */
export async function postBiShare(data: BiShareRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteBiShare } from "/@/apis/gct-platform/BiShareController"
 */
export interface deleteBiShareQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBiShare(params: deleteBiShareQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getBiShareInfo } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiShareInfoQueryInterface {
  id?: string; // id
  shareId?: string; // shareId
}
export async function getBiShareInfo(params: getBiShareInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBiShareResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getBiShareList } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiShareListQueryInterface {
  projectId?: string; // projectId
}
export async function getBiShareList(params: getBiShareListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListBiShareResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getBiSharePageList } from "/@/apis/gct-platform/BiShareController"
 */
export interface getBiSharePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBiSharePageList(params: getBiSharePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseBiShareResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBiShareById } from "/@/apis/gct-platform/BiShareController"
 */
export interface putBiShareByIdPathInterface {
  id: string; // id
}
export async function putBiShareById(path: putBiShareByIdPathInterface, data: BiShareRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/bi-share/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}