import request from '@mobile/utils/request';
import type { ProcessDefinitionRequest, ResponseEntitystring, ResponseEntityProcessDefinitionResponse, ResponseEntityListProcessDefinitionResponse, ResponseEntityPageBaseProcessDefinitionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessDefinition } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export async function postProcessDefinition(data: ProcessDefinitionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessDefinition } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface deleteProcessDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessDefinition(params: deleteProcessDefinitionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessDefinitionInfo } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface getProcessDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getProcessDefinitionInfo(params: getProcessDefinitionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 初始化流程定义和流程版本
 * import { postProcessDefinitionInitProcessAndProcessVersionByType } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface postProcessDefinitionInitProcessAndProcessVersionByTypePathInterface {
  type: string; // 流程类型: 电子表单审批 OF_APPROVE、文控审批 DOC_CONTROL_APPROVE
}
export async function postProcessDefinitionInitProcessAndProcessVersionByType(path: postProcessDefinitionInitProcessAndProcessVersionByTypePathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition/initProcessAndProcessVersion/${path?.type}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessDefinitionList } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export async function getProcessDefinitionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessDefinitionPageList } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface getProcessDefinitionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessDefinitionPageList(params: getProcessDefinitionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessDefinitionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessDefinitionById } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface putProcessDefinitionByIdPathInterface {
  id: string; // id
}
export async function putProcessDefinitionById(path: putProcessDefinitionByIdPathInterface, data: ProcessDefinitionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}