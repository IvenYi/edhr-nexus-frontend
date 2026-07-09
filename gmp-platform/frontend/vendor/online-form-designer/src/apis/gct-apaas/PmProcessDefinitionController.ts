import { defHttp } from '@/utils/http/axios';
import { PmProcessDefinition, ResponseEntityPmProcessVersion, ResponseEntitystring, ResponseEntityPmProcessDefinition, ResponseEntityListCategoryCompleteResponse, ResponseEntityPageBasePmProcessActiveVersion } from './model/index';

/**
 * 保存
 * import { postPmProcessDefinition } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export async function postPmProcessDefinition(data: PmProcessDefinition, config = {}): Promise<ResponseEntityPmProcessVersion['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition`,
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
 * import { deletePmProcessDefinition } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface deletePmProcessDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDefinition(params: deletePmProcessDefinitionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/pm-process-definition`,
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
 * import { getPmProcessDefinitionInfo } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface getPmProcessDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDefinitionInfo(params: getPmProcessDefinitionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmProcessDefinition['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPmProcessDefinitionListAllProcHasPublishedVersion(params: getPmProcessDefinitionListAllProcHasPublishedVersionQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition/listAllProcHasPublishedVersion`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPmProcessDefinitionPageList(params: getPmProcessDefinitionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPmProcessDefinitionPageListByPage(params: getPmProcessDefinitionPageListByPageQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition/page/listByPage`,
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
 * import { putPmProcessDefinitionById } from "/@/apis/gct-apaas/PmProcessDefinitionController"
 */
export interface putPmProcessDefinitionByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDefinitionById(path: putPmProcessDefinitionByIdPathInterface, data: PmProcessDefinition, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/pm-process-definition/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}