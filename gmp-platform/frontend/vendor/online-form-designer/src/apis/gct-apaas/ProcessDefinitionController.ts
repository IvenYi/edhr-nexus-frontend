import { defHttp } from '@/utils/http/axios';
import { ProcessDefinitionRequest, ResponseEntitystring, ResponseEntityProcessDefinitionResponse, ResponseEntityListProcessDefinitionResponse, ResponseEntityPageBaseProcessDefinitionResponse } from './model/index';

/**
 * 保存
 * import { postProcessDefinition } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export async function postProcessDefinition(data: ProcessDefinitionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-definition`,
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
 * import { deleteProcessDefinition } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface deleteProcessDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessDefinition(params: deleteProcessDefinitionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-definition`,
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
 * import { getProcessDefinitionInfo } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface getProcessDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getProcessDefinitionInfo(params: getProcessDefinitionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postProcessDefinitionInitProcessAndProcessVersionByType(path: postProcessDefinitionInitProcessAndProcessVersionByTypePathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-definition/initProcessAndProcessVersion/${path?.type}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessDefinitionList } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export async function getProcessDefinitionList(config = {}): Promise<ResponseEntityListProcessDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessDefinitionPageList(params: getProcessDefinitionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition/page/list`,
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
 * import { putProcessDefinitionById } from "/@/apis/gct-apaas/ProcessDefinitionController"
 */
export interface putProcessDefinitionByIdPathInterface {
  id: string; // id
}
export async function putProcessDefinitionById(path: putProcessDefinitionByIdPathInterface, data: ProcessDefinitionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-definition/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}