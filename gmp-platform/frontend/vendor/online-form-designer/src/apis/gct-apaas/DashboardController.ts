import { defHttp } from '@/utils/http/axios';
import { DashboardRequest, ResponseEntitystring, ResponseEntityDashboardResponse, ResponseEntityListDashboardResponse, DashboardSortRequest, ResponseEntityPageBaseDashboardResponse } from './model/index';

/**
 * 保存
 * import { postDashboard } from "/@/apis/gct-apaas/DashboardController"
 */
export async function postDashboard(data: DashboardRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dashboard`,
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
 * import { deleteDashboard } from "/@/apis/gct-apaas/DashboardController"
 */
export interface deleteDashboardQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDashboard(params: deleteDashboardQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/dashboard`,
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
 * import { getDashboardInfo } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardInfoQueryInterface {
  id: string; // id
}
export async function getDashboardInfo(params: getDashboardInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDashboardResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/dashboard/info`,
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
 * import { getDashboardList } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardListQueryInterface {
  name?: string; // 名称
}
export async function getDashboardList(params: getDashboardListQueryInterface = {}, config = {}): Promise<ResponseEntityListDashboardResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/dashboard/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移动位置
 * import { postDashboardMove } from "/@/apis/gct-apaas/DashboardController"
 */
export async function postDashboardMove(data: DashboardSortRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dashboard/move`,
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
 * import { getDashboardPageList } from "/@/apis/gct-apaas/DashboardController"
 */
export interface getDashboardPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDashboardPageList(params: getDashboardPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDashboardResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/dashboard/page/list`,
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
 * import { putDashboardById } from "/@/apis/gct-apaas/DashboardController"
 */
export interface putDashboardByIdPathInterface {
  id: string; // id
}
export async function putDashboardById(path: putDashboardByIdPathInterface, data: DashboardRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/dashboard/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}