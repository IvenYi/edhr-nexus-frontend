import request from '@mobile/utils/request';
import type { DatasourceMoveRequest, ResponseEntitystring, ResponseEntityDatasourceMoveResponse, ResponseEntityListDatasourceMoveResponse, ResponseEntityPageBaseDatasourceMoveResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatasourceMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMove(data: DatasourceMoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDatasourceMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface deleteDatasourceMoveQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMove(params: deleteDatasourceMoveQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasourceMoveInfo } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface getDatasourceMoveInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveInfo(params: getDatasourceMoveInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDatasourceMoveResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatasourceMoveList } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function getDatasourceMoveList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDatasourceMoveResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 迁移
 * import { postDatasourceMoveMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMoveMove(data: DatasourceMoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move/move`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postDatasourceMovePageList } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMovePageList(data: DatasourceMoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDatasourceMoveResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasourceMoveById } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface putDatasourceMoveByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveById(path: putDatasourceMoveByIdPathInterface, data: DatasourceMoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-move/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}