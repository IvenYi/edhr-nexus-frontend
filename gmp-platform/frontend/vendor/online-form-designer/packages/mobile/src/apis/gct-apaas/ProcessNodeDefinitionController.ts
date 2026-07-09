import request from '@mobile/utils/request';
import type { ProcessNodeDefinitionRequest, ResponseEntitystring, ResponseEntityProcessNodeDefinitionResponse, ResponseEntityListProcessNodeDefinitionResponse, ResponseEntityPageBaseProcessNodeDefinitionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessNodeDefinition } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export async function postProcessNodeDefinition(data: ProcessNodeDefinitionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessNodeDefinition } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface deleteProcessNodeDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessNodeDefinition(params: deleteProcessNodeDefinitionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessNodeDefinitionInfo } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface getProcessNodeDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getProcessNodeDefinitionInfo(params: getProcessNodeDefinitionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessNodeDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessNodeDefinitionList } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export async function getProcessNodeDefinitionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessNodeDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessNodeDefinitionPageList } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface getProcessNodeDefinitionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessNodeDefinitionPageList(params: getProcessNodeDefinitionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessNodeDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessNodeDefinitionById } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface putProcessNodeDefinitionByIdPathInterface {
  id: string; // id
}
export async function putProcessNodeDefinitionById(path: putProcessNodeDefinitionByIdPathInterface, data: ProcessNodeDefinitionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-node-definition/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}