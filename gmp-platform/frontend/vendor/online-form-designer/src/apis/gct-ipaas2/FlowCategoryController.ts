import { defHttp } from '@/utils/http/axios';
import { FlowCategoryRequest, ResponseEntitystring, CategoryDragRequest, ResponseEntityFlowCategoryResponse, ResponseEntityListFlowCategoryResponse, ResponseEntityListCategoryCompleteResponse, ResponseEntityPageBaseFlowCategoryResponse } from './model/index';

/**
 * 保存
 * import { postFlowCategory } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export async function postFlowCategory(data: FlowCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow-category`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteFlowCategory } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface deleteFlowCategoryQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFlowCategory(params: deleteFlowCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/flow-category`,
      params,
    },
    {
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 拖拽
 * import { postFlowCategoryDrag } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export async function postFlowCategoryDrag(data: CategoryDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow-category/drag`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getFlowCategoryInfo } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface getFlowCategoryInfoQueryInterface {
  id: string; // id
}
export async function getFlowCategoryInfo(params: getFlowCategoryInfoQueryInterface = {}, config = {}): Promise<ResponseEntityFlowCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-category/info`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getFlowCategoryList } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface getFlowCategoryListQueryInterface {
  endTime?: string; // 结束时间
  module?: string; // 所属模块(连接流:flow,连接器connector)
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}
export async function getFlowCategoryList(params: getFlowCategoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListFlowCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-category/list`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表（分类关联数据
 * import { getFlowCategoryListComplete } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface getFlowCategoryListCompleteQueryInterface {
  appId?: string; // 应用ID
  branchId?: string; // 分支id
  env?: string; // 应用环境
  id?: string; // ...
  module?: string; // 所属模块(连接流:flow,连接器connector)
  name?: string; // 应用名称
}
export async function getFlowCategoryListComplete(params: getFlowCategoryListCompleteQueryInterface = {}, config = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-category/listComplete`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getFlowCategoryPageList } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface getFlowCategoryPageListQueryInterface {
  endTime?: string; // 结束时间
  module?: string; // 所属模块(连接流:flow,连接器connector)
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  sysBuiltin?: number; // 是否系统内置数据(0普通、1内置)
}
export async function getFlowCategoryPageList(params: getFlowCategoryPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowCategoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-category/page/list`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putFlowCategoryById } from "/@/apis/gct-ipaas2/FlowCategoryController"
 */
export interface putFlowCategoryByIdPathInterface {
  id: string; // id
}
export async function putFlowCategoryById(path: putFlowCategoryByIdPathInterface, data: FlowCategoryRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow-category/${path?.id}`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}