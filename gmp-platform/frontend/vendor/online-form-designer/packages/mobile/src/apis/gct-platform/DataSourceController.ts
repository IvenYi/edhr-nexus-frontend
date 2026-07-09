import request from '@mobile/utils/request';
import type { DataSourceMainRequest, ResponseEntitystring, DataSourceIsEnableRequest, DataSourceUpdateRequest, ResponseEntityint, ResponseEntityDataSourceMainResponse, ResponseEntityListDataSourceMainResponse, ResponseEntityPageBaseDataSourceMainResponse, ResponseEntityListMap, TableColumnDTO, ResponseEntityListColumnInformationSchema, DataSource, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDataSource } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSource(data: DataSourceMainRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDataSource } from "/@/apis/gct-platform/DataSourceController"
 */
export async function putDataSource(data: DataSourceMainRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDataSource } from "/@/apis/gct-platform/DataSourceController"
 */
export interface deleteDataSourceQueryInterface {
  keys: string; // 删除的key，多个按','分割
}
export async function deleteDataSource(params: deleteDataSourceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 启用和禁用
 * import { putDataSourceEnabled } from "/@/apis/gct-platform/DataSourceController"
 */
export async function putDataSourceEnabled(data: DataSourceIsEnableRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/enabled`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 支持DML、DDL
 * import { postDataSourceExecuteUpdate } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceExecuteUpdate(data: DataSourceUpdateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityint['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/executeUpdate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询数据源详情
 * import { getDataSourceFindById } from "/@/apis/gct-platform/DataSourceController"
 */
export interface getDataSourceFindByIdQueryInterface {
  id: string; // id
}
export async function getDataSourceFindById(params: getDataSourceFindByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDataSourceMainResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/findById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDataSourceList } from "/@/apis/gct-platform/DataSourceController"
 */
export interface getDataSourceListQueryInterface {
  name?: string; // 数据源名称
  type?: string; // 数据库类型
}
export async function getDataSourceList(params: getDataSourceListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDataSourceMainResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDataSourcePageList } from "/@/apis/gct-platform/DataSourceController"
 */
export interface getDataSourcePageListQueryInterface {
  name?: string; // 数据源名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type?: string; // 数据库类型
}
export async function getDataSourcePageList(params: getDataSourcePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDataSourceMainResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询数据
 * import { postDataSourceQueryData } from "/@/apis/gct-platform/DataSourceController"
 */
export interface postDataSourceQueryDataQueryInterface {
  env: string; // env
  key: string; // key
  sql: string; // sql
}
export async function postDataSourceQueryData(params: postDataSourceQueryDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMap['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/queryData`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 查询SQL视图表字段信息
 * import { postDataSourceSqlColumnInformation } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceSqlColumnInformation(data: TableColumnDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityListColumnInformationSchema['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/sql/column/information`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 连接测试
 * import { postDataSourceTestConnect } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceTestConnect(data: DataSource, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/data-source/testConnect`,
      method: 'post',
      data,
      ...config,
    },
  );
}