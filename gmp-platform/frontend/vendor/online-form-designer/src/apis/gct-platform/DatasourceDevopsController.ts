import { defHttp } from '@/utils/http/axios';
import { DatasourceDevopsRequest, ResponseEntitystring, ResponseEntityDatasourceDevopsResponse, ResponseEntityListDatasourceDevopsResponse, ResponseEntityPageBaseDatasourceDevopsResponse } from './model/index';

/**
 * 保存
 * import { postDatasourceDevops } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevops(data: DatasourceDevopsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-devops`,
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
 * import { deleteDatasourceDevops } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface deleteDatasourceDevopsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceDevops(params: deleteDatasourceDevopsQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/datasource-devops`,
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
 * import { getDatasourceDevopsInfo } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface getDatasourceDevopsInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceDevopsInfo(params: getDatasourceDevopsInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDatasourceDevopsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-devops/info`,
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
 * import { postDatasourceDevopsList } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevopsList(data: DatasourceDevopsRequest, config = {}): Promise<ResponseEntityListDatasourceDevopsResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-devops/list`,
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
 * import { postDatasourceDevopsPageList } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export async function postDatasourceDevopsPageList(data: DatasourceDevopsRequest, config = {}): Promise<ResponseEntityPageBaseDatasourceDevopsResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-devops/page/list`,
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
 * import { putDatasourceDevopsById } from "/@/apis/gct-platform/DatasourceDevopsController"
 */
export interface putDatasourceDevopsByIdPathInterface {
  id: string; // id
}
export async function putDatasourceDevopsById(path: putDatasourceDevopsByIdPathInterface, data: DatasourceDevopsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/datasource-devops/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}