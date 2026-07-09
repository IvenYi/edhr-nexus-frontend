import { defHttp } from '@/utils/http/axios';
import { ServiceOrchestrationRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationResponse, ResponseEntityListServiceOrchestrationResponse, ResponseEntityPageBaseServiceOrchestrationResponse } from './model/index';

/**
 * 保存
 * import { postServiceOrchestration } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export async function postServiceOrchestration(data: ServiceOrchestrationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/service-orchestration`,
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
 * import { deleteServiceOrchestration } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export interface deleteServiceOrchestrationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteServiceOrchestration(params: deleteServiceOrchestrationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/service-orchestration`,
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
 * import { getServiceOrchestrationInfo } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export interface getServiceOrchestrationInfoQueryInterface {
  id: string; // id
}
export async function getServiceOrchestrationInfo(params: getServiceOrchestrationInfoQueryInterface = {}, config = {}): Promise<ResponseEntityServiceOrchestrationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration/info`,
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
 * import { getServiceOrchestrationInfoByKey } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export interface getServiceOrchestrationInfoByKeyQueryInterface {
  key: string; // key
}
export async function getServiceOrchestrationInfoByKey(params: getServiceOrchestrationInfoByKeyQueryInterface = {}, config = {}): Promise<ResponseEntityServiceOrchestrationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration/infoByKey`,
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
 * import { getServiceOrchestrationList } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export async function getServiceOrchestrationList(config = {}): Promise<ResponseEntityListServiceOrchestrationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getServiceOrchestrationPageList } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export interface getServiceOrchestrationPageListQueryInterface {
  description?: string; // 页面名称
  endTime?: string; // 结束时间
  id?: string; // 主键id
  key?: string; // 编排key
  name?: string; // 编排名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getServiceOrchestrationPageList(params: getServiceOrchestrationPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseServiceOrchestrationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/service-orchestration/page/list`,
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
 * import { putServiceOrchestrationById } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export interface putServiceOrchestrationByIdPathInterface {
  id: string; // id
}
export async function putServiceOrchestrationById(path: putServiceOrchestrationByIdPathInterface, data: ServiceOrchestrationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/service-orchestration/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}