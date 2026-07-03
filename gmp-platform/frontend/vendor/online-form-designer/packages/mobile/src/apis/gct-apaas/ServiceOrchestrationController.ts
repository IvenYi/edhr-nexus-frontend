import request from '@mobile/utils/request';
import type { ServiceOrchestrationRequest, ResponseEntitystring, ResponseEntityServiceOrchestrationResponse, ResponseEntityListServiceOrchestrationResponse, ResponseEntityPageBaseServiceOrchestrationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postServiceOrchestration } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export async function postServiceOrchestration(data: ServiceOrchestrationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration`,
      method: 'post',
      data,
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
export async function deleteServiceOrchestration(params: deleteServiceOrchestrationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration`,
      method: 'delete',
      params,
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
export async function getServiceOrchestrationInfo(params: getServiceOrchestrationInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityServiceOrchestrationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration/info`,
      method: 'get',
      params,
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
export async function getServiceOrchestrationInfoByKey(params: getServiceOrchestrationInfoByKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityServiceOrchestrationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration/infoByKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getServiceOrchestrationList } from "/@/apis/gct-apaas/ServiceOrchestrationController"
 */
export async function getServiceOrchestrationList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListServiceOrchestrationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration/list`,
      method: 'get',
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
export async function getServiceOrchestrationPageList(params: getServiceOrchestrationPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseServiceOrchestrationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration/page/list`,
      method: 'get',
      params,
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
export async function putServiceOrchestrationById(path: putServiceOrchestrationByIdPathInterface, data: ServiceOrchestrationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/service-orchestration/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}