import request from '@mobile/utils/request';
import type { AddDatabaseForm, ResponseEntitystring, ResponseEntityListMapstringobject, ResponseEntityListColumnInformationSchema, ResponseEntityListDataBaseInformationSchema, 数据库数据源查询参数, ResponseEntityAddDatabaseForm, ResponseEntityListAddDatabaseForm, RunSqlForm, ResponseEntityPageMapstringobject, ResponseEntityListTableInformationSchema, ResponseEntityJSONObject, TestDatabaseConnForm } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabase(data: AddDatabaseForm, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建数据库数据源
 * import { postDatabaseAddDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseAddDatabase(data: AddDatabaseForm, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database/addDatabase`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * api数据打平
 * import { postDatabaseApiDataFlatten } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseApiDataFlatten(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/api/database/api-data-flatten`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询表字段信息
 * import { getDatabaseColumnInformation } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseColumnInformationQueryInterface {
  id: string; // 数据源id
  tbName: string; // 表名
}
export async function getDatabaseColumnInformation(params: getDatabaseColumnInformationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListColumnInformationSchema['data']> {
  return request(
    {
      url: `/gct-platform/api/database/column/information`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询数据库列表
 * import { getDatabaseDbInformation } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseDbInformationQueryInterface {
  dbType: string; // dbType
  pool_name: string; // pool_name
}
export async function getDatabaseDbInformation(params: getDatabaseDbInformationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDataBaseInformationSchema['data']> {
  return request(
    {
      url: `/gct-platform/api/database/db/information`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页获取数据库数据源
 * import { postDatabaseGetDatabaseByPage } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseGetDatabaseByPage(data: 数据库数据源查询参数, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/database/getDatabaseByPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 数据源详情
 * import { getDatabaseInfo } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseInfoQueryInterface {
  id: string; // id
}
export async function getDatabaseInfo(params: getDatabaseInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAddDatabaseForm['data']> {
  return request(
    {
      url: `/gct-platform/api/database/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatabaseList } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseListQueryInterface {
  aliasName?: string; // 名称
  appId: string; // 应用id
}
export async function getDatabaseList(params: getDatabaseListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAddDatabaseForm['data']> {
  return request(
    {
      url: `/gct-platform/api/database/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除数据库数据源
 * import { deleteDatabaseRemoveDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export interface deleteDatabaseRemoveDatabaseQueryInterface {
  id: string; // id
}
export async function deleteDatabaseRemoveDatabase(params: deleteDatabaseRemoveDatabaseQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database/removeDatabase`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 运行SQL语句
 * import { postDatabaseRunSql } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseRunSql(data: RunSqlForm, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/database/runSql`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDatabaseTableDataPageList } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseTableDataPageListQueryInterface {
  deleteTag?: boolean; // 是否去除逻辑（delete_=1）删除数据
  id: string; // 数据源id
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  tableName?: string; // 表名
}
export async function getDatabaseTableDataPageList(params: getDatabaseTableDataPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/api/database/table/data/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询数据库表信息
 * import { getDatabaseTableInformation } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseTableInformationQueryInterface {
  id: string; // 数据源id
}
export async function getDatabaseTableInformation(params: getDatabaseTableInformationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableInformationSchema['data']> {
  return request(
    {
      url: `/gct-platform/api/database/table/information`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 测试api数据源
 * import { postDatabaseTestApi } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseTestApi(data: AddDatabaseForm, config:AxiosRequestConfig = {}): Promise<ResponseEntityJSONObject['data']> {
  return request(
    {
      url: `/gct-platform/api/database/testApi`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试数据库连接
 * import { postDatabaseTestDatabaseConn } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseTestDatabaseConn(data: TestDatabaseConnForm, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database/testDatabaseConn`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改数据库数据源
 * import { putDatabaseUpdateDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function putDatabaseUpdateDatabase(data: AddDatabaseForm, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database/updateDatabase`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 查询数据库视图信息
 * import { getDatabaseViewInformation } from "/@/apis/gct-platform/DatabaseController"
 */
export interface getDatabaseViewInformationQueryInterface {
  id: string; // 数据源id
}
export async function getDatabaseViewInformation(params: getDatabaseViewInformationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableInformationSchema['data']> {
  return request(
    {
      url: `/gct-platform/api/database/view/information`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatabaseById } from "/@/apis/gct-platform/DatabaseController"
 */
export interface putDatabaseByIdPathInterface {
  id: string; // id
}
export async function putDatabaseById(path: putDatabaseByIdPathInterface, data: AddDatabaseForm, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/database/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}