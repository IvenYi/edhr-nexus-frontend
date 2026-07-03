import { defHttp } from '@/utils/http/axios';
import { DataSourceMainRequest, ResponseEntitystring, DataSourceIsEnableRequest, DataSourceUpdateRequest, ResponseEntityint, ResponseEntityDataSourceMainResponse, ResponseEntityListDataSourceMainResponse, ResponseEntityPageBaseDataSourceMainResponse, ResponseEntityListMap, TableColumnDTO, ResponseEntityListColumnInformationSchema, DataSource, ResponseEntityboolean } from './model/index';

/**
 * 保存
 * import { postDataSource } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSource(data: DataSourceMainRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-source`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDataSource } from "/@/apis/gct-platform/DataSourceController"
 */
export async function putDataSource(data: DataSourceMainRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/data-source`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteDataSource(params: deleteDataSourceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/data-source`,
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
 * 启用和禁用
 * import { putDataSourceEnabled } from "/@/apis/gct-platform/DataSourceController"
 */
export async function putDataSourceEnabled(data: DataSourceIsEnableRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/data-source/enabled`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 支持DML、DDL
 * import { postDataSourceExecuteUpdate } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceExecuteUpdate(data: DataSourceUpdateRequest, config = {}): Promise<ResponseEntityint['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-source/executeUpdate`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDataSourceFindById(params: getDataSourceFindByIdQueryInterface = {}, config = {}): Promise<ResponseEntityDataSourceMainResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-source/findById`,
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
 * import { getDataSourceList } from "/@/apis/gct-platform/DataSourceController"
 */
export interface getDataSourceListQueryInterface {
  name?: string; // 数据源名称
  type?: string; // 数据库类型
}
export async function getDataSourceList(params: getDataSourceListQueryInterface = {}, config = {}): Promise<ResponseEntityListDataSourceMainResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-source/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDataSourcePageList(params: getDataSourcePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDataSourceMainResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/data-source/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postDataSourceQueryData(params: postDataSourceQueryDataQueryInterface = {}, config = {}): Promise<ResponseEntityListMap['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-source/queryData`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询SQL视图表字段信息
 * import { postDataSourceSqlColumnInformation } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceSqlColumnInformation(data: TableColumnDTO, config = {}): Promise<ResponseEntityListColumnInformationSchema['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-source/sql/column/information`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 连接测试
 * import { postDataSourceTestConnect } from "/@/apis/gct-platform/DataSourceController"
 */
export async function postDataSourceTestConnect(data: DataSource, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/data-source/testConnect`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}