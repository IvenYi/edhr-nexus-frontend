import { defHttp } from '@/utils/http/axios';
import { ScriptVersionLogRequest, ResponseEntitystring, ResponseEntityScriptVersionLogResponse, ResponseEntityPageBaseScriptVersionLogResponse } from './model/index';

/**
 * 保存
 * import { postScriptVersionLog } from "/@/apis/gct-apaas/ScriptVersionLogController"
 */
export async function postScriptVersionLog(data: ScriptVersionLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/script-version-log`,
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
 * import { deleteScriptVersionLog } from "/@/apis/gct-apaas/ScriptVersionLogController"
 */
export interface deleteScriptVersionLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteScriptVersionLog(params: deleteScriptVersionLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/script-version-log`,
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
 * import { getScriptVersionLogInfo } from "/@/apis/gct-apaas/ScriptVersionLogController"
 */
export interface getScriptVersionLogInfoQueryInterface {
  id: string; // id
}
export async function getScriptVersionLogInfo(params: getScriptVersionLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityScriptVersionLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-version-log/info`,
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
 * import { getScriptVersionLogPageList } from "/@/apis/gct-apaas/ScriptVersionLogController"
 */
export interface getScriptVersionLogPageListQueryInterface {
  endTime?: string; // 结束时间
  id?: string; // 主键id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  scriptVersionId?: string; // JS脚本版本id
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getScriptVersionLogPageList(params: getScriptVersionLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseScriptVersionLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-version-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}