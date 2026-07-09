import request from '@mobile/utils/request';
import type { PmProcessDefinition, ResponseEntityPmProcessVersion, ResponseEntitystring, ResponseEntityPmProcessDefinition, ResponseEntityListCategoryCompleteResponse, ResponseEntityPageBasePmProcessActiveVersion } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmProcessDefinition } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export async function postPmProcessDefinition(data: PmProcessDefinition, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessVersion['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmProcessDefinition } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface deletePmProcessDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDefinition(params: deletePmProcessDefinitionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPmProcessDefinitionInfo } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface getPmProcessDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDefinitionInfo(params: getPmProcessDefinitionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessDefinition['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取所有流程且含有激活版本
 * import { getPmProcessDefinitionListAllProcHasPublishedVersion } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface getPmProcessDefinitionListAllProcHasPublishedVersionQueryInterface {
  moduleType?: string; // moduleType
}
export async function getPmProcessDefinitionListAllProcHasPublishedVersion(params: getPmProcessDefinitionListAllProcHasPublishedVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition/listAllProcHasPublishedVersion`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表(需含激活版本)
 * import { getPmProcessDefinitionPageList } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface getPmProcessDefinitionPageListQueryInterface {
  categoryId: string; // categoryId
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  query?: string; // query
}
export async function getPmProcessDefinitionPageList(params: getPmProcessDefinitionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessDefinitionPageListByPage } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface getPmProcessDefinitionPageListByPageQueryInterface {
  categoryId: string; // categoryId
  modelKey?: string; // modelKey
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  query?: string; // query
}
export async function getPmProcessDefinitionPageListByPage(params: getPmProcessDefinitionPageListByPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition/page/listByPage`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmProcessDefinitionById } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface putPmProcessDefinitionByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDefinitionById(path: putPmProcessDefinitionByIdPathInterface, data: PmProcessDefinition, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}