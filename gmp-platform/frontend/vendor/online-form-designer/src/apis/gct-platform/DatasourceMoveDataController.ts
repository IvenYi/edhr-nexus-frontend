import { defHttp } from '@/utils/http/axios';
import { DatasourceMoveDataRequest, ResponseEntitystring, ResponseEntityDatasourceMoveDataResponse, ResponseEntityListDatasourceMoveDataResponse, ResponseEntityPageBaseDatasourceMoveDataResponse } from './model/index';

/**
 * 保存
 * import { postDatasourceMoveData } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export async function postDatasourceMoveData(data: DatasourceMoveDataRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-move-data`,
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
 * import { deleteDatasourceMoveData } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface deleteDatasourceMoveDataQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMoveData(params: deleteDatasourceMoveDataQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/datasource-move-data`,
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
 * import { getDatasourceMoveDataInfo } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveDataInfo(params: getDatasourceMoveDataInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDatasourceMoveDataResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-data/info`,
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
 * import { getDatasourceMoveDataList } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataListQueryInterface {
  id: string; // 迁移任务detail的Id
}
export async function getDatasourceMoveDataList(params: getDatasourceMoveDataListQueryInterface = {}, config = {}): Promise<ResponseEntityListDatasourceMoveDataResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-data/list`,
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
 * import { getDatasourceMoveDataPageList } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface getDatasourceMoveDataPageListQueryInterface {
  id: string; // 迁移任务detail的Id
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasourceMoveDataPageList(params: getDatasourceMoveDataPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDatasourceMoveDataResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-data/page/list`,
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
 * import { putDatasourceMoveDataById } from "/@/apis/gct-platform/DatasourceMoveDataController"
 */
export interface putDatasourceMoveDataByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveDataById(path: putDatasourceMoveDataByIdPathInterface, data: DatasourceMoveDataRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/datasource-move-data/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}