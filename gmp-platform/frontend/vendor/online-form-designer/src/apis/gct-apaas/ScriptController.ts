import { defHttp } from '@/utils/http/axios';
import { ScriptRequest, ResponseEntitystring, ResponseEntityScriptResponse, ResponseEntityListScriptResponse, ResponseEntityPageBaseScriptResponse } from './model/index';

/**
 * 保存
 * import { postScript } from "/@/apis/gct-apaas/ScriptController"
 */
export async function postScript(data: ScriptRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/script`,
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
 * import { deleteScript } from "/@/apis/gct-apaas/ScriptController"
 */
export interface deleteScriptQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteScript(params: deleteScriptQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/script`,
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
 * import { getScriptInfo } from "/@/apis/gct-apaas/ScriptController"
 */
export interface getScriptInfoQueryInterface {
  id: string; // id
}
export async function getScriptInfo(params: getScriptInfoQueryInterface = {}, config = {}): Promise<ResponseEntityScriptResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情(key查询)
 * import { getScriptInfoByKey } from "/@/apis/gct-apaas/ScriptController"
 */
export interface getScriptInfoByKeyQueryInterface {
  key: string; // key
}
export async function getScriptInfoByKey(params: getScriptInfoByKeyQueryInterface = {}, config = {}): Promise<ResponseEntityScriptResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script/infoByKey`,
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
 * import { getScriptList } from "/@/apis/gct-apaas/ScriptController"
 */
export async function getScriptList(config = {}): Promise<ResponseEntityListScriptResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getScriptPageList } from "/@/apis/gct-apaas/ScriptController"
 */
export interface getScriptPageListQueryInterface {
  description?: string; // 页面描述
  endTime?: string; // 结束时间
  id?: string; // 主键id
  key?: string; // 页面key
  name?: string; // 页面名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getScriptPageList(params: getScriptPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseScriptResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script/page/list`,
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
 * import { putScriptById } from "/@/apis/gct-apaas/ScriptController"
 */
export interface putScriptByIdPathInterface {
  id: string; // id
}
export async function putScriptById(path: putScriptByIdPathInterface, data: ScriptRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/script/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}