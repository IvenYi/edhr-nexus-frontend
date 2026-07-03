import request from '@mobile/utils/request';
import type { OnlineFormCategoryRequest, ResponseEntitystring, CategoryDragDTO, ResponseEntity, ResponseEntityOnlineFormCategoryResponse, ResponseEntityListOnlineFormCategoryResponse, ResponseEntityPageBaseOnlineFormCategoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOnlineFormCategory } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function postOnlineFormCategory(data: OnlineFormCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category`,
      method: 'post',
      data,
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
export async function deleteOnlineFormCategory(params: deleteOnlineFormCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { putOnlineFormCategoryDrag } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function putOnlineFormCategoryDrag(data: CategoryDragDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category/drag`,
      method: 'put',
      data,
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
export async function getOnlineFormCategoryInfo(params: getOnlineFormCategoryInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOnlineFormCategoryList } from "/@/apis/gct-apaas/OnlineFormCategoryController"
 */
export async function getOnlineFormCategoryList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category/list`,
      method: 'get',
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
export async function getOnlineFormCategoryPageList(params: getOnlineFormCategoryPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOnlineFormCategoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category/page/list`,
      method: 'get',
      params,
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
export async function putOnlineFormCategoryById(path: putOnlineFormCategoryByIdPathInterface, data: OnlineFormCategoryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-category/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}