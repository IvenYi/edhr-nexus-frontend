import { defHttp } from '@/utils/http/axios';
import { FlowAppUpdateReq, ResponseEntity, FlowCategoryDragReq, FlowCreateWithCategoryReq, FlowAppReq } from './model/index';

/**
 * 更新应用
 * import { putAppById } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export interface putAppByIdPathInterface {
  id: string; // ...
}
export async function putAppById(path: putAppByIdPathInterface, data: FlowAppUpdateReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/app/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除应用
 * import { deleteAppById } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export interface deleteAppByIdPathInterface {
  id: string; // ...
}
export async function deleteAppById(path: deleteAppByIdPathInterface, config = {}): Promise<object['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/app/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 分类拖拽
 * import { putCategoryByIdDrag } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export interface putCategoryByIdDragPathInterface {
  id: string; // ...
}
export async function putCategoryByIdDrag(path: putCategoryByIdDragPathInterface, data: FlowCategoryDragReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/category/${path?.id}/drag`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 新建连接流
 * import { postCategoryFlow } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export async function postCategoryFlow(data: FlowCreateWithCategoryReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/category/flow`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取分类
 * import { getCategories } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export async function getCategories(config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/categories`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 新建应用
 * import { postCategoryApp } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export async function postCategoryApp(data: FlowAppReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/category/app`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用列表
 * import { getCategoryApps } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export async function getCategoryApps(config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/category/apps`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用树
 * import { getCategoryTree } from "/@/apis/gct-ipaas/IpaasCategoryController"
 */
export async function getCategoryTree(config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/category/tree`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}