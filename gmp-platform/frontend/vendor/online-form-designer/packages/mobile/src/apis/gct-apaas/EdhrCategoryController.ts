import request from '@mobile/utils/request';
import type { EdhrCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityEdhrCategoryResponse, ResponseEntityListEdhrCategoryResponse, ResponseEntityPageBaseEdhrCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postEdhrCategory } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function postEdhrCategory(data: EdhrCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分类删除
 * import { deleteEdhrCategory } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface deleteEdhrCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteEdhrCategory(params: deleteEdhrCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { putEdhrCategoryDrag } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function putEdhrCategoryDrag(data: CategoryDragDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category/drag`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getEdhrCategoryInfo } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface getEdhrCategoryInfoQueryInterface {
  id: string; // id
}
export async function getEdhrCategoryInfo(params: getEdhrCategoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEdhrCategoryList } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function getEdhrCategoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEdhrCategoryPageList } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface getEdhrCategoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getEdhrCategoryPageList(params: getEdhrCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putEdhrCategoryById } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface putEdhrCategoryByIdPathInterface {
  id: string; // id
}
export async function putEdhrCategoryById(path: putEdhrCategoryByIdPathInterface, data: EdhrCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}