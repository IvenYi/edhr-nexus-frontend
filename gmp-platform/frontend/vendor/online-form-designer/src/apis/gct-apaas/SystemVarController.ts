import { defHttp } from '@/utils/http/axios';
import { SystemVarRequest, ResponseEntitystring, ResponseEntityListMapstringstring, ResponseEntitySystemVarResponse, ResponseEntityListSystemVarResponse, ResponseEntityPageBaseSystemVarResponse } from './model/index';

/**
 * 保存
 * import { postSystemVar } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function postSystemVar(data: SystemVarRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/system-var`,
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
 * import { deleteSystemVar } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface deleteSystemVarQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSystemVar(params: deleteSystemVarQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/system-var`,
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
 * 根据当前环境获取多个变量的值
 * import { getSystemVarGetSystemVarByKeys } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarGetSystemVarByKeysQueryInterface {
  keys: string; // 要查询的key，多个按','分割
}
export async function getSystemVarGetSystemVarByKeys(params: getSystemVarGetSystemVarByKeysQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/getSystemVarByKeys`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据当前环境获取多个变量的值（包含内置）
 * import { getSystemVarGetVarByKeys } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarGetVarByKeysQueryInterface {
  keys: string; // 要查询的key，多个按','分割
}
export async function getSystemVarGetVarByKeys(params: getSystemVarGetVarByKeysQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/getVarByKeys`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getSystemVarInfo } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarInfoQueryInterface {
  id: string; // id
}
export async function getSystemVarInfo(params: getSystemVarInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySystemVarResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/info`,
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
 * import { getSystemVarList } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function getSystemVarList(config = {}): Promise<ResponseEntityListSystemVarResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表(缓存)
 * import { getSystemVarListSystemVarCache } from "/@/apis/gct-apaas/SystemVarController"
 */
export async function getSystemVarListSystemVarCache(config = {}): Promise<ResponseEntityListSystemVarResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/listSystemVarCache`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSystemVarPageList } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface getSystemVarPageListQueryInterface {
  description?: string; // 备注信息
  endTime?: string; // 结束时间
  key?: string; // key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getSystemVarPageList(params: getSystemVarPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseSystemVarResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/system-var/page/list`,
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
 * import { putSystemVarById } from "/@/apis/gct-apaas/SystemVarController"
 */
export interface putSystemVarByIdPathInterface {
  id: string; // id
}
export async function putSystemVarById(path: putSystemVarByIdPathInterface, data: SystemVarRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/system-var/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}