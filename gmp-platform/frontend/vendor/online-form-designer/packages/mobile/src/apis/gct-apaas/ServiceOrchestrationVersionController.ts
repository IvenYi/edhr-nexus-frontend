import request from '@mobile/utils/request';
import type { ServiceOrchestrationVersionRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationVersionResponse, ResponseEntityListServiceOrchestrationVersionResponse, ResponseEntityPageBaseServiceOrchestrationVersionResponse, VersionActive } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postServiceOrchestrationVersion } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function postServiceOrchestrationVersion(data: ServiceOrchestrationVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version`,
      method: 'post',
      data,
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
export async function deleteServiceOrchestrationVersion(params: deleteServiceOrchestrationVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version`,
      method: 'delete',
      params,
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
export async function getServiceOrchestrationVersionInfo(params: getServiceOrchestrationVersionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityServiceOrchestrationVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getServiceOrchestrationVersionList } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function getServiceOrchestrationVersionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListServiceOrchestrationVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version/list`,
      method: 'get',
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
export async function getServiceOrchestrationVersionPageList(params: getServiceOrchestrationVersionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseServiceOrchestrationVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 激活指定版本
 * import { putServiceOrchestrationVersionSetVersionActive } from "/@/apis/gct-apaas/ServiceOrchestrationVersionController"
 */
export async function putServiceOrchestrationVersionSetVersionActive(data: VersionActive, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version/setVersionActive`,
      method: 'put',
      data,
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
export async function putServiceOrchestrationVersionById(path: putServiceOrchestrationVersionByIdPathInterface, data: ServiceOrchestrationVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration-version/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}