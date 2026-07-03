import request from '@mobile/utils/request';
import type { ProductReleaseCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityProductReleaseCategoryResponse, ResponseEntityListProductReleaseCategoryResponse, ResponseEntityPageBaseProductReleaseCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProductReleaseCategory } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function postProductReleaseCategory(data: ProductReleaseCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分类删除
 * import { deleteProductReleaseCategory } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export interface deleteProductReleaseCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteProductReleaseCategory(params: deleteProductReleaseCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { putProductReleaseCategoryDrag } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function putProductReleaseCategoryDrag(data: CategoryDragDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category/drag`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getProductReleaseCategoryInfo } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export interface getProductReleaseCategoryInfoQueryInterface {
  id: string; // id
}
export async function getProductReleaseCategoryInfo(params: getProductReleaseCategoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProductReleaseCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProductReleaseCategoryList } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function getProductReleaseCategoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProductReleaseCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProductReleaseCategoryPageList } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export interface getProductReleaseCategoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProductReleaseCategoryPageList(params: getProductReleaseCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProductReleaseCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProductReleaseCategoryById } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export interface putProductReleaseCategoryByIdPathInterface {
  id: string; // id
}
export async function putProductReleaseCategoryById(path: putProductReleaseCategoryByIdPathInterface, data: ProductReleaseCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/product-release-category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}