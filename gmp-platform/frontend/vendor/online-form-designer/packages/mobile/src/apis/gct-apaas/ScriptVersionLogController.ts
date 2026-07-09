import request from '@mobile/utils/request';
import type { ScriptVersionLogRequest, ResponseEntitystring, ResponseEntityScriptVersionLogResponse, ResponseEntityPageBaseScriptVersionLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postScriptVersionLog } from "/@/apis/gct-apaas/ScriptVersionLogController"
 */
export async function postScriptVersionLog(data: ScriptVersionLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version-log`,
      method: 'post',
      data,
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
export async function deleteScriptVersionLog(params: deleteScriptVersionLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version-log`,
      method: 'delete',
      params,
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
export async function getScriptVersionLogInfo(params: getScriptVersionLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityScriptVersionLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version-log/info`,
      method: 'get',
      params,
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
export async function getScriptVersionLogPageList(params: getScriptVersionLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseScriptVersionLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-version-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}