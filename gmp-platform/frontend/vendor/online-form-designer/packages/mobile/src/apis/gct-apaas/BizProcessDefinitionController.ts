import request from '@mobile/utils/request';
import type { PmProcessDefinition, ResponseEntityPmProcessVersion, ResponseEntitystring, ResponseEntityVoid, ResponseEntityPmProcessDefinition, ResponseEntityPageBasePmProcessActiveVersion } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postBizProcessDefinition } from "/@/apis/gct-apaas/BizProcessDefinitionController"
 */
export async function postBizProcessDefinition(data: PmProcessDefinition, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessVersion['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition`,
      method: 'post',
      data,
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
export async function deleteBizProcessDefinition(params: deleteBizProcessDefinitionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition`,
      method: 'delete',
      params,
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
export async function deleteBizProcessDefinitionDeleteCategory(params: deleteBizProcessDefinitionDeleteCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition/deleteCategory`,
      method: 'delete',
      params,
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
export async function getBizProcessDefinitionInfo(params: getBizProcessDefinitionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessDefinition['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition/info`,
      method: 'get',
      params,
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
export async function getBizProcessDefinitionPageList(params: getBizProcessDefinitionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessActiveVersion['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition/page/list`,
      method: 'get',
      params,
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
export async function putBizProcessDefinitionById(path: putBizProcessDefinitionByIdPathInterface, data: PmProcessDefinition, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}