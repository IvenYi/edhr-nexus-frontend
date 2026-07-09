import request from '@mobile/utils/request';
import type { DatasourceMoveDataRequest, ResponseEntitystring, ResponseEntityDatasourceMoveDataResponse, ResponseEntityListDatasourceMoveDataResponse, ResponseEntityPageBaseDatasourceMoveDataResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatasourceMoveData } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export async function postDatasourceMoveData(data: DatasourceMoveDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDatasourceMoveData } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface deleteDatasourceMoveDataQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMoveData(params: deleteDatasourceMoveDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasourceMoveDataInfo } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveDataInfo(params: getDatasourceMoveDataInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDatasourceMoveDataResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatasourceMoveDataList } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataListQueryInterface {
  id: string; // 迁移任务detail的Id
}
export async function getDatasourceMoveDataList(params: getDatasourceMoveDataListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDatasourceMoveDataResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDatasourceMoveDataPageList } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataPageListQueryInterface {
  id: string; // 迁移任务detail的Id
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasourceMoveDataPageList(params: getDatasourceMoveDataPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDatasourceMoveDataResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasourceMoveDataById } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface putDatasourceMoveDataByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveDataById(path: putDatasourceMoveDataByIdPathInterface, data: DatasourceMoveDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move-data/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}