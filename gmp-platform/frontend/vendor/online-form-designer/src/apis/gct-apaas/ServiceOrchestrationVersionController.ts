import { defHttp } from '@/utils/http/axios';
import { ServiceOrchestrationVersionRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationVersionResponse, ResponseEntityListServiceOrchestrationVersionResponse, ResponseEntityPageBaseServiceOrchestrationVersionResponse, VersionActive } from './model/index';

/**
 * 保存
 * import { postServiceOrchestrationVersion } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function postServiceOrchestrationVersion(data: ServiceOrchestrationVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/service-orchestration-version`,
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
 * import { deleteServiceOrchestrationVersion } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export interface deleteServiceOrchestrationVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteServiceOrchestrationVersion(params: deleteServiceOrchestrationVersionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/service-orchestration-version`,
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
 * import { getServiceOrchestrationVersionInfo } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export interface getServiceOrchestrationVersionInfoQueryInterface {
  id: string; // id
}
export async function getServiceOrchestrationVersionInfo(params: getServiceOrchestrationVersionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityServiceOrchestrationVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version/info`,
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
 * import { getServiceOrchestrationVersionList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function getServiceOrchestrationVersionList(config = {}): Promise<ResponseEntityListServiceOrchestrationVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getServiceOrchestrationVersionPageList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export interface getServiceOrchestrationVersionPageListQueryInterface {
  active?: number; // 是否启用
  endTime?: string; // 结束时间
  id?: string; // 主键Id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  soKey?: string; // 服务编排Key
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  version?: string; // 服务编排版本
}
export async function getServiceOrchestrationVersionPageList(params: getServiceOrchestrationVersionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseServiceOrchestrationVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration-version/page/list`,
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
 * import { putServiceOrchestrationVersionSetVersionActive } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function putServiceOrchestrationVersionSetVersionActive(data: VersionActive, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/service-orchestration-version/setVersionActive`,
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
 * import { putServiceOrchestrationVersionById } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export interface putServiceOrchestrationVersionByIdPathInterface {
  id: string; // id
}
export async function putServiceOrchestrationVersionById(path: putServiceOrchestrationVersionByIdPathInterface, data: ServiceOrchestrationVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/service-orchestration-version/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}