import request from '@mobile/utils/request';
import type { DatasourceMoveDetailRequest, ResponseEntitystring, ResponseEntityDatasourceMoveDetailResponse, ResponseEntityListDatasourceMoveDetailResponse, ResponseEntityPageBaseDatasourceMoveDetailResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatasourceMoveDetail } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export async function postDatasourceMoveDetail(data: DatasourceMoveDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDatasourceMoveDetail } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface deleteDatasourceMoveDetailQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMoveDetail(params: deleteDatasourceMoveDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasourceMoveDetailInfo } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveDetailInfo(params: getDatasourceMoveDetailInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDatasourceMoveDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatasourceMoveDetailList } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailListQueryInterface {
  id: string; // 迁移任务Id
}
export async function getDatasourceMoveDetailList(params: getDatasourceMoveDetailListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDatasourceMoveDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDatasourceMoveDetailPageList } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasourceMoveDetailPageList(params: getDatasourceMoveDetailPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDatasourceMoveDetailResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasourceMoveDetailById } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface putDatasourceMoveDetailByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveDetailById(path: putDatasourceMoveDetailByIdPathInterface, data: DatasourceMoveDetailRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-detail/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}