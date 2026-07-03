import { defHttp } from '@/utils/http/axios';
import { DatasourceMoveDetailRequest, ResponseEntitystring, ResponseEntityDatasourceMoveDetailResponse, ResponseEntityListDatasourceMoveDetailResponse, ResponseEntityPageBaseDatasourceMoveDetailResponse } from './model/index';

/**
 * 保存
 * import { postDatasourceMoveDetail } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export async function postDatasourceMoveDetail(data: DatasourceMoveDetailRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/datasource-move-detail`,
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
 * import { deleteDatasourceMoveDetail } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface deleteDatasourceMoveDetailQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasourceMoveDetail(params: deleteDatasourceMoveDetailQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/datasource-move-detail`,
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
 * import { getDatasourceMoveDetailInfo } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailInfoQueryInterface {
  id: string; // id
}
export async function getDatasourceMoveDetailInfo(params: getDatasourceMoveDetailInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDatasourceMoveDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-detail/info`,
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
 * import { getDatasourceMoveDetailList } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailListQueryInterface {
  id: string; // 迁移任务Id
}
export async function getDatasourceMoveDetailList(params: getDatasourceMoveDetailListQueryInterface = {}, config = {}): Promise<ResponseEntityListDatasourceMoveDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-detail/list`,
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
 * import { getDatasourceMoveDetailPageList } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface getDatasourceMoveDetailPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasourceMoveDetailPageList(params: getDatasourceMoveDetailPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDatasourceMoveDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/datasource-move-detail/page/list`,
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
 * import { putDatasourceMoveDetailById } from "/@/apis/gct-platform/DatasourceMoveDetailController"
 */
export interface putDatasourceMoveDetailByIdPathInterface {
  id: string; // id
}
export async function putDatasourceMoveDetailById(path: putDatasourceMoveDetailByIdPathInterface, data: DatasourceMoveDetailRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/datasource-move-detail/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}