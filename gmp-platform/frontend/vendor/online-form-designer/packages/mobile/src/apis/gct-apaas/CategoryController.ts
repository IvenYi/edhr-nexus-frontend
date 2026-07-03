import request from '@mobile/utils/request';
import type { CategoryRequest, ResponseEntitystring, CategoryDragRequest, ResponseEntityListCategoryCompleteResponse, ResponseEntityCategoryResponse, ResponseEntityListCategoryResponse, ResponseEntityPageBaseCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCategory } from "/@/apis/gct-apaas/CategoryController"
 */
export async function postCategory(data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteCategory } from "/@/apis/gct-apaas/CategoryController"
 */
export interface deleteCategoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategory(params: deleteCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postCategoryDrag } from "/@/apis/gct-apaas/CategoryController"
 */
export async function postCategoryDrag(data: CategoryDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * （分类关联数据） (NDO 名称对象,RDO 版本对象, WORKFLOW 工作流,DYNAMIC_FORM 动态表单,BASE 基础,TREE 树模型 ) 
 * import { getCategoryGetListRdoOrNdo } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryGetListRdoOrNdoQueryInterface {
  modelMetaId?: string; // 当前模型的id
  subModel?: number; // 模型是否为子模型 不传查询全部 (1 子模型, 0 非子模型)
  type: string; // （分类关联数据） (NDO 名称对象,RDO 版本对象, WORKFLOW 工作流,DYNAMIC_FORM 动态表单,BASE 基础,TREE 树模型 )
}
export async function getCategoryGetListRdoOrNdo(params: getCategoryGetListRdoOrNdoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/getListRdoOrNdo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getCategoryInfoById } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryInfoByIdPathInterface {
  id: string; // id
}
export async function getCategoryInfoById(path: getCategoryInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getCategoryList } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryListQueryInterface {
  endTime?: string; // 结束时间
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}
export async function getCategoryList(params: getCategoryListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表（分类关联数据）
 * import { getCategoryListComplete } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryListCompleteQueryInterface {
  createTime?: string; // ...
  createUserId?: string; // ...
  createUserName?: string; // ...
  deleted?: number; // ...
  fullPath?: string; // ...
  id?: string; // ...
  modifyTime?: string; // ...
  modifyUserId?: string; // ...
  modifyUserName?: string; // ...
  name?: string; // ...
  pageId?: string; // 关联的页面id, 当pageId 不为空时 追加pageId 相关数据
  parentId?: string; // 父节点id , 有则传
  procDefId?: string; // ...
  relationId?: string; // ...
  sortNum?: number; // ...
  sysBuiltin?: number; // ...
  type?: string; // ...
}
export async function getCategoryListComplete(params: getCategoryListCompleteQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/listComplete`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 页面列表（分类关联页面数据）
 * import { getCategoryPage } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryPageQueryInterface {
  createTime?: string; // ...
  createUserId?: string; // ...
  createUserName?: string; // ...
  deleted?: number; // ...
  fullPath?: string; // ...
  id?: string; // ...
  modifyTime?: string; // ...
  modifyUserId?: string; // ...
  modifyUserName?: string; // ...
  name?: string; // ...
  pageId?: string; // 关联的页面id, 当pageId 不为空时 追加pageId 相关数据
  parentId?: string; // 父节点id , 有则传
  procDefId?: string; // ...
  relationId?: string; // ...
  sortNum?: number; // ...
  sysBuiltin?: number; // ...
  type?: string; // ...
}
export async function getCategoryPage(params: getCategoryPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/page`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getCategoryPageList } from "/@/apis/gct-apaas/CategoryController"
 */
export interface getCategoryPageListQueryInterface {
  endTime?: string; // 结束时间
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}
export async function getCategoryPageList(params: getCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCategoryById } from "/@/apis/gct-apaas/CategoryController"
 */
export interface putCategoryByIdPathInterface {
  id: string; // id
}
export async function putCategoryById(path: putCategoryByIdPathInterface, data: CategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}