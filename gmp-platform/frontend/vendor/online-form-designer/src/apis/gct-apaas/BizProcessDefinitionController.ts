import { defHttp } from '@/utils/http/axios';
import { PmProcessDefinition, ResponseEntityPmProcessVersion, ResponseEntitystring, ResponseEntityVoid, ResponseEntityPmProcessDefinition, ResponseEntityPageBasePmProcessActiveVersion } from './model/index';

/**
 * 保存
 * import { postBizProcessDefinition } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export async function postBizProcessDefinition(data: PmProcessDefinition, config = {}): Promise<ResponseEntityPmProcessVersion['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition`,
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
 * import { deleteBizProcessDefinition } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export interface deleteBizProcessDefinitionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizProcessDefinition(params: deleteBizProcessDefinitionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-process-definition`,
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
 * 分类删除
 * import { deleteBizProcessDefinitionDeleteCategory } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export interface deleteBizProcessDefinitionDeleteCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteBizProcessDefinitionDeleteCategory(params: deleteBizProcessDefinitionDeleteCategoryQueryInterface = {}, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-process-definition/deleteCategory`,
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
 * import { getBizProcessDefinitionInfo } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export interface getBizProcessDefinitionInfoQueryInterface {
  id: string; // id
}
export async function getBizProcessDefinitionInfo(params: getBizProcessDefinitionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmProcessDefinition['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-process-definition/info`,
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
 * import { getBizProcessDefinitionPageList } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export interface getBizProcessDefinitionPageListQueryInterface {
  categoryId: string; // categoryId
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  query?: string; // query
}
export async function getBizProcessDefinitionPageList(params: getBizProcessDefinitionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-process-definition/page/list`,
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
 * import { putBizProcessDefinitionById } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export interface putBizProcessDefinitionByIdPathInterface {
  id: string; // id
}
export async function putBizProcessDefinitionById(path: putBizProcessDefinitionByIdPathInterface, data: PmProcessDefinition, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/biz-process-definition/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}