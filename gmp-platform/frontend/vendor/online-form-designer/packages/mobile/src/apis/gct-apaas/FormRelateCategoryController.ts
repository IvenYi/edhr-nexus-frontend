import request from '@mobile/utils/request';
import type { ResponseEntityListCategoryCompleteVO, CategoryRequest, ResponseEntityboolean, ResponseEntityint, CategoryDragDTO, ResponseEntity } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 在线表单/eDHR 所有分类树
 * import { getFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface getFormRelateCategoryQueryInterface {
  moduleType: string; // moduleType
}
export async function getFormRelateCategory(params: getFormRelateCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteVO['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/category`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 新增
 * import { postFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export async function postFormRelateCategory(data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/category`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分类删除
 * import { deleteFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface deleteFormRelateCategoryQueryInterface {
  id: string; // 删除的分类id
  moduleType: string; // 模块类型
}
export async function deleteFormRelateCategory(params: deleteFormRelateCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityint['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { putFormRelateCategoryDrag } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export async function putFormRelateCategoryDrag(data: CategoryDragDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/category/drag`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putFormRelateCategoryById } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface putFormRelateCategoryByIdPathInterface {
  id: string; // id
}
export async function putFormRelateCategoryById(path: putFormRelateCategoryByIdPathInterface, data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}