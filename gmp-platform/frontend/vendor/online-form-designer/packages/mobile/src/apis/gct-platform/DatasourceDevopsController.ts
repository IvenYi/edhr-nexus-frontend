import request from '@mobile/utils/request';
import type { DatasourceDevopsRequest, ResponseEntitystring, ResponseEntityDatasourceDevopsResponse, ResponseEntityListDatasourceDevopsResponse, ResponseEntityPageBaseDatasourceDevopsResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatasourceDevops } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevops(data: DatasourceDevopsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDatasourceDevops } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface deleteDatasourceDevopsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceDevops(params: deleteDatasourceDevopsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasourceDevopsInfo } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface getDatasourceDevopsInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceDevopsInfo(params: getDatasourceDevopsInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDatasourceDevopsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { postDatasourceDevopsList } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevopsList(data: DatasourceDevopsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDatasourceDevopsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postDatasourceDevopsPageList } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevopsPageList(data: DatasourceDevopsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDatasourceDevopsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasourceDevopsById } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface putDatasourceDevopsByIdPathInterface {
  id: string; // id
}
export async function putDatasourceDevopsById(path: putDatasourceDevopsByIdPathInterface, data: DatasourceDevopsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/datasource-devops/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}