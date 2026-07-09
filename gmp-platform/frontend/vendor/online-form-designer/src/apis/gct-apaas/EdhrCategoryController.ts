import { defHttp } from '@/utils/http/axios';
import { EdhrCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityEdhrCategoryResponse, ResponseEntityListEdhrCategoryResponse, ResponseEntityPageBaseEdhrCategoryResponse } from './model/index';

/**
 * 保存
 * import { postEdhrCategory } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function postEdhrCategory(data: EdhrCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-category`,
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
 * import { deleteEdhrCategory } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface deleteEdhrCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteEdhrCategory(params: deleteEdhrCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-category`,
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
 * import { putEdhrCategoryDrag } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function putEdhrCategoryDrag(data: CategoryDragDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-category/drag`,
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
 * import { getEdhrCategoryInfo } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface getEdhrCategoryInfoQueryInterface {
  id: string; // id
}
export async function getEdhrCategoryInfo(params: getEdhrCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityEdhrCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-category/info`,
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
 * import { getEdhrCategoryList } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export async function getEdhrCategoryList(config = {}): Promise<ResponseEntityListEdhrCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-category/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getEdhrCategoryPageList(params: getEdhrCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEdhrCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-category/page/list`,
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
 * import { putEdhrCategoryById } from "/@/apis/gct-apaas/EdhrCategoryController"
 */
export interface putEdhrCategoryByIdPathInterface {
  id: string; // id
}
export async function putEdhrCategoryById(path: putEdhrCategoryByIdPathInterface, data: EdhrCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}