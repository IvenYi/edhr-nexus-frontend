import request from '@mobile/utils/request';
import type { NavMenuRequest, ResponseEntitystring, ResponseEntityNavMenuResponse, ResponseEntityListNavMenuResponse, ResponseEntityPageBaseNavMenuResponse, SingleRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postNavMenu } from "/@/apis/gct-platform/NavMenuController"
 */
export async function postNavMenu(data: NavMenuRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteNavMenu } from "/@/apis/gct-platform/NavMenuController"
 */
export interface deleteNavMenuQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteNavMenu(params: deleteNavMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 查询选中的
 * import { getNavMenuGetSelected } from "/@/apis/gct-platform/NavMenuController"
 */
export async function getNavMenuGetSelected(config:AxiosRequestConfig = {}): Promise<ResponseEntityNavMenuResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/getSelected`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getNavMenuInfo } from "/@/apis/gct-platform/NavMenuController"
 */
export interface getNavMenuInfoQueryInterface {
  id: string; // id
}
export async function getNavMenuInfo(params: getNavMenuInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityNavMenuResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getNavMenuList } from "/@/apis/gct-platform/NavMenuController"
 */
export async function getNavMenuList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListNavMenuResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getNavMenuPageList } from "/@/apis/gct-platform/NavMenuController"
 */
export interface getNavMenuPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getNavMenuPageList(params: getNavMenuPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseNavMenuResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 选中页面，不传id代表都不选中
 * import { postNavMenuSelect } from "/@/apis/gct-platform/NavMenuController"
 */
export async function postNavMenuSelect(data: SingleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/select`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改页面设计Json
 * import { putNavMenuUpdateDesignerJsonById } from "/@/apis/gct-platform/NavMenuController"
 */
export interface putNavMenuUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putNavMenuUpdateDesignerJsonById(path: putNavMenuUpdateDesignerJsonByIdPathInterface, data: NavMenuRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/updateDesignerJson/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putNavMenuById } from "/@/apis/gct-platform/NavMenuController"
 */
export interface putNavMenuByIdPathInterface {
  id: string; // id
}
export async function putNavMenuById(path: putNavMenuByIdPathInterface, data: NavMenuRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/nav-menu/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}