import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntitySqlViewModelResponse, ResponseEntityListSqlViewModelResponse, ResponseEntityPageBaseSqlViewModelResponse, SqlViewModelRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteSqlViewModel } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface deleteSqlViewModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSqlViewModel(params: deleteSqlViewModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view-model`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getSqlViewModelInfo } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface getSqlViewModelInfoQueryInterface {
  modelKey?: string; // 表单模型key
}
export async function getSqlViewModelInfo(params: getSqlViewModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySqlViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view-model/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSqlViewModelList } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export async function getSqlViewModelList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSqlViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view-model/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSqlViewModelPageList } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface getSqlViewModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getSqlViewModelPageList(params: getSqlViewModelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSqlViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view-model/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 配置字段映射
 * import { putSqlViewModelById } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface putSqlViewModelByIdPathInterface {
  id: string; // id
}
export async function putSqlViewModelById(path: putSqlViewModelByIdPathInterface, data: SqlViewModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sql-view-model/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}