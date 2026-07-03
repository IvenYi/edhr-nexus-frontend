import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityPublishedAppDtoResponse, ResponseEntityPageBasePublishedAppDtoResponse } from './model/index';

/**
 * 测试环境应用移除接口
 * import { deleteReleasedAppDeletePublishedAppByTestId } from "/@/apis/gct-platform/PublishedAppController"
 */
export interface deleteReleasedAppDeletePublishedAppByTestIdQueryInterface {
  id: string; // id
}
export async function deleteReleasedAppDeletePublishedAppByTestId(params: deleteReleasedAppDeletePublishedAppByTestIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/released/app/deletePublishedAppByTestId`,
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
 * 企业后台管理禁用应用
 * import { putReleasedAppDisableByAppId } from "/@/apis/gct-platform/PublishedAppController"
 */
export interface putReleasedAppDisableByAppIdPathInterface {
  appId: string; // appId
}
export async function putReleasedAppDisableByAppId(path: putReleasedAppDisableByAppIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/released/app/disable/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putReleasedAppEnableByAppId } from "/@/apis/gct-platform/PublishedAppController"
 */
export interface putReleasedAppEnableByAppIdPathInterface {
  appId: string; // appId
}
export async function putReleasedAppEnableByAppId(path: putReleasedAppEnableByAppIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/released/app/enable/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取已发布应详情
 * import { getReleasedAppPublishedAppGetById } from "/@/apis/gct-platform/PublishedAppController"
 */
export interface getReleasedAppPublishedAppGetByIdQueryInterface {
  id: string; // id
}
export async function getReleasedAppPublishedAppGetById(params: getReleasedAppPublishedAppGetByIdQueryInterface = {}, config = {}): Promise<ResponseEntityPublishedAppDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/released/app/publishedApp/getById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取已发布应用列表
 * import { getReleasedAppPublishedAppList } from "/@/apis/gct-platform/PublishedAppController"
 */
export interface getReleasedAppPublishedAppListQueryInterface {
  appId?: string; // 应用id
  appName?: string; // 应用名称
  endTime?: string; // 结束时间
  env?: string; // 环境标识
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getReleasedAppPublishedAppList(params: getReleasedAppPublishedAppListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePublishedAppDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/released/app/publishedApp/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}