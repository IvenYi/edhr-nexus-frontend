import { defHttp } from '@/utils/http/axios';
import { ServiceOrchestrationVersionLogRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationVersionLogResponse, ResponseEntityListServiceOrchestrationVersionLogResponse, ResponseEntityPageBaseServiceOrchestrationVersionLogResponse } from './model/index';

/**
 * 保存
 * import { postServiceOrchestrationVersionLog } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export async function postServiceOrchestrationVersionLog(data: ServiceOrchestrationVersionLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/service-orchestration-version-log`,
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
 * import { deleteServiceOrchestrationVersionLog } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export interface deleteServiceOrchestrationVersionLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteServiceOrchestrationVersionLog(params: deleteServiceOrchestrationVersionLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/service-orchestration-version-log`,
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
 * import { getServiceOrchestrationVersionLogInfo } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export interface getServiceOrchestrationVersionLogInfoQueryInterface {
  id: string; // id
}
export async function getServiceOrchestrationVersionLogInfo(params: getServiceOrchestrationVersionLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityServiceOrchestrationVersionLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/info`,
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
 * import { getServiceOrchestrationVersionLogList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionLogController"
 */
export async function getServiceOrchestrationVersionLogList(config = {}): Promise<ResponseEntityListServiceOrchestrationVersionLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getServiceOrchestrationVersionLogPageList(params: getServiceOrchestrationVersionLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseServiceOrchestrationVersionLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}