import request from '@mobile/utils/request';
import type { CategoryRelationRequest, ResponseEntitystring, CategoryRelationDragRequest, ResponseEntityCategoryRelationResponse, ResponseEntityListCategoryRelationResponse, ResponseEntityPageBaseCategoryRelationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCategoryRelation } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function postCategoryRelation(data: CategoryRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteCategoryRelation } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface deleteCategoryRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategoryRelation(params: deleteCategoryRelationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postCategoryRelationDrag } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function postCategoryRelationDrag(data: CategoryRelationDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getCategoryRelationInfoById } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface getCategoryRelationInfoByIdPathInterface {
  id: string; // id
}
export async function getCategoryRelationInfoById(path: getCategoryRelationInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityCategoryRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getCategoryRelationList } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function getCategoryRelationList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getCategoryRelationPageList } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface getCategoryRelationPageListQueryInterface {
  categoryId?: string; // 分类id
  endTime?: string; // 结束时间
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relationId?: string; // 分类关联id
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getCategoryRelationPageList(params: getCategoryRelationPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCategoryRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCategoryRelationById } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface putCategoryRelationByIdPathInterface {
  id: string; // id
}
export async function putCategoryRelationById(path: putCategoryRelationByIdPathInterface, data: CategoryRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category-relation/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}