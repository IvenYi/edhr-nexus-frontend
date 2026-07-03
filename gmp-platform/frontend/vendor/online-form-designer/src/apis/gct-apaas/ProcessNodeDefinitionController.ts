import { defHttp } from '@/utils/http/axios';
import { ProcessNodeDefinitionRequest, ResponseEntitystring, ResponseEntityProcessNodeDefinitionResponse, ResponseEntityListProcessNodeDefinitionResponse, ResponseEntityPageBaseProcessNodeDefinitionResponse } from './model/index';

/**
 * 保存
 * import { postProcessNodeDefinition } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export async function postProcessNodeDefinition(data: ProcessNodeDefinitionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-node-definition`,
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
 * import { deleteProcessNodeDefinition } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface deleteProcessNodeDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessNodeDefinition(params: deleteProcessNodeDefinitionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-node-definition`,
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
 * import { getProcessNodeDefinitionInfo } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface getProcessNodeDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getProcessNodeDefinitionInfo(params: getProcessNodeDefinitionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessNodeDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-node-definition/info`,
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
 * import { getProcessNodeDefinitionList } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export async function getProcessNodeDefinitionList(config = {}): Promise<ResponseEntityListProcessNodeDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-node-definition/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessNodeDefinitionPageList(params: getProcessNodeDefinitionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessNodeDefinitionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-node-definition/page/list`,
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
 * import { putProcessNodeDefinitionById } from "/@/apis/gct-apaas/ProcessNodeDefinitionController"
 */
export interface putProcessNodeDefinitionByIdPathInterface {
  id: string; // id
}
export async function putProcessNodeDefinitionById(path: putProcessNodeDefinitionByIdPathInterface, data: ProcessNodeDefinitionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-node-definition/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}