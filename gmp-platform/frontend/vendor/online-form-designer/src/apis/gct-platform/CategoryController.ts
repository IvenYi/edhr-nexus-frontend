import { defHttp } from '@/utils/http/axios';
import { CategoryRequest, ResponseEntitystring, CategoryDragRequest, ResponseEntityCategoryResponse, ResponseEntityListCategoryResponse, ResponseEntityPageBaseCategoryResponse } from './model/index';

/**
 * 保存
 * import { postCategory } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategory(data: CategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/category`,
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
 * import { deleteCategory } from "/@/apis/gct-platform/CategoryController"
 */
export interface deleteCategoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategory(params: deleteCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/category`,
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
 * 添加默认分类
 * import { postCategoryAddDefaultCusComp } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategoryAddDefaultCusComp(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/category/addDefaultCusComp`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除数据集分类
 * import { deleteCategoryDeleteDatasetCategory } from "/@/apis/gct-platform/CategoryController"
 */
export interface deleteCategoryDeleteDatasetCategoryQueryInterface {
  appId?: string; // 应用Id
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategoryDeleteDatasetCategory(params: deleteCategoryDeleteDatasetCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/category/deleteDatasetCategory`,
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
 * import { postCategoryDrag } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategoryDrag(data: CategoryDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/category/drag`,
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
 * import { getCategoryInfo } from "/@/apis/gct-platform/CategoryController"
 */
export interface getCategoryInfoQueryInterface {
  id: string; // id
}
export async function getCategoryInfo(params: getCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/category/info`,
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
 * import { getCategoryList } from "/@/apis/gct-platform/CategoryController"
 */
export interface getCategoryListQueryInterface {
  assetsModule: string; // assetsModule
}
export async function getCategoryList(params: getCategoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/category/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 数据集分类列表
 * import { getCategoryListDatasetCategory } from "/@/apis/gct-platform/CategoryController"
 */
export interface getCategoryListDatasetCategoryQueryInterface {
  appId: string; // appId
  assetsModule: string; // assetsModule
}
export async function getCategoryListDatasetCategory(params: getCategoryListDatasetCategoryQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/category/listDatasetCategory`,
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
 * import { getCategoryPageList } from "/@/apis/gct-platform/CategoryController"
 */
export interface getCategoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getCategoryPageList(params: getCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/category/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存数据集分类
 * import { postCategorySaveDatasetCategory } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategorySaveDatasetCategory(data: CategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/category/saveDatasetCategory`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCategoryById } from "/@/apis/gct-platform/CategoryController"
 */
export interface putCategoryByIdPathInterface {
  id: string; // id
}
export async function putCategoryById(path: putCategoryByIdPathInterface, data: CategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}