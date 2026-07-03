import { defHttp } from '@/utils/http/axios';
import { DatasourceMoveRequest, ResponseEntitystring, ResponseEntityDatasourceMoveResponse, ResponseEntityListDatasourceMoveResponse, ResponseEntityPageBaseDatasourceMoveResponse } from './model/index';

/**
 * 保存
 * import { postDatasourceMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMove(data: DatasourceMoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-move`,
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
 * import { deleteDatasourceMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface deleteDatasourceMoveQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMove(params: deleteDatasourceMoveQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/datasource-move`,
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
 * import { getDatasourceMoveInfo } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface getDatasourceMoveInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveInfo(params: getDatasourceMoveInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDatasourceMoveResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move/info`,
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
 * import { getDatasourceMoveList } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function getDatasourceMoveList(config = {}): Promise<ResponseEntityListDatasourceMoveResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 迁移
 * import { postDatasourceMoveMove } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMoveMove(data: DatasourceMoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-move/move`,
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
 * import { postDatasourceMovePageList } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export async function postDatasourceMovePageList(data: DatasourceMoveRequest, config = {}): Promise<ResponseEntityPageBaseDatasourceMoveResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-move/page/list`,
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
 * import { putDatasourceMoveById } from "/@/apis/gct-platform/DatasourceMoveController"
 */
export interface putDatasourceMoveByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveById(path: putDatasourceMoveByIdPathInterface, data: DatasourceMoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/datasource-move/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}