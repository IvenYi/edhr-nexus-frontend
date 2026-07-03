import { defHttp } from '@/utils/http/axios';
import { CategoryRequest, ResponseEntitystring, CategoryDragRequest, ResponseEntityListCategoryCompleteResponse, ResponseEntityCategoryResponse, ResponseEntityListCategoryResponse, ResponseEntityPageBaseCategoryResponse } from './model/index';

/**
 * 保存
 * import { postCategory } from "/@/apis/gct-apaas/CategoryController"
 */
export async function postCategory(data: CategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/category`,
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
 * import { deleteCategory } from "/@/apis/gct-apaas/CategoryController"
 */
export interface deleteCategoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCategory(params: deleteCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/category`,
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
 * import { postCategoryDrag } from "/@/apis/gct-apaas/CategoryController"
 */
export async function postCategoryDrag(data: CategoryDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/category/drag`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCategoryGetListRdoOrNdo(params: getCategoryGetListRdoOrNdoQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/getListRdoOrNdo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCategoryInfoById(path: getCategoryInfoByIdPathInterface, config = {}): Promise<ResponseEntityCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCategoryList(params: getCategoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCategoryListComplete(params: getCategoryListCompleteQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/listComplete`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCategoryPage(params: getCategoryPageQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/page`,
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
export async function getCategoryPageList(params: getCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/category/page/list`,
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
 * import { putCategoryById } from "/@/apis/gct-apaas/CategoryController"
 */
export interface putCategoryByIdPathInterface {
  id: string; // id
}
export async function putCategoryById(path: putCategoryByIdPathInterface, data: CategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/category/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}