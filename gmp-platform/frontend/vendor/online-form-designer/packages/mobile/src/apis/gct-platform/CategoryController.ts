import request from '@mobile/utils/request';
import type { CategoryRequest, ResponseEntitystring, CategoryDragRequest, ResponseEntityCategoryResponse, ResponseEntityListCategoryResponse, ResponseEntityPageBaseCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCategory } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategory(data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category`,
      method: 'post',
      data,
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
export async function deleteCategory(params: deleteCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 添加默认分类
 * import { postCategoryAddDefaultCusComp } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategoryAddDefaultCusComp(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category/addDefaultCusComp`,
      method: 'post',
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
export async function deleteCategoryDeleteDatasetCategory(params: deleteCategoryDeleteDatasetCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category/deleteDatasetCategory`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postCategoryDrag } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategoryDrag(data: CategoryDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category/drag`,
      method: 'post',
      data,
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
export async function getCategoryInfo(params: getCategoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCategoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/category/info`,
      method: 'get',
      params,
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
export async function getCategoryList(params: getCategoryListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/category/list`,
      method: 'get',
      params,
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
export async function getCategoryListDatasetCategory(params: getCategoryListDatasetCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/category/listDatasetCategory`,
      method: 'get',
      params,
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
export async function getCategoryPageList(params: getCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCategoryResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/category/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存数据集分类
 * import { postCategorySaveDatasetCategory } from "/@/apis/gct-platform/CategoryController"
 */
export async function postCategorySaveDatasetCategory(data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category/saveDatasetCategory`,
      method: 'post',
      data,
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
export async function putCategoryById(path: putCategoryByIdPathInterface, data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}