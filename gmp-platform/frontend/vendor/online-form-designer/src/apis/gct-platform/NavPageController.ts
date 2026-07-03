import { defHttp } from '@/utils/http/axios';
import { NavPageRequest, ResponseEntitystring, ResponseEntityNavPageResponse, ResponseEntityListNavPageResponse, ResponseEntityPageBaseNavPageResponse } from './model/index';

/**
 * 保存
 * import { postNavPage } from "/@/apis/gct-platform/NavPageController"
 */
export async function postNavPage(data: NavPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/nav-page`,
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
 * import { deleteNavPage } from "/@/apis/gct-platform/NavPageController"
 */
export interface deleteNavPageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteNavPage(params: deleteNavPageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/nav-page`,
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
 * 详情
 * import { getNavPageInfo } from "/@/apis/gct-platform/NavPageController"
 */
export interface getNavPageInfoQueryInterface {
  id: string; // id
}
export async function getNavPageInfo(params: getNavPageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityNavPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-page/info`,
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
 * import { getNavPageList } from "/@/apis/gct-platform/NavPageController"
 */
export async function getNavPageList(config = {}): Promise<ResponseEntityListNavPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-page/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getNavPagePageList(params: getNavPagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseNavPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-page/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putNavPageUpdateDesignerJsonById(path: putNavPageUpdateDesignerJsonByIdPathInterface, data: NavPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/nav-page/updateDesignerJson/${path?.id}`,
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
 * import { putNavPageById } from "/@/apis/gct-platform/NavPageController"
 */
export interface putNavPageByIdPathInterface {
  id: string; // id
}
export async function putNavPageById(path: putNavPageByIdPathInterface, data: NavPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/nav-page/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}