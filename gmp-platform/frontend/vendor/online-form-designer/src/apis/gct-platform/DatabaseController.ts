import { defHttp } from '@/utils/http/axios';
import { AddDatabaseForm, ResponseEntitystring, ResponseEntityListMapstringobject, ResponseEntityListColumnInformationSchema, ResponseEntityListDataBaseInformationSchema, 数据库数据源查询参数, ResponseEntityAddDatabaseForm, ResponseEntityListAddDatabaseForm, RunSqlForm, ResponseEntityPageMapstringobject, ResponseEntityListTableInformationSchema, ResponseEntityJSONObject, TestDatabaseConnForm } from './model/index';

/**
 * 保存
 * import { postDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabase(data: AddDatabaseForm, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建数据库数据源
 * import { postDatabaseAddDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseAddDatabase(data: AddDatabaseForm, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/addDatabase`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * api数据打平
 * import { postDatabaseApiDataFlatten } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseApiDataFlatten(data: any, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/api-data-flatten`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseColumnInformation(params: getDatabaseColumnInformationQueryInterface = {}, config = {}): Promise<ResponseEntityListColumnInformationSchema['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/column/information`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseDbInformation(params: getDatabaseDbInformationQueryInterface = {}, config = {}): Promise<ResponseEntityListDataBaseInformationSchema['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/db/information`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页获取数据库数据源
 * import { postDatabaseGetDatabaseByPage } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseGetDatabaseByPage(data: 数据库数据源查询参数, config = {}): Promise<object['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/getDatabaseByPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseInfo(params: getDatabaseInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAddDatabaseForm['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseList(params: getDatabaseListQueryInterface = {}, config = {}): Promise<ResponseEntityListAddDatabaseForm['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteDatabaseRemoveDatabase(params: deleteDatabaseRemoveDatabaseQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/database/removeDatabase`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 运行SQL语句
 * import { postDatabaseRunSql } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseRunSql(data: RunSqlForm, config = {}): Promise<object['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/runSql`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseTableDataPageList(params: getDatabaseTableDataPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/table/data/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseTableInformation(params: getDatabaseTableInformationQueryInterface = {}, config = {}): Promise<ResponseEntityListTableInformationSchema['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/table/information`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试api数据源
 * import { postDatabaseTestApi } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseTestApi(data: AddDatabaseForm, config = {}): Promise<ResponseEntityJSONObject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/testApi`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试数据库连接
 * import { postDatabaseTestDatabaseConn } from "/@/apis/gct-platform/DatabaseController"
 */
export async function postDatabaseTestDatabaseConn(data: TestDatabaseConnForm, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/database/testDatabaseConn`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改数据库数据源
 * import { putDatabaseUpdateDatabase } from "/@/apis/gct-platform/DatabaseController"
 */
export async function putDatabaseUpdateDatabase(data: AddDatabaseForm, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/database/updateDatabase`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatabaseViewInformation(params: getDatabaseViewInformationQueryInterface = {}, config = {}): Promise<ResponseEntityListTableInformationSchema['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/database/view/information`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putDatabaseById(path: putDatabaseByIdPathInterface, data: AddDatabaseForm, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/database/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}