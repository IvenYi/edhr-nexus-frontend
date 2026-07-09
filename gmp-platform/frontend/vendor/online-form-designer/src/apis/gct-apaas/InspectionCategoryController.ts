import { defHttp } from '@/utils/http/axios';
import { InspectionCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityInspectionCategoryResponse, ResponseEntityListInspectionCategoryResponse, ResponseEntityPageBaseInspectionCategoryResponse } from './model/index';

/**
 * 保存
 * import { postInspectionCategory } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function postInspectionCategory(data: InspectionCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/inspection-category`,
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
 * import { deleteInspectionCategory } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface deleteInspectionCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteInspectionCategory(params: deleteInspectionCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/inspection-category`,
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
 * import { putInspectionCategoryDrag } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function putInspectionCategoryDrag(data: CategoryDragDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/inspection-category/drag`,
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
 * import { getInspectionCategoryInfo } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface getInspectionCategoryInfoQueryInterface {
  id: string; // id
}
export async function getInspectionCategoryInfo(params: getInspectionCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityInspectionCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/inspection-category/info`,
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
 * import { getInspectionCategoryList } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export async function getInspectionCategoryList(config = {}): Promise<ResponseEntityListInspectionCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/inspection-category/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getInspectionCategoryPageList(params: getInspectionCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseInspectionCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/inspection-category/page/list`,
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
 * import { putInspectionCategoryById } from "/@/apis/gct-apaas/InspectionCategoryController"
 */
export interface putInspectionCategoryByIdPathInterface {
  id: string; // id
}
export async function putInspectionCategoryById(path: putInspectionCategoryByIdPathInterface, data: InspectionCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/inspection-category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}