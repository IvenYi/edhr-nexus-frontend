import { defHttp } from '@/utils/http/axios';
import { ProductReleaseCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityProductReleaseCategoryResponse, ResponseEntityListProductReleaseCategoryResponse, ResponseEntityPageBaseProductReleaseCategoryResponse } from './model/index';

/**
 * 保存
 * import { postProductReleaseCategory } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function postProductReleaseCategory(data: ProductReleaseCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/product-release-category`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteProductReleaseCategory(params: deleteProductReleaseCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/product-release-category`,
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
 * 拖拽
 * import { putProductReleaseCategoryDrag } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function putProductReleaseCategoryDrag(data: CategoryDragDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/product-release-category/drag`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProductReleaseCategoryInfo(params: getProductReleaseCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProductReleaseCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release-category/info`,
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
 * import { getProductReleaseCategoryList } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export async function getProductReleaseCategoryList(config = {}): Promise<ResponseEntityListProductReleaseCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release-category/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProductReleaseCategoryPageList(params: getProductReleaseCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProductReleaseCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/product-release-category/page/list`,
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
 * import { putProductReleaseCategoryById } from "/@/apis/gct-apaas/ProductReleaseCategoryController"
 */
export interface putProductReleaseCategoryByIdPathInterface {
  id: string; // id
}
export async function putProductReleaseCategoryById(path: putProductReleaseCategoryByIdPathInterface, data: ProductReleaseCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/product-release-category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}