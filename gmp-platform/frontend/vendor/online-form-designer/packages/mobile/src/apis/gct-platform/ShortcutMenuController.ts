import request from '@mobile/utils/request';
import type { ShortcutMenuRequest, ResponseEntitystring, ResponseEntityShortcutMenuDtoResponse, ResponseEntityListShortcutMenuDtoResponse, ResponseEntityobject, ResponseEntityPageBaseShortcutMenuResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postShortcutMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function postShortcutMenu(data: ShortcutMenuRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteShortcutMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface deleteShortcutMenuQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteShortcutMenu(params: deleteShortcutMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getShortcutMenuInfo } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuInfoQueryInterface {
  id: string; // id
}
export async function getShortcutMenuInfo(params: getShortcutMenuInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityShortcutMenuDtoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getShortcutMenuList } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function getShortcutMenuList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListShortcutMenuDtoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用菜单列表
 * import { getShortcutMenuListAPpMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuListAPpMenuQueryInterface {
  appId: string; // appId
  terminalType: string; // terminalType
}
export async function getShortcutMenuListAPpMenu(params: getShortcutMenuListAPpMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/list/AppMenu`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getShortcutMenuPageList } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuPageListQueryInterface {
  appId?: string; // 应用id
  endTime?: string; // 结束时间
  env?: string; // ...
  menuId?: string; // 菜单id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  terminalType?: string; // 快捷菜单类型（WEB/MOBILE）
}
export async function getShortcutMenuPageList(params: getShortcutMenuPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseShortcutMenuResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postShortcutMenuSaveBatch } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function postShortcutMenuSaveBatch(data: ShortcutMenuRequest[], config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/saveBatch`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putShortcutMenuById } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface putShortcutMenuByIdPathInterface {
  id: string; // id
}
export async function putShortcutMenuById(path: putShortcutMenuByIdPathInterface, data: ShortcutMenuRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/shortcut/menu/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}