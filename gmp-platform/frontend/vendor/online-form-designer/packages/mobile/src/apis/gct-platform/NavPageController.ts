import request from '@mobile/utils/request';
import type { NavPageRequest, ResponseEntitystring, ResponseEntityNavPageResponse, ResponseEntityListNavPageResponse, ResponseEntityPageBaseNavPageResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postNavPage } from "/@/apis/gct-platform/NavPageController"
 */
export async function postNavPage(data: NavPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteNavPage } from "/@/apis/gct-platform/NavPageController"
 */
export interface deleteNavPageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteNavPage(params: deleteNavPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getNavPageInfo } from "/@/apis/gct-platform/NavPageController"
 */
export interface getNavPageInfoQueryInterface {
  id: string; // id
}
export async function getNavPageInfo(params: getNavPageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityNavPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getNavPageList } from "/@/apis/gct-platform/NavPageController"
 */
export async function getNavPageList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListNavPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getNavPagePageList } from "/@/apis/gct-platform/NavPageController"
 */
export interface getNavPagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getNavPagePageList(params: getNavPagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseNavPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改页面设计Json
 * import { putNavPageUpdateDesignerJsonById } from "/@/apis/gct-platform/NavPageController"
 */
export interface putNavPageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putNavPageUpdateDesignerJsonById(path: putNavPageUpdateDesignerJsonByIdPathInterface, data: NavPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page/updateDesignerJson/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putNavPageById } from "/@/apis/gct-platform/NavPageController"
 */
export interface putNavPageByIdPathInterface {
  id: string; // id
}
export async function putNavPageById(path: putNavPageByIdPathInterface, data: NavPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-page/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}