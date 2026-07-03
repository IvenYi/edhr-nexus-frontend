import { defHttp } from '@/utils/http/axios';
import { GlobalMethodRequest, ResponseEntitystring, ResponseEntityLocalDateTime, ResponseEntityGlobalMethodResponse, ResponseEntityListGlobalMethodResponse, ResponseEntityPageBaseGlobalMethodResponse } from './model/index';

/**
 * 保存
 * import { postGlobalMethod } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function postGlobalMethod(data: GlobalMethodRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/global-method`,
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
 * import { deleteGlobalMethod } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface deleteGlobalMethodQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteGlobalMethod(params: deleteGlobalMethodQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/global-method`,
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
 * 获取当前时间
 * import { getGlobalMethodCurrentTime } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function getGlobalMethodCurrentTime(config = {}): Promise<ResponseEntityLocalDateTime['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/global-method/currentTime`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getGlobalMethodInfo } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface getGlobalMethodInfoQueryInterface {
  id: string; // id
}
export async function getGlobalMethodInfo(params: getGlobalMethodInfoQueryInterface = {}, config = {}): Promise<ResponseEntityGlobalMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/global-method/info`,
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
 * import { getGlobalMethodList } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export async function getGlobalMethodList(config = {}): Promise<ResponseEntityListGlobalMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/global-method/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getGlobalMethodPageList } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface getGlobalMethodPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getGlobalMethodPageList(params: getGlobalMethodPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseGlobalMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/global-method/page/list`,
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
 * import { putGlobalMethodById } from "/@/apis/gct-apaas/GlobalMethodController"
 */
export interface putGlobalMethodByIdPathInterface {
  id: string; // id
}
export async function putGlobalMethodById(path: putGlobalMethodByIdPathInterface, data: GlobalMethodRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/global-method/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}