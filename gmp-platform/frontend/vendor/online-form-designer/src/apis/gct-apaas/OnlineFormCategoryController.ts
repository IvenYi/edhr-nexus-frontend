import { defHttp } from '@/utils/http/axios';
import { OnlineFormCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityOnlineFormCategoryResponse, ResponseEntityListOnlineFormCategoryResponse, ResponseEntityPageBaseOnlineFormCategoryResponse } from './model/index';

/**
 * 保存
 * import { postOnlineFormCategory } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function postOnlineFormCategory(data: OnlineFormCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-category`,
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
 * import { deleteOnlineFormCategory } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export interface deleteOnlineFormCategoryQueryInterface {
  id: string; // 删除的分类id
}
export async function deleteOnlineFormCategory(params: deleteOnlineFormCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-form-category`,
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
 * import { putOnlineFormCategoryDrag } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function putOnlineFormCategoryDrag(data: CategoryDragDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-category/drag`,
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
 * import { getOnlineFormCategoryInfo } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export interface getOnlineFormCategoryInfoQueryInterface {
  id: string; // id
}
export async function getOnlineFormCategoryInfo(params: getOnlineFormCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-category/info`,
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
 * import { getOnlineFormCategoryList } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function getOnlineFormCategoryList(config = {}): Promise<ResponseEntityListOnlineFormCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-category/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOnlineFormCategoryPageList } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export interface getOnlineFormCategoryPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOnlineFormCategoryPageList(params: getOnlineFormCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-category/page/list`,
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
 * import { putOnlineFormCategoryById } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export interface putOnlineFormCategoryByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormCategoryById(path: putOnlineFormCategoryByIdPathInterface, data: OnlineFormCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}