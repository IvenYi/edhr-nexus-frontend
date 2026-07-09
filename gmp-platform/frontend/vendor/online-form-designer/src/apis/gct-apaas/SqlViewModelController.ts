import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntitySqlViewModelResponse, ResponseEntityListSqlViewModelResponse, ResponseEntityPageBaseSqlViewModelResponse, SqlViewModelRequest } from './model/index';

/**
 * 删除
 * import { deleteSqlViewModel } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface deleteSqlViewModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSqlViewModel(params: deleteSqlViewModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/sql-view-model`,
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
 * 详情
 * import { getSqlViewModelInfo } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export interface getSqlViewModelInfoQueryInterface {
  modelKey?: string; // 表单模型key
}
export async function getSqlViewModelInfo(params: getSqlViewModelInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySqlViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sql-view-model/info`,
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
 * import { getSqlViewModelList } from "/@/apis/gct-apaas/SqlViewModelController"
 */
export async function getSqlViewModelList(config = {}): Promise<ResponseEntityListSqlViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sql-view-model/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getSqlViewModelPageList(params: getSqlViewModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseSqlViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sql-view-model/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putSqlViewModelById(path: putSqlViewModelByIdPathInterface, data: SqlViewModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/sql-view-model/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}