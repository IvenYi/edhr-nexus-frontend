import request from '@mobile/utils/request';
import type { InspectionCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityInspectionCategoryResponse, ResponseEntityListInspectionCategoryResponse, ResponseEntityPageBaseInspectionCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postInspectionCategory } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function postInspectionCategory(data: InspectionCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分类删除
 * import { deleteInspectionCategory } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface deleteInspectionCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteInspectionCategory(params: deleteInspectionCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { putInspectionCategoryDrag } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function putInspectionCategoryDrag(data: CategoryDragDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category/drag`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getInspectionCategoryInfo } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface getInspectionCategoryInfoQueryInterface {
  id: string; // id
}
export async function getInspectionCategoryInfo(params: getInspectionCategoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityInspectionCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getInspectionCategoryList } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function getInspectionCategoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListInspectionCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getInspectionCategoryPageList } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface getInspectionCategoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getInspectionCategoryPageList(params: getInspectionCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseInspectionCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putInspectionCategoryById } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface putInspectionCategoryByIdPathInterface {
  id: string; // id
}
export async function putInspectionCategoryById(path: putInspectionCategoryByIdPathInterface, data: InspectionCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/inspection-category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}