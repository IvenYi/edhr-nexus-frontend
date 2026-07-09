import request from '@mobile/utils/request';
import type { ServiceOrchestrationVersionLogRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationVersionLogResponse, ResponseEntityListServiceOrchestrationVersionLogResponse, ResponseEntityPageBaseServiceOrchestrationVersionLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postServiceOrchestrationVersionLog } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export async function postServiceOrchestrationVersionLog(data: ServiceOrchestrationVersionLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteServiceOrchestrationVersionLog } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export interface deleteServiceOrchestrationVersionLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteServiceOrchestrationVersionLog(params: deleteServiceOrchestrationVersionLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getServiceOrchestrationVersionLogInfo } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export interface getServiceOrchestrationVersionLogInfoQueryInterface {
  id: string; // id
}
export async function getServiceOrchestrationVersionLogInfo(params: getServiceOrchestrationVersionLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityServiceOrchestrationVersionLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getServiceOrchestrationVersionLogList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export async function getServiceOrchestrationVersionLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListServiceOrchestrationVersionLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getServiceOrchestrationVersionLogPageList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export interface getServiceOrchestrationVersionLogPageListQueryInterface {
  endTime?: string; // 结束时间
  id?: string; // 主键id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  soVersionId?: string; // 服务编排版本id
  startTime?: string; // 开始时间
}
export async function getServiceOrchestrationVersionLogPageList(params: getServiceOrchestrationVersionLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseServiceOrchestrationVersionLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}