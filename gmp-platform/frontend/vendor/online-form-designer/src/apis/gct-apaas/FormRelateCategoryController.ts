import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListCategoryCompleteVO, CategoryRequest, ResponseEntityboolean, ResponseEntityint, CategoryDragDTO, ResponseEntity } from './model/index';

/**
 * 在线表单/eDHR 所有分类树
 * import { getFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface getFormRelateCategoryQueryInterface {
  moduleType: string; // moduleType
}
export async function getFormRelateCategory(params: getFormRelateCategoryQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteVO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/formRelate/category`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 新增
 * import { postFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export async function postFormRelateCategory(data: CategoryRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/formRelate/category`,
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
 * import { deleteFormRelateCategory } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface deleteFormRelateCategoryQueryInterface {
  id: string; // 删除的分类id
  moduleType: string; // 模块类型
}
export async function deleteFormRelateCategory(params: deleteFormRelateCategoryQueryInterface = {}, config = {}): Promise<ResponseEntityint['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/formRelate/category`,
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
 * import { putFormRelateCategoryDrag } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export async function putFormRelateCategoryDrag(data: CategoryDragDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/formRelate/category/drag`,
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
 * import { putFormRelateCategoryById } from "/@/apis/gct-apaas/FormRelateCategoryController"
 */
export interface putFormRelateCategoryByIdPathInterface {
  id: string; // id
}
export async function putFormRelateCategoryById(path: putFormRelateCategoryByIdPathInterface, data: CategoryRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/formRelate/category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}