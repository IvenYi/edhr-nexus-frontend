import { defHttp } from '@/utils/http/axios';
import { CategoryRelationRequest, ResponseEntitystring, CategoryRelationDragRequest, ResponseEntityCategoryRelationResponse, ResponseEntityListCategoryRelationResponse, ResponseEntityPageBaseCategoryRelationResponse } from './model/index';

/**
 * 保存
 * import { postCategoryRelation } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function postCategoryRelation(data: CategoryRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/category-relation`,
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
 * import { deleteCategoryRelation } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface deleteCategoryRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategoryRelation(params: deleteCategoryRelationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/category-relation`,
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
 * import { postCategoryRelationDrag } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function postCategoryRelationDrag(data: CategoryRelationDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/category-relation/drag`,
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
 * import { getCategoryRelationInfoById } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface getCategoryRelationInfoByIdPathInterface {
  id: string; // id
}
export async function getCategoryRelationInfoById(path: getCategoryRelationInfoByIdPathInterface, config = {}): Promise<ResponseEntityCategoryRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category-relation/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getCategoryRelationList } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export async function getCategoryRelationList(config = {}): Promise<ResponseEntityListCategoryRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category-relation/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getCategoryRelationPageList } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface getCategoryRelationPageListQueryInterface {
  categoryId?: string; // 分类id
  endTime?: string; // 结束时间
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relationId?: string; // 分类关联id
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getCategoryRelationPageList(params: getCategoryRelationPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCategoryRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category-relation/page/list`,
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
 * import { putCategoryRelationById } from "/@/apis/gct-apaas/CategoryRelationController"
 */
export interface putCategoryRelationByIdPathInterface {
  id: string; // id
}
export async function putCategoryRelationById(path: putCategoryRelationByIdPathInterface, data: CategoryRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/category-relation/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}