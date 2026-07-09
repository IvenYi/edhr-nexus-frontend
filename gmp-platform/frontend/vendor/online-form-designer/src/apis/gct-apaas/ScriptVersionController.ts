import { defHttp } from '@/utils/http/axios';
import { ScriptVersionRequest, ResponseEntitystring, ResponseEntityScriptVersionResponse, ResponseEntityListScriptVersionResponse, ResponseEntityPageBaseScriptVersionResponse, VersionActive } from './model/index';

/**
 * 保存
 * import { postScriptVersion } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function postScriptVersion(data: ScriptVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/script-version`,
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
 * import { deleteScriptVersion } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface deleteScriptVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteScriptVersion(params: deleteScriptVersionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/script-version`,
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
 * import { getScriptVersionInfo } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface getScriptVersionInfoQueryInterface {
  id: string; // id
}
export async function getScriptVersionInfo(params: getScriptVersionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityScriptVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-version/info`,
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
 * import { getScriptVersionList } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function getScriptVersionList(config = {}): Promise<ResponseEntityListScriptVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-version/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getScriptVersionPageList } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface getScriptVersionPageListQueryInterface {
  active?: number; // 激活状态
  endTime?: string; // 结束时间
  id?: string; // 主键id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  scriptKey?: string; // 脚本Key
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  version?: string; // 版本
}
export async function getScriptVersionPageList(params: getScriptVersionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseScriptVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-version/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 激活指定版本
 * import { putScriptVersionSetVersionActive } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export async function putScriptVersionSetVersionActive(data: VersionActive, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/script-version/setVersionActive`,
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
 * import { putScriptVersionById } from "/@/apis/gct-apaas/ScriptVersionController"
 */
export interface putScriptVersionByIdPathInterface {
  id: string; // id
}
export async function putScriptVersionById(path: putScriptVersionByIdPathInterface, data: ScriptVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/script-version/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}